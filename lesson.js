let currentLessonId = null;
let currentModuleId = null;

// Проверка авторизации
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        loadLesson();
    }
});

// Загрузка урока
function loadLesson() {
    currentLessonId = localStorage.getItem('selectedLesson');
    
    if (!currentLessonId) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    db.ref(DB_PATHS.LESSONS + '/' + currentLessonId).once('value', (snapshot) => {
        const lesson = snapshot.val();
        if (!lesson) {
            document.getElementById('lessonTitle').textContent = 'Урок не найден';
            return;
        }
        
        currentModuleId = lesson.moduleId;
        
        // Заполняем данные урока
        document.getElementById('lessonTitle').textContent = lesson.name || 'Урок';
        document.getElementById('lessonBreadcrumb').textContent = lesson.name || 'Урок';
        
        // Форматируем содержимое
        const content = lesson.content || '';
        document.getElementById('lessonContent').innerHTML = formatContent(content);
        
        // Время чтения
        const readingTime = Math.ceil(content.length / 500);
        document.getElementById('readingTime').textContent = `~${readingTime} мин`;
        
        // Информация о модуле
        loadModuleInfo(lesson.moduleId);
        
        // Навигация по урокам
        loadLessonNavigation(lesson.moduleId);
        
        // Проверяем, завершен ли урок
        checkLessonCompleted();
    });
}

// Форматирование содержимого
function formatContent(content) {
    // Разбиваем на параграфы
    return content.split('\n\n').map(p => {
        if (p.trim()) {
            return `<p class="mb-3">${p.trim()}</p>`;
        }
        return '';
    }).join('');
}

// Загрузка информации о модуле
function loadModuleInfo(moduleId) {
    db.ref(DB_PATHS.MODULES + '/' + moduleId).once('value', (snapshot) => {
        const module = snapshot.val();
        if (module) {
            document.getElementById('moduleInfo').textContent = module.name || 'Модуль';
        }
    });
}

// Загрузка навигации по урокам
function loadLessonNavigation(moduleId) {
    db.ref(DB_PATHS.LESSONS).orderByChild('moduleId').equalTo(moduleId).once('value', (snapshot) => {
        const lessons = snapshot.val() || {};
        const lessonIds = Object.keys(lessons).sort();
        const currentIndex = lessonIds.indexOf(currentLessonId);
        
        let navHTML = '';
        
        if (currentIndex > 0) {
            const prevLessonId = lessonIds[currentIndex - 1];
            navHTML += `
                <a href="javascript:void(0)" onclick="openLesson('${prevLessonId}')" class="btn btn-outline-secondary w-100 mb-2">
                    <i class="fas fa-arrow-left"></i> Предыдущий урок
                </a>
            `;
        }
        
        if (currentIndex < lessonIds.length - 1) {
            const nextLessonId = lessonIds[currentIndex + 1];
            navHTML += `
                <a href="javascript:void(0)" onclick="openLesson('${nextLessonId}')" class="btn btn-primary w-100">
                    Следующий урок <i class="fas fa-arrow-right"></i>
                </a>
            `;
        }
        
        document.getElementById('lessonNavigation').innerHTML = navHTML || '<p class="text-muted">Это единственный урок в модуле</p>';
    });
}

// Проверка завершения урока
function checkLessonCompleted() {
    const userId = auth.currentUser.uid;
    db.ref(DB_PATHS.PROGRESS + '/' + userId + '/completedLessons/' + currentLessonId).once('value', (snapshot) => {
        if (snapshot.exists()) {
            const btn = document.getElementById('completeLessonBtn');
            btn.innerHTML = '<i class="fas fa-check"></i> Урок завершен';
            btn.disabled = true;
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-success');
        }
    });
}

// Завершение урока
async function completeLesson() {
    const userId = auth.currentUser.uid;
    
    try {
        // Добавляем урок в завершенные
        await db.ref(DB_PATHS.PROGRESS + '/' + userId + '/completedLessons/' + currentLessonId).set(true);
        
        // Обновляем последний урок
        await db.ref(DB_PATHS.PROGRESS + '/' + userId + '/lastLesson').set(currentLessonId);
        
        // Обновляем общий прогресс
        await updateProgress();
        
        // Обновляем кнопку
        const btn = document.getElementById('completeLessonBtn');
        btn.innerHTML = '<i class="fas fa-check"></i> Урок завершен!';
        btn.disabled = true;
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-success');
        
        alert('Урок завершен! Прогресс сохранен.');
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

// Обновление общего прогресса
async function updateProgress() {
    const userId = auth.currentUser.uid;
    
    // Получаем общее количество уроков
    db.ref(DB_PATHS.LESSONS).once('value', (snapshot) => {
        const totalLessons = snapshot.numChildren();
        
        // Получаем количество завершенных уроков
        db.ref(DB_PATHS.PROGRESS + '/' + userId + '/completedLessons').once('value', (progressSnapshot) => {
            const completedLessons = progressSnapshot.numChildren();
            const progress = Math.round((completedLessons / totalLessons) * 100);
            
            // Обновляем прогресс пользователя
            db.ref(DB_PATHS.USERS + '/' + userId + '/progress').set(progress);
        });
    });
}

// Открытие другого урока
function openLesson(lessonId) {
    localStorage.setItem('selectedLesson', lessonId);
    window.location.reload();
}

// Выход
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}
