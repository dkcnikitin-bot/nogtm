/* ============================================================
   🔐 LOGIN.JS - Authentication Logic
   Enhanced with validation and better UX
   ============================================================ */

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
    initPasswordToggle();
    initRememberMe();
});

function initLoginForm() {
    const loginForm = DOM.find('#loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        
        // Add input validation
        const inputs = loginForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateInput(input));
            input.addEventListener('input', () => {
                DOM.removeClass(input, 'is-invalid');
                const errorDiv = input.parentElement.querySelector('.invalid-feedback');
                if (errorDiv) DOM.hide(errorDiv);
            });
        });
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
// REMEMBER ME
// ============================================================

function initRememberMe() {
    const rememberCheckbox = DOM.find('#rememberMe');
    const savedEmail = Storage.get('rememberedEmail');
    
    if (rememberCheckbox && savedEmail) {
        const emailInput = DOM.find('#loginEmail');
        if (emailInput) {
            DOM.val(emailInput, savedEmail);
            rememberCheckbox.checked = true;
        }
    }
}

// ============================================================
// INPUT VALIDATION
// ============================================================

function validateInput(input) {
    const value = DOM.val(input);
    const type = input.type;
    const name = input.name;
    let isValid = true;
    let errorMessage = '';

    // Remove previous error state
    DOM.removeClass(input, 'is-invalid');
    
    if (name === 'email') {
        if (!Validator.required(value)) {
            isValid = false;
            errorMessage = 'Email обязателен для заполнения';
        } else if (!Validator.email(value)) {
            isValid = false;
            errorMessage = 'Неверный формат email';
        }
    } else if (name === 'password') {
        if (!Validator.required(value)) {
            isValid = false;
            errorMessage = 'Пароль обязателен для заполнения';
        } else if (!Validator.password(value)) {
            isValid = false;
            errorMessage = 'Пароль должен содержать минимум 6 символов';
        }
    }

    // Show error if invalid
    if (!isValid) {
        DOM.addClass(input, 'is-invalid');
        
        // Find or create error feedback element
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
// LOGIN HANDLER
// ============================================================

async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const emailInput = DOM.find('#loginEmail');
    const passwordInput = DOM.find('#loginPassword');
    const rememberCheckbox = DOM.find('#rememberMe');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const email = DOM.val(emailInput);
    const password = DOM.val(passwordInput);
    
    // Validate all inputs
    let isValid = true;
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        toast.warning('Пожалуйста, исправьте ошибки в форме');
        return;
    }

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';

    try {
        // Sign in with Firebase
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Handle remember me
        if (rememberCheckbox && rememberCheckbox.checked) {
            Storage.set('rememberedEmail', email);
        } else {
            Storage.remove('rememberedEmail');
        }

        // Check email verification
        if (!user.emailVerified) {
            toast.warning('Пожалуйста, подтвердите ваш email. Проверьте почту.', {
                duration: 7000
            });
        }

        // Success message
        toast.success(`Добро пожаловать, ${user.email}!`);

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        const errorMessage = ErrorHandler.authError(error);
        
        // Show error
        toast.error(errorMessage, {
            title: 'Ошибка входа',
            duration: 7000
        });

        // Shake animation on form
        const formCard = form.closest('.auth-card');
        if (formCard) {
            formCard.style.animation = 'none';
            formCard.offsetHeight; // Trigger reflow
            formCard.style.animation = 'shake 0.5s ease';
        }

        // Focus on first error field
        if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found') {
            emailInput.focus();
        } else if (error.code === 'auth/wrong-password') {
            passwordInput.focus();
            passwordInput.select();
        }

    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ============================================================
// PASSWORD RESET
// ============================================================

async function resetPassword() {
    const emailInput = DOM.find('#loginEmail');
    const email = DOM.val(emailInput);

    if (!email) {
        toast.warning('Пожалуйста, введите email для восстановления пароля');
        emailInput.focus();
        return;
    }

    if (!Validator.email(email)) {
        toast.error('Неверный формат email');
        emailInput.focus();
        return;
    }

    const confirmed = await toast.confirm(
        `Отправить ссылку для восстановления пароля на email ${email}?`,
        {
            title: 'Восстановление пароля',
            confirmText: 'Отправить',
            cancelText: 'Отмена'
        }
    );

    if (confirmed) {
        try {
            await auth.sendPasswordResetEmail(email);
            toast.success('Ссылка для восстановления пароля отправлена на вашу почту', {
                duration: 7000
            });
        } catch (error) {
            ErrorHandler.handle(error, 'password reset');
        }
    }
}

// ============================================================
// SOCIAL LOGIN
// ============================================================

async function loginWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        
        toast.success('Вход через Google выполнен успешно!');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } catch (error) {
        ErrorHandler.handle(error, 'Google login');
    }
}

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.resetPassword = resetPassword;
window.loginWithGoogle = loginWithGoogle;

console.log('🔐 Login.js загружен');