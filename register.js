/* ============================================================
   📝 REGISTER.JS - Registration Logic
   Enhanced with validation and better UX
   ============================================================ */

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initRegisterForm();
    initPasswordStrength();
    initPasswordToggle();
    initPhoneMask();
});

function initRegisterForm() {
    const registerForm = DOM.find('#registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // Add input validation
        const inputs = registerForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateInput(input));
            input.addEventListener('input', () => {
                DOM.removeClass(input, 'is-invalid');
                const errorDiv = input.parentElement.querySelector('.invalid-feedback');
                if (errorDiv) DOM.hide(errorDiv);
            });
        });

        // Password match validation
        const passwordInput = DOM.find('#registerPassword');
        const confirmInput = DOM.find('#registerPasswordConfirm');
        
        if (passwordInput && confirmInput) {
            confirmInput.addEventListener('input', () => {
                validatePasswordMatch(passwordInput, confirmInput);
            });
        }
    }
}

// ============================================================
// PASSWORD TOGGLE
// ============================================================

function initPasswordToggle() {
    const toggleBtns = DOM.findAll('.password-toggle');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            const icon = btn.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                DOM.removeClass(icon, 'fa-eye');
                DOM.addClass(icon, 'fa-eye-slash');
            } else {
                input.type = 'password';
                DOM.removeClass(icon, 'fa-eye-slash');
                DOM.addClass(icon, 'fa-eye');
            }
        });
    });
}

// ============================================================
// PASSWORD STRENGTH INDICATOR
// ============================================================

function initPasswordStrength() {
    const passwordInput = DOM.find('#registerPassword');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const password = DOM.val(passwordInput);
            updatePasswordStrength(password);
        });
    }
}

function updatePasswordStrength(password) {
    const strengthBar = DOM.find('#passwordStrength');
    const strengthText = DOM.find('#passwordStrengthText');
    
    if (!strengthBar) return;

    let strength = 0;
    let text = '';
    let color = '';

    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    switch (strength) {
        case 0:
        case 1:
            text = 'Слабый';
            color = '#dc3545';
            break;
        case 2:
        case 3:
            text = 'Средний';
            color = '#ffc107';
            break;
        case 4:
        case 5:
            text = 'Сильный';
            color = '#28a745';
            break;
    }

    const percentage = (strength / 5) * 100;
    strengthBar.style.width = percentage + '%';
    strengthBar.style.backgroundColor = color;

    if (strengthText) {
        DOM.text(strengthText, text);
        strengthText.style.color = color;
    }
}

// ============================================================
// PHONE MASK
// ============================================================

