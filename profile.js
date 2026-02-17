/* ============================================================
   👤 PROFILE.JS - Profile Management Logic
   Enhanced with validation and better UX
   ============================================================ */

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initProfile();
});

function initProfile() {
    console.log('👤 Загрузка профиля...');
    
    // Show loading
    showProfileLoading();
    
    // Check authentication
    auth.onAuthStateChanged((user) => {
        if (!user) {
            toast.warning('Необходимо авторизоваться');
            window.location.href = 'login.html';
        } else {
            loadProfileData();
            initProfileForms();
        }
    });
}

// ============================================================
// LOADING STATES
// ============================================================

function showProfileLoading() {
    const container = DOM.find('.profile');
    if (!container) return;

    const sections = DOM.find('.profile-info, .profile-edit, .profile-stats, .password-change');
    if (sections) {
        sections.forEach(section => {
            Loading.skeleton(section, 1);
        });
    }
}

function hideProfileLoading() {
    const container = DOM.find('.profile');
    if (!container) return;

    Loading.removeSkeletons(container);
}

// ============================================================
// LOAD PROFILE DATA
// ============================================================

async function loadProfileData() {
    try {
        const userId = auth.currentUser.uid;

        // Load profile info
        await loadProfileInfo(userId);

        // Load statistics
        await loadProfileStatistics(userId);

        // Hide loading
        hideProfileLoading();

        console.log('✅ Профиль загружен');
    } catch (error) {
        hideProfileLoading();
        ErrorHandler.handle(error, 'profile loading');
    }
}

// ============================================================
// LOAD PROFILE INFO
// ============================================================

async function loadProfileInfo(userId) {
    const snapshot = await db.ref(DB_PATHS.USERS + '/' + userId).once('value');
    const userData = snapshot.val();

    if (userData) {
        // Display profile info
        const nameElement = DOM.find('#profileName');
        if (nameElement) {
            const fullName = `${userData.name || ''} ${userData.surname || ''}`.trim();
            DOM.text(nameElement, fullName || 'Ученик');
        }

        const emailElement = DOM.find('#profileEmail');
        if (emailElement) {
            DOM.text(emailElement, userData.email || '');
        }

        const phoneElement = DOM.find('#profilePhone');
        if (phoneElement) {
            DOM.text(phoneElement, userData.phone || 'Не указан');
        }

        const tariffElement = DOM.find('#profileTariff');
        if (tariffElement && userData.tariff) {
            const tariffNames = {
                'basic': 'Базовый',
                'standard': 'Стандарт',
                'vip': 'VIP'
            };
            DOM.text(tariffElement, tariffNames[userData.tariff] || userData.tariff);
        }

        const joinedElement = DOM.find('#profileJoined');
        if (joinedElement && userData.createdAt) {
            DOM.text(joinedElement, Formatter.date(userData.createdAt, 'long'));
        }

        // Fill edit form
        const editName = DOM.find('#editName');
        if (editName) DOM.val(editName, userData.name || '');

        const editSurname = DOM.find('#editSurname');
        if (editSurname) DOM.val(editSurname, userData.surname || '');

        const editEmail = DOM.find('#editEmail');
        if (editEmail) DOM.val(editEmail, userData.email || '');

        const editPhone = DOM.find('#editPhone');
        if (editPhone) DOM.val(editPhone, userData.phone || '');
    }
}

// ============================================================
// LOAD PROFILE STATISTICS
// ============================================================

