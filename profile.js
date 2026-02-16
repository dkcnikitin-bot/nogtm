// Проверка авторизации
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        loadProfile();
        loadStatistics();
    }
});

// Загрузка профиля
function loadProfile() {
    const userId = auth.currentUser.uid;
    
    db.ref(DB_PATHS.USERS + '/' + userId).once('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
            // Отображение информации
            document.getElementById('profileName').textContent = 
                `${userData.name || ''} ${userData.surname || ''}`.trim() || 'Ученик';
            document.getElementById('profileEmail').textContent = userData.email || '';
            
            // Заполнение формы редактирования
            document.getElementById('editName').value = userData.name || '';
            document.getElementById('editSurname').value = userData.surname || '';
            document.getElementById('editEmail').value = userData.email || '';
            document.getElementById('editPhone').value = userData.phone || '';
        }
    });
}

// Загрузка статистики
async function loadStatistics() {
    const userId = auth.currentUser.uid;
    
    // Прогресс
    db.ref(DB_PATHS.USERS + '/' + userId + '/progress').once('value', (snapshot) => {
        const progress = snapshot.val() || 0;
        document.getElementById('profileProgress').textContent = progress + '%';
    });
    
    // Пройденные уроки
    db.ref(DB_PATHS.PROGRESS + '/' + userId + '/completedLessons').once('value', (snapshot) => {
        const completedLessons = snapshot.val() || {};
        document.getElementById('completedLessons').textContent = Object.keys(completedLessons).length;
    });
    
    // Пройденные тесты
    db.ref(DB_PATHS.TEST_RESULTS).orderByChild('userId').equalTo(userId).once('value', (snapshot) => {
        const results = snapshot.val() || {};
        document.getElementById('completedTests').textContent = Object.keys(results).length;
    });
}

// Сохранение профиля
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = auth.currentUser.uid;
    
    try {
        await db.ref(DB_PATHS.USERS + '/' + userId).update({
            name: document.getElementById('editName').value,
            surname: document.getElementById('editSurname').value,
            phone: document.getElementById('editPhone').value
        });
        
        alert('Профиль успешно обновлен!');
        loadProfile();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
});

// Смена пароля
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('Новые пароли не совпадают');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Пароль должен содержать минимум 6 символов');
        return;
    }
    
    try {
        const user = auth.currentUser;
        
        // Повторная авторизация для смены пароля
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPassword);
        
        alert('Пароль успешно изменен!');
        document.getElementById('passwordForm').reset();
    } catch (error) {
        if (error.code === 'auth/wrong-password') {
            alert('Неверный текущий пароль');
        } else {
            alert('Ошибка: ' + error.message);
        }
    }
});

// Выход
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}