function initPhoneMask() {
    const phoneInput = DOM.find('#registerPhone');
    
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
// INPUT VALIDATION
// ============================================================

function validateInput(input) {
    const value = DOM.val(input);
    const name = input.name;
    const type = input.type;
    let isValid = true;
    let errorMessage = '';

    // Remove previous error state
    DOM.removeClass(input, 'is-invalid');

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

        case 'email':
            if (!Validator.required(value)) {
                isValid = false;
                errorMessage = 'Email обязателен для заполнения';
            } else if (!Validator.email(value)) {
                isValid = false;
                errorMessage = 'Неверный формат email';
            }
            break;

        case 'phone':
            if (!Validator.required(value)) {
                isValid = false;
                errorMessage = 'Телефон обязателен для заполнения';
            } else if (!Validator.phone(value)) {
                isValid = false;
                errorMessage = 'Неверный формат телефона';
            }
            break;

        case 'password':
            if (!Validator.required(value)) {
                isValid = false;
                errorMessage = 'Пароль обязателен для заполнения';
            } else if (!Validator.password(value)) {
                isValid = false;
                errorMessage = 'Пароль должен содержать минимум 6 символов';
            }
            break;

        case 'passwordConfirm':
            const passwordInput = DOM.find('#registerPassword');
            if (passwordInput) {
                validatePasswordMatch(passwordInput, input);
            }
            break;

        case 'tariff':
            if (!Validator.required(value)) {
                isValid = false;
                errorMessage = 'Выберите тариф обучения';
            }
            break;
    }

    // Show error if invalid
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

function validatePasswordMatch(passwordInput, confirmInput) {
    const password = DOM.val(passwordInput);
    const confirm = DOM.val(confirmInput);

    if (confirm && password !== confirm) {
        DOM.addClass(confirmInput, 'is-invalid');
        
        let errorFeedback = confirmInput.parentElement.querySelector('.invalid-feedback');
        if (!errorFeedback) {
            errorFeedback = DOM.create('div', { className: 'invalid-feedback' }, 'Пароли не совпадают');
            confirmInput.parentElement.appendChild(errorFeedback);
        } else {
            DOM.text(errorFeedback, 'Пароли не совпадают');
            DOM.show(errorFeedback);
        }
        return false;
    } else {
        DOM.removeClass(confirmInput, 'is-invalid');
        const errorFeedback = confirmInput.parentElement.querySelector('.invalid-feedback');
        if (errorFeedback) DOM.hide(errorFeedback);
        return true;
    }
}

// ============================================================
// REGISTER HANDLER
// ============================================================

async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const name = DOM.val(DOM.find('#registerName'));
    const surname = DOM.val(DOM.find('#registerSurname'));
    const email = DOM.val(DOM.find('#registerEmail'));
    const phone = DOM.val(DOM.find('#registerPhone'));
    const password = DOM.val(DOM.find('#registerPassword'));
    const passwordConfirm = DOM.val(DOM.find('#registerPasswordConfirm'));
    const tariff = DOM.val(DOM.find('#registerTariff'));
    const agreeTerms = DOM.find('#agreeTerms');

    // Validate all inputs
    let isValid = true;
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    // Check terms agreement
    if (agreeTerms && !agreeTerms.checked) {
        toast.warning('Необходимо согласиться с условиями использования');
        isValid = false;
    }

    if (!isValid) {
        toast.warning('Пожалуйста, исправьте ошибки в форме');
        return;
    }
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';

    try {
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const userId = userCredential.user.uid;
        
        // Prepare user data
        const userData = {
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
            phone: phone.trim(),
            tariff: tariff,
            role: 'student',
            progress: 0,
            createdAt: new Date().toISOString(),
            emailVerified: false
        };

        // Save user data to Realtime Database
        await db.ref(DB_PATHS.USERS + '/' + userId).set(userData);

        // Send verification email
        await userCredential.user.sendEmailVerification();

        // Success message
        toast.success('Регистрация успешна! Проверьте вашу почту для подтверждения аккаунта.', {
            duration: 7000
        });
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        const errorMessage = ErrorHandler.authError(error);
        
        toast.error(errorMessage, {
            title: 'Ошибка регистрации',
            duration: 7000
        });

        // Shake animation on form
        const formCard = form.closest('.auth-card');
        if (formCard) {
            formCard.style.animation = 'none';
            formCard.offsetHeight; // Trigger reflow
            formCard.style.animation = 'shake 0.5s ease';
        }

    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

console.log('📝 Register.js загружен');

// Получение сообщения об ошибке
function getErrorMessage(code) {
    const errors = {
        'auth/invalid-email': 'Неверный формат email',
        'auth/email-already-in-use': 'Этот email уже зарегистрирован',
        'auth/weak-password': 'Пароль должен содержать минимум 6 символов',
        'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже'
    };
    return errors[code] || 'Произошла ошибка. Попробуйте снова.';
}

// Отслеживание состояния авторизации
auth.onAuthStateChanged((user) => {
    if (user) {
        // Пользователь уже авторизован, перенаправляем в личный кабинет
        if (window.location.pathname.endsWith('register.html')) {
            window.location.href = 'dashboard.html';
        }
    }
});
