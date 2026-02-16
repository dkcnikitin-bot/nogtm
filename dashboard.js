// Проверка авторизации
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        loadUserData();
        loadModules();
        loadProgress();
    }
});

// Загрузка данных пользователя
function loadUserData() {
    const userId = auth.currentUser.uid;
    db.ref(DB_PATHS.USERS + '/' + userId).once('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
            document.getElementById('userName').textContent = userData.name || 'Ученик';
        }
    });
}

// Загрузка модулей
function loadModules() {
    db.ref(DB_PATHS.MODULES).once('value', (snapshot) => {
        const modules = snapshot.val() || {};
        const container = document.getElementById('modulesContainer');
        
        const sortedModules = Object.entries(modules)
            .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));
        
        container.innerHTML = sortedModules.map(([id, module]) => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="module-card">
                    <span class="module-number">${module.order || ''}</span>
                    <h5>${module.name || ''}</h5>
                    <p class="text-muted small mb-3">${module.description || ''}</p>
                    <button class="btn btn-primary w-100" onclick="openModule('${id}')">
                        <i class="fas fa-book-open"></i> Открыть модуль
                    </button>
                </div>
            </div>
        `).join('');
    });
}

// Загрузка прогресса
function loadProgress() {
    const userId = auth.currentUser.uid;
    db.ref(DB_PATHS.USERS + '/' + userId + '/progress').once('value', (snapshot) => {
        const progress = snapshot.val() || 0;
        document.getElementById('totalProgress').textContent = progress + '%';
        document.getElementById('progressBar').style.width = progress + '%';
        
        // Загружаем последний урок
        loadLastLesson(userId);
    });
}

// Загрузка последнего урока
function loadLastLesson(userId) {
    db.ref(DB_PATHS.PROGRESS + '/' + userId).once('value', (snapshot) => {
        const progress = snapshot.val() || {};
        const lastLessonId = progress.lastLesson;
        
        if (lastLessonId) {
            db.ref(DB_PATHS.LESSONS + '/' + lastLessonId).once('value', (lessonSnapshot) => {
                const lesson = lessonSnapshot.val();
                if (lesson) {
                    document.getElementById('lastLesson').innerHTML = `
                        <div class="lesson-card">
                            <h5>${lesson.name || 'Урок'}</h5>
                            <p class="text-muted mb-3">${(lesson.content || '').substring(0, 150)}...</p>
                            <button class="btn btn-primary" onclick="openLesson('${lastLessonId}')">
                                <i class="fas fa-play"></i> Продолжить
                            </button>
                        </div>
                    `;
                }
            });
        } else {
            document.getElementById('lastLesson').innerHTML = `
                <p class="text-muted">Начните обучение с первого модуля</p>
            `;
        }
    });
}

// Открытие модуля
function openModule(moduleId) {
    // Сохраняем выбранный модуль
    localStorage.setItem('selectedModule', moduleId);
    window.location.href = 'lessons.html';
}

// Открытие урока
function openLesson(lessonId) {
    localStorage.setItem('selectedLesson', lessonId);
    window.location.href = 'lesson.html';
}

// Выход
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}
