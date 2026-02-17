/* ============================================================
   📊 DASHBOARD.JS - Dashboard Logic
   Enhanced with better UX and animations
   ============================================================ */

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

function initDashboard() {
    console.log('📊 Загрузка дашборда...');
    
    // Show loading state
    showDashboardLoading();
    
    // Check authentication
    auth.onAuthStateChanged((user) => {
        if (!user) {
            toast.warning('Необходимо авторизоваться');
            window.location.href = 'login.html';
        } else {
            loadDashboardData();
        }
    });
}

// ============================================================
// LOADING STATES
// ============================================================

function showDashboardLoading() {
    const container = DOM.find('.dashboard');
    if (!container) return;

    // Show skeleton loaders
    const modulesContainer = DOM.find('#modulesContainer');
    if (modulesContainer) {
        Loading.skeleton(modulesContainer, 3);
    }

    const progressContainer = DOM.find('#progressContainer');
    if (progressContainer) {
        Loading.skeleton(progressContainer, 1);
    }
}

function hideDashboardLoading() {
    const container = DOM.find('.dashboard');
    if (!container) return;

    Loading.removeSkeletons(container);
}

// ============================================================
// LOAD DASHBOARD DATA
// ============================================================

async function loadDashboardData() {
    try {
        const userId = auth.currentUser.uid;

        // Load user data
        await loadUserData(userId);

        // Load modules
        await loadModules(userId);

        // Load progress
        await loadProgress(userId);

        // Hide loading
        hideDashboardLoading();

        console.log('✅ Дашборд загружен');
    } catch (error) {
        hideDashboardLoading();
        ErrorHandler.handle(error, 'dashboard loading');
    }
}

// ============================================================
// LOAD USER DATA
// ============================================================

async function loadUserData(userId) {
    const snapshot = await db.ref(DB_PATHS.USERS + '/' + userId).once('value');
    const userData = snapshot.val();

    if (userData) {
        // Update welcome message
        const welcomeElement = DOM.find('#welcomeMessage');
        if (welcomeElement) {
            const name = userData.name || 'Ученик';
            DOM.html(welcomeElement, `Добро пожал${userData.name && userData.name.endsWith('а') ? 'а' : 'о'}, <span class="text-primary">${name}</span>!`);
        }
    }
}

// ============================================================
// LOAD MODULES
// ============================================================

