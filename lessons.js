// Проверка авторизации
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        loadModule();
    }
});

// Загрузка модуля и уроков
function loadModule() {
    const moduleId = localStorage.getItem('selectedModule');
    
    if (!moduleId) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Загружаем информацию о модуле
    db.ref(DB_PATHS.MODULES + '/' + moduleId).once('value', (snapshot) => {
        const module = snapshot.val();
        if (module) {
            document.getElementById('moduleName').textContent = module.name || 'Модуль';
            document.getElementById('moduleTitle').textContent = module.name || 'Название модуля';
        }
    });
    
    // Загружаем уроки модуля
    db.ref(DB_PATHS.LESSONS).orderByChild('moduleId').equalTo(moduleId).once('value', (snapshot) => {
        const lessons = snapshot.val() || {};
        const container = document.getElementById('lessonsContainer');
        
        if (Object.keys(lessons).length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
                    <p class="text-muted">В этом модуле пока нет уроков</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = Object.entries(lessons).map(([id, lesson]) => `
            <div class="lesson-card" id="lesson-${id}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5>${lesson.name || 'Урок'}</h5>
                        <p class="text-muted mb-2">${(lesson.content || '').substring(0, 200)}...</p>
                        <small class="text-muted">
                            <i class="fas fa-clock"></i> 
                            ${Math.ceil((lesson.content || '').length / 500)} мин чтения
                        </small>
                    </div>
                    <button class="btn btn-primary" onclick="openLesson('${id}')">
                        <i class="fas fa-play"></i> Начать
                    </button>
                </div>
            </div>
        `).join('');
        
        // Загружаем прогресс уроков
        loadLessonsProgress();
    });
}

// Загрузка прогресса уроков
function loadLessonsProgress() {
    const userId = auth.currentUser.uid;
    db.ref(DB_PATHS.PROGRESS + '/' + userId + '/completedLessons').once('value', (snapshot) => {
        const completedLessons = snapshot.val() || {};
        
        Object.keys(completedLessons).forEach(lessonId => {
            const lessonCard = document.getElementById('lesson-' + lessonId);
            if (lessonCard) {
                lessonCard.classList.add('completed');
                lessonCard.querySelector('button').innerHTML = `
                    <i class="fas fa-check"></i> Пройдено
                `;
                lessonCard.querySelector('button').disabled = true;
            }
        });
    });
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
