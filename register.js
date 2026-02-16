// Форма регистрации
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const surname = document.getElementById('registerSurname').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const errorDiv = document.getElementById('registerError');
    
    // Проверка паролей
    if (password !== passwordConfirm) {
        errorDiv.textContent = 'Пароли не совпадают';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    try {
        // Создаем пользователя в Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const userId = userCredential.user.uid;
        
        // Сохраняем данные в Realtime Database
        await db.ref(DB_PATHS.USERS + '/' + userId).set({
            name: name,
            surname: surname,
            email: email,
            phone: phone,
            role: 'student',
            progress: 0,
            createdAt: new Date().toISOString()
        });
        
        alert('Регистрация успешна! Теперь вы можете войти в систему.');
        window.location.href = 'login.html';
    } catch (error) {
        errorDiv.textContent = getErrorMessage(error.code);
        errorDiv.classList.remove('d-none');
    }
});

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