async function loadProfileStatistics(userId) {
    // Progress
    const progressSnapshot = await db.ref(DB_PATHS.USERS + '/' + userId + '/progress').once('value');
    const progress = progressSnapshot.val() || 0;

    const progressElement = DOM.find('#profileProgress');
    if (progressElement) {
        DOM.text(progressElement, progress + '%');
    }

    const progressBar = DOM.find('#profileProgressBar');
    if (progressBar) {
        progressBar.style.width = progress + '%';
        setTimeout(() => {
            progressBar.style.transition = 'width 1s ease';
        }, 100);
    }

    // Completed lessons
    const lessonsSnapshot = await db.ref(DB_PATHS.PROGRESS + '/' + userId + '/completedLessons').once('value');
    const completedLessons = lessonsSnapshot.val() || {};

    const lessonsElement = DOM.find('#completedLessons');
    if (lessonsElement) {
        animateNumber(lessonsElement, Object.keys(completedLessons).length);
    }

    // Completed tests
    const testsSnapshot = await db.ref(DB_PATHS.TEST_RESULTS).orderByChild('userId').equalTo(userId).once('value');
    const testResults = testsSnapshot.val() || {};

    const testsElement = DOM.find('#completedTests');
    if (testsElement) {
        animateNumber(testsElement, Object.keys(testResults).length);
    }

    // Calculate average test score
    const scores = Object.values(testResults).map(result => result.score || 0);
    const averageScore = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
        : 0;

    const avgScoreElement = DOM.find('#averageScore');
    if (avgScoreElement) {
        animateNumber(avgScoreElement, averageScore);
    }
}

// ============================================================
// INIT PROFILE FORMS
// ============================================================

function initProfileForms() {
    // Profile edit form
    const profileForm = DOM.find('#profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
        
        // Add validation
        const inputs = profileForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateProfileInput(input));
            input.addEventListener('input', () => {
                DOM.removeClass(input, 'is-invalid');
                const errorDiv = input.parentElement.querySelector('.invalid-feedback');
                if (errorDiv) DOM.hide(errorDiv);
            });
        });
    }

    // Password change form
    const passwordForm = DOM.find('#passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
        
        // Add validation
        const inputs = passwordForm.querySelectorAll('input[type="password"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                DOM.removeClass(input, 'is-invalid');
                const errorDiv = input.parentElement.querySelector('.invalid-feedback');
                if (errorDiv) DOM.hide(errorDiv);
            });
        });
    }

    // Phone mask
    initPhoneMask();
}

// ============================================================
// PHONE MASK
// ============================================================

function initPhoneMask() {
    const phoneInput = DOM.find('#editPhone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value[0] === '7' || value[0] === '8') {
                    value = value.substring(1);
                }
                
                let formatted = '+7';
                
                if (value.length > 0) {
                    formatted += ' (' + value.substring(0, 3);
                }
                if (value.length > 3) {
                    formatted += ') ' + value.substring(3, 6);
                }
                if (value.length > 6) {
                    formatted += '-' + value.substring(6, 8);
                }
                if (value.length > 8) {
                    formatted += '-' + value.substring(8, 10);
                }
                
                e.target.value = formatted;
            }
        });
    }
}

// ============================================================
// VALIDATE PROFILE INPUT
// ============================================================

function validateProfileInput(input) {
    const name = input.name;
    const value = DOM.val(input);
    let isValid = true;
    let errorMessage = '';

    switch (name) {
        case 'name':
            if (!Validator.required(value)) {
                isValid = false;
                errorMessage = 'Имя обязательно для заполнения';
            } else if (!Validator.name(value)) {
                isValid = false;
                errorMessage = 'Имя может содержать только буквы';
            }
            break;

        case 'surname':
            if (!Validator.required(value)) {
                isValid = false;
                errorMessage = 'Фамилия обязательна для заполнения';
            } else if (!Validator.name(value)) {
                isValid = false;
                errorMessage = 'Фамилия может содержать только буквы';
            }
            break;

        case 'phone':
            if (value && !Validator.phone(value)) {
                isValid = false;
                errorMessage = 'Неверный формат телефона';
            }
            break;
    }

    if (!isValid) {
        DOM.addClass(input, 'is-invalid');
        
        let errorFeedback = input.parentElement.querySelector('.invalid-feedback');
        if (!errorFeedback) {
            errorFeedback = DOM.create('div', { className: 'invalid-feedback' }, errorMessage);
            input.parentElement.appendChild(errorFeedback);
        } else {
            DOM.text(errorFeedback, errorMessage);
            DOM.show(errorFeedback);
        }
    }

    return isValid;
}