async function loadModules(userId) {
    const snapshot = await db.ref(DB_PATHS.MODULES).once('value');
    const modules = snapshot.val() || {};
    const container = DOM.find('#modulesContainer');

    if (!container) return;

    if (Object.keys(modules).length === 0) {
        DOM.html(container, `
            <div class="col-12 text-center py-5">
                <div class="feature-icon mb-lg" style="width: 100px; height: 100px;">
                    <i class="fas fa-book-open" style="font-size: 3rem;"></i>
                </div>
                <h3>Модули пока не добавлены</h3>
                <p class="text-muted">Контент появится в ближайшее время</p>
            </div>
        `);
        return;
    }

    // Get user progress for each module
    const progressData = await loadModulesProgress(userId);

    DOM.html(container, Object.entries(modules)
        .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
        .map(([id, module], index) => {
            const progress = progressData[id] || 0;
            const moduleIcon = getModuleIcon(index);
            const delayClass = `stagger-${(index % 5) + 1}`;

            return `
                <div class="col-md-6 col-lg-4 mb-4 ${delayClass}">
                    <div class="module-card fade-in-up" onclick="openModule('${id}')" style="cursor: pointer;">
                        <div class="module-card-image">
                            <i class="fas ${moduleIcon}"></i>
                        </div>
                        <div class="module-card-body">
                            <span class="module-card-number">Модуль ${index + 1}</span>
                            <h4 class="module-card-title">${module.name || 'Модуль'}</h4>
                            <p class="module-card-description">${module.description || 'Описание модуля'}</p>
                            <div class="module-card-meta">
                                <div class="module-card-lessons">
                                    <i class="fas fa-play-circle"></i>
                                    <span>${module.lessonsCount || 0} уроков</span>
                                </div>
                                <div class="module-card-progress">
                                    <div class="module-progress-bar">
                                        <div class="module-progress-value" style="width: ${progress}%"></div>
                                    </div>
                                    <span class="module-card-percentage">${progress}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join(''));

    // Trigger animations
    requestAnimationFrame(() => {
        const cards = DOM.findAll('.module-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                DOM.addClass(card, 'animate-in');
            }, index * 100);
        });
    });
}

function getModuleIcon(index) {
    const icons = [
        'fa-palette',
        'fa-brush',
        'fa-gem',
        'fa-magic',
        'fa-star',
        'fa-crown'
    ];
    return icons[index % icons.length];
}

// ============================================================
// LOAD MODULES PROGRESS
// ============================================================

async function loadModulesProgress(userId) {
    const progressSnapshot = await db.ref(DB_PATHS.PROGRESS + '/' + userId + '/completedLessons').once('value');
    const completedLessons = progressSnapshot.val() || {};

    // Get all lessons for each module
    const modulesSnapshot = await db.ref(DB_PATHS.LESSONS).once('value');
    const lessons = modulesSnapshot.val() || {};

    // Calculate progress for each module
    const progressData = {};

    Object.values(lessons).forEach(lesson => {
        const moduleId = lesson.moduleId;
        if (!progressData[moduleId]) {
            progressData[moduleId] = { total: 0, completed: 0 };
        }
        progressData[moduleId].total++;

        if (completedLessons[Object.keys(lessons).find(key => lessons[key] === lesson)]) {
            progressData[moduleId].completed++;
        }
    });

    // Calculate percentages
    Object.keys(progressData).forEach(moduleId => {
        const { total, completed } = progressData[moduleId];
        progressData[moduleId] = total > 0 ? Math.round((completed / total) * 100) : 0;
    });

    return progressData;
}

// ============================================================
// LOAD OVERALL PROGRESS
// ============================================================

async function loadProgress(userId) {
    const snapshot = await db.ref(DB_PATHS.USERS + '/' + userId + '/progress').once('value');
    const progress = snapshot.val() || 0;

    // Update progress bar
    const progressBar = DOM.find('#overallProgressBar');
    const progressText = DOM.find('#overallProgressText');

    if (progressBar) {
        progressBar.style.width = progress + '%';
        
        // Animate progress
        setTimeout(() => {
            progressBar.style.transition = 'width 1s ease';
        }, 100);
    }

    if (progressText) {
        DOM.text(progressText, progress + '%');
    }

    // Update progress circle if exists
    const progressCircle = DOM.find('#progressCircle');
    if (progressCircle) {
        const circumference = 2 * Math.PI * 54; // r=54
        const offset = circumference - (progress / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
    }

    // Get statistics
    await loadStatistics(userId);
}

// ============================================================
// LOAD STATISTICS
// ============================================================

async function loadStatistics(userId) {
    // Completed lessons
    const lessonsSnapshot = await db.ref(DB_PATHS.PROGRESS + '/' + userId + '/completedLessons').once('value');
    const completedLessons = lessonsSnapshot.val() || {};

    // Completed tests
    const testsSnapshot = await db.ref(DB_PATHS.TEST_RESULTS).orderByChild('userId').equalTo(userId).once('value');
    const testResults = testsSnapshot.val() || {};

    // Update statistics
    const lessonsCount = DOM.find('#completedLessonsCount');
    if (lessonsCount) {
        animateNumber(lessonsCount, Object.keys(completedLessons).length);
    }

    const testsCount = DOM.find('#completedTestsCount');
    if (testsCount) {
        animateNumber(testsCount, Object.keys(testResults).length);
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
// ANIMATE NUMBER
// ============================================================

function animateNumber(element, target, duration = 1000) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
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
// OPEN MODULE
// ============================================================

function openModule(moduleId) {
    Storage.set('selectedModule', moduleId);
    
    // Add transition effect
    const dashboard = DOM.find('.dashboard');
    if (dashboard) {
        dashboard.style.opacity = '0';
        dashboard.style.transform = 'translateY(20px)';
        dashboard.style.transition = 'all 0.3s ease';
    }

    setTimeout(() => {
        window.location.href = 'lessons.html';
    }, 300);
}

// ============================================================
// QUICK ACTIONS
// ============================================================

function continueLearning() {
    const userId = auth.currentUser.uid;
    
    db.ref(DB_PATHS.PROGRESS + '/' + userId + '/lastLesson').once('value', (snapshot) => {
        const lastLessonId = snapshot.val();
        
        if (lastLessonId) {
            Storage.set('selectedLesson', lastLessonId);
            window.location.href = 'lesson.html';
        } else {
            // Go to first module if no last lesson
            db.ref(DB_PATHS.MODULES).limitToFirst(1).once('value', (modulesSnapshot) => {
                const modules = modulesSnapshot.val();
                if (modules) {
                    const firstModuleId = Object.keys(modules)[0];
                    openModule(firstModuleId);
                } else {
                    toast.info('Нет доступных модулей для обучения');
                }
            });
        }
    });
}

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.openModule = openModule;
window.continueLearning = continueLearning;

console.log('📊 Dashboard.js загружен');

// ============================================================
// ORIGINAL FUNCTIONS NOT REPLACED BY EDIT
// ============================================================

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