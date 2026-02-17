/* ============================================================
   📚 LESSONS.JS - Module Lessons Logic
   Enhanced with animations and better UX
   ============================================================ */

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initLessonsPage();
});

function initLessonsPage() {
    console.log('📚 Загрузка страницы уроков...');
    
    // Show loading
    showLessonsLoading();
    
    // Check authentication
    auth.onAuthStateChanged((user) => {
        if (!user) {
            toast.warning('Необходимо авторизоваться');
            window.location.href = 'login.html';
        } else {
            loadModuleData();
        }
    });
}

// ============================================================
// LOADING STATES
// ============================================================

function showLessonsLoading() {
    const container = DOM.find('#lessonsContainer');
    if (container) {
        Loading.skeleton(container, 4);
    }
}

function hideLessonsLoading() {
    const container = DOM.find('#lessonsContainer');
    if (container) {
        Loading.removeSkeletons(container);
    }
}

// ============================================================
// LOAD MODULE DATA
// ============================================================

async function loadModuleData() {
    try {
        const moduleId = Storage.get('selectedModule');

        if (!moduleId) {
            toast.warning('Модуль не выбран');
            window.location.href = 'dashboard.html';
            return;
        }
        
        // Load module info
        await loadModuleInfo(moduleId);

        // Load lessons
        await loadLessons(moduleId);

        // Hide loading
        hideLessonsLoading();

        console.log('✅ Уроки загружены');
    } catch (error) {
        hideLessonsLoading();
        ErrorHandler.handle(error, 'lessons loading');
    }
}

// ============================================================
// LOAD MODULE INFO
// ============================================================

async function loadModuleInfo(moduleId) {
    const snapshot = await db.ref(DB_PATHS.MODULES + '/' + moduleId).once('value');
    const module = snapshot.val();

    if (module) {
        const moduleName = DOM.find('#moduleName');
        const moduleTitle = DOM.find('#moduleTitle');
        const moduleDescription = DOM.find('#moduleDescription');

        if (moduleName) DOM.text(moduleName, module.name || 'Модуль');
        if (moduleTitle) DOM.text(moduleTitle, module.name || 'Название модуля');
        if (moduleDescription) DOM.html(moduleDescription, module.description || '');

        // Animate module title
        if (moduleTitle) {
            Animation.fadeInUp(moduleTitle, 400);
        }
    }
}

// ============================================================
// LOAD LESSONS
// ============================================================

async function loadLessons(moduleId) {
    const snapshot = await db.ref(DB_PATHS.LESSONS).orderByChild('moduleId').equalTo(moduleId).once('value');
    const lessons = snapshot.val() || {};
    const container = DOM.find('#lessonsContainer');

    if (!container) return;

    if (Object.keys(lessons).length === 0) {
        DOM.html(container, `
            <div class="text-center py-5 fade-in">
                <div class="feature-icon mb-lg" style="width: 100px; height: 100px;">
                    <i class="fas fa-book-open" style="font-size: 3rem;"></i>
                </div>
                <h3>Уроки пока не добавлены</h3>
                <p class="text-muted">Контент появится в ближайшее время</p>
                <button class="btn btn-secondary mt-lg" onclick="window.location.href='dashboard.html'">
                    <i class="fas fa-arrow-left"></i>
                    Вернуться к модулям
                </button>
            </div>
        `);
        return;
    }

    // Sort lessons by order
    const sortedLessons = Object.entries(lessons)
        .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));

    DOM.html(container, sortedLessons.map(([id, lesson], index) => {
        const readingTime = Formatter.readingTime(lesson.content || '');
        const delayClass = `stagger-${(index % 5) + 1}`;

        return `
            <div class="lesson-card fade-in-up ${delayClass}" id="lesson-${id}">
                <div class="d-flex justify-between align-start gap-lg">
                    <div style="flex: 1;">
                        <div class="d-flex align-center gap-md mb-md">
                            <span class="badge bg-primary">Урок ${index + 1}</span>
                            <span class="text-muted" style="font-size: var(--font-size-sm);">
                                <i class="fas fa-clock"></i>
                                ${readingTime} мин чтения
                            </span>
                        </div>
                        <h4 style="font-family: var(--font-heading); font-size: var(--font-size-xl); font-weight: 600; margin-bottom: var(--spacing-sm);">
                            ${lesson.name || 'Урок'}
                        </h4>
                        <p class="text-muted" style="line-height: 1.6;">
                            ${Formatter.truncate(lesson.content || 'Описание урока', 150)}
                        </p>
                    </div>
                    <button class="btn btn-primary" onclick="openLesson('${id}')">
                        <i class="fas fa-play"></i>
                        Начать
                    </button>
                </div>
            </div>
        `;
    }).join(''));

    // Trigger animations
    requestAnimationFrame(() => {
        const cards = DOM.findAll('.lesson-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                DOM.addClass(card, 'animate-in');
            }, index * 100);
        });
    });

    // Load progress
    await loadLessonsProgress();
}

// ============================================================
// LOAD LESSONS PROGRESS
// ============================================================

async function loadLessonsProgress() {
    const userId = auth.currentUser.uid;
    const snapshot = await db.ref(DB_PATHS.PROGRESS + '/' + userId + '/completedLessons').once('value');
    const completedLessons = snapshot.val() || {};

    Object.keys(completedLessons).forEach(lessonId => {
        const lessonCard = DOM.find(`#lesson-${lessonId}`);
        if (lessonCard) {
            DOM.addClass(lessonCard, 'completed');
            
            const button = lessonCard.querySelector('button');
            if (button) {
                DOM.html(button, '<i class="fas fa-check"></i> Пройдено');
                button.disabled = true;
                DOM.removeClass(button, 'btn-primary');
                DOM.addClass(button, 'btn-success');
            }
        }
    });
}

// ============================================================
// OPEN LESSON
// ============================================================

function openLesson(lessonId) {
    Storage.set('selectedLesson', lessonId);
    
    // Add transition effect
    const container = DOM.find('.lessons');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        container.style.transition = 'all 0.3s ease';
    }

    setTimeout(() => {
        window.location.href = 'lesson.html';
    }, 300);
}

// ============================================================
// BACK TO MODULES
// ============================================================

function backToModules() {
    Storage.remove('selectedModule');
    window.location.href = 'dashboard.html';
}

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.openLesson = openLesson;
window.backToModules = backToModules;

console.log('📚 Lessons.js загружен');