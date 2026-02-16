// Форма входа
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Проверяем роль пользователя
        const userSnapshot = await db.ref(DB_PATHS.USERS + '/' + user.uid).once('value');
        const userData = userSnapshot.val();
        
        if (userData && userData.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        errorDiv.textContent = getErrorMessage(error.code);
        errorDiv.classList.remove('d-none');
    }
});

// Быстрый вход администратора
async function loginAsAdmin() {
    const errorDiv = document.getElementById('loginError');
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        const user = userCredential.user;
        
        // Проверяем роль
        const userSnapshot = await db.ref(DB_PATHS.USERS + '/' + user.uid).once('value');
        const userData = userSnapshot.val();
        
        if (userData && userData.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            // Обновляем роль на admin
            await db.ref(DB_PATHS.USERS + '/' + user.uid).update({ role: 'admin' });
            window.location.href = 'admin.html';
        }
    } catch (error) {
        errorDiv.textContent = 'Ошибка входа: ' + getErrorMessage(error.code);
        errorDiv.classList.remove('d-none');
    }
}

// Получение сообщения об ошибке
function getErrorMessage(code) {
    const errors = {
        'auth/invalid-email': 'Неверный формат email',
        'auth/user-disabled': 'Аккаунт отключен',
        'auth/user-not-found': 'Пользователь не найден',
        'auth/wrong-password': 'Неверный пароль',
        'auth/email-already-in-use': 'Email уже используется',
        'auth/weak-password': 'Пароль слишком слабый',
        'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже'
    };
    return errors[code] || 'Произошла ошибка. Попробуйте снова.';
}

// Отслеживание состояния авторизации
auth.onAuthStateChanged((user) => {
    if (user) {
        db.ref(DB_PATHS.USERS + '/' + user.uid).once('value', (snapshot) => {
            const userData = snapshot.val();
            if (userData && userData.role === 'admin') {
                if (window.location.pathname.endsWith('login.html')) {
                    window.location.href = 'admin.html';
                }
            } else if (window.location.pathname.endsWith('login.html')) {
                window.location.href = 'dashboard.html';
            }
        });
    }
});