// ============================================================
// HANDLE PROFILE UPDATE
// ============================================================

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const name = DOM.val(DOM.find('#editName'));
    const surname = DOM.val(DOM.find('#editSurname'));
    const phone = DOM.val(DOM.find('#editPhone'));

    // Validate
    let isValid = true;
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        if (!validateProfileInput(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        toast.warning('Пожалуйста, исправьте ошибки в форме');
        return;
    }

    // Show loading
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сохранение...';

    try {
        const userId = auth.currentUser.uid;

        await db.ref(DB_PATHS.USERS + '/' + userId).update({
            name: name.trim(),
            surname: surname.trim(),
            phone: phone.trim()
        });

        toast.success('Профиль успешно обновлен!');
        
        // Reload profile info
        await loadProfileInfo(userId);

    } catch (error) {
        ErrorHandler.handle(error, 'profile update');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ============================================================
// HANDLE PASSWORD CHANGE
// ============================================================

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const currentPassword = DOM.val(DOM.find('#currentPassword'));
    const newPassword = DOM.val(DOM.find('#newPassword'));
    const confirmPassword = DOM.val(DOM.find('#confirmPassword'));

    // Validate
    if (!Validator.required(currentPassword)) {
        toast.warning('Введите текущий пароль');
        return;
    }

    if (!Validator.required(newPassword)) {
        toast.warning('Введите новый пароль');
        return;
    }

    if (!Validator.password(newPassword)) {
        toast.error('Новый пароль должен содержать минимум 6 символов');
        return;
    }

    if (newPassword !== confirmPassword) {
        toast.error('Новые пароли не совпадают');
        return;
    }

    // Confirm password change
    const confirmed = await toast.confirm(
        'Вы уверены, что хотите изменить пароль?',
        {
            title: 'Смена пароля',
            confirmText: 'Изменить',
            cancelText: 'Отмена'
        }
    );

    if (!confirmed) return;

    // Show loading
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Изменение...';

    try {
        const user = auth.currentUser;

        // Reauthenticate with current password
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

        await user.reauthenticateWithCredential(credential);

        // Update password
        await user.updatePassword(newPassword);

        toast.success('Пароль успешно изменен!');
        form.reset();

    } catch (error) {
        if (error.code === 'auth/wrong-password') {
            toast.error('Неверный текущий пароль');
        } else {
            ErrorHandler.handle(error, 'password change');
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ============================================================
// ANIMATE NUMBER
// ============================================================

function animateNumber(element, target, duration = 1000) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (target - start) * easeOutQuart);
        
        DOM.text(element, current);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ============================================================
// DELETE ACCOUNT
// ============================================================

async function deleteAccount() {
    const confirmed = await toast.confirm(
        'Вы уверены, что хотите удалить аккаунт? Это действие необратимо и приведет к потере всех данных.',
        {
            title: 'Удаление аккаунта',
            confirmText: 'Удалить',
            cancelText: 'Отмена',
            type: 'error'
        }
    );

    if (confirmed) {
        const password = prompt('Введите ваш пароль для подтверждения удаления:');
        
        if (!password) {
            toast.warning('Удаление отменено');
            return;
        }

        try {
            const user = auth.currentUser;

            // Reauthenticate
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                password
            );

            await user.reauthenticateWithCredential(credential);

            // Delete user data from database
            await db.ref(DB_PATHS.USERS + '/' + user.uid).remove();
            await db.ref(DB_PATHS.PROGRESS + '/' + user.uid).remove();

            // Delete auth account
            await user.delete();

            toast.success('Аккаунт успешно удален');
            window.location.href = 'index.html';

        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                toast.error('Неверный пароль');
            } else {
                ErrorHandler.handle(error, 'account deletion');
            }
        }
    }
}

// ============================================================
// LOGOUT
// ============================================================

function logout() {
    toast.confirm('Вы уверены, что хотите выйти из аккаунта?', {
        title: 'Выход',
        confirmText: 'Выйти',
        cancelText: 'Отмена'
    }).then((confirmed) => {
        if (confirmed) {
            auth.signOut()
                .then(() => {
                    toast.success('Вы успешно вышли из системы');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                })
                .catch((error) => {
                    ErrorHandler.handle(error, 'logout');
                });
        }
    });
}

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.deleteAccount = deleteAccount;
window.logout = logout;

console.log('👤 Profile.js загружен');