/* ============================================================
   📖 LESSON.JS - Lesson View Logic
   Enhanced with animations and better UX
   ============================================================ */

let currentLessonId = null;
let currentModuleId = null;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initLessonPage();
});

function initLessonPage() {
    console.log('📖 Загрузка урока...');
    
    // Show loading
    showLessonLoading();
    
    // Check authentication
    auth.onAuthStateChanged((user) => {
        if (!user) {
            toast.warning('Необходимо авторизоваться');
            window.location.href = 'login.html';
        } else {
            loadLesson();
        }
    });
}

// ============================================================
// LOADING STATES
// ============================================================

function showLessonLoading() {
    const title = DOM.find('#lessonTitle');
    const content = DOM.find('#lessonContent');
    
    if (title) DOM.text(title, 'Загрузка...');
    if (content) {
        DOM.html(content, `
            <div class="skeleton skeleton-text long"></div>
            <div class="skeleton skeleton-text long"></div>
            <div class="skeleton skeleton-text medium"></div>
        `);
    }
}

function hideLessonLoading() {
    // Loading will be hidden when content is loaded
}

// ============================================================
// LOAD LESSON
// ============================================================

async function loadLesson() {
    try {
        currentLessonId = Storage.get('selectedLesson');
        
        if (!currentLessonId) {
            toast.warning('Урок не выбран');
            window.location.href = 'dashboard.html';
            return;
        }

        const snapshot = await db.ref(DB_PATHS.LESSONS + '/' + currentLessonId).once('value');
        const lesson = snapshot.val();

        if (!lesson) {
            DOM.html(DOM.find('.lesson'), `
                <div class="text-center py-5">
                    <div class="feature-icon mb-lg" style="width: 100px; height: 100px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                    </div>
                    <h3>Урок не найден</h3>
                    <p class="text-muted mb-lg">Запрошенный урок не существует или был удален</p>
                    <button class="btn btn-primary" onclick="backToLessons()">
                        <i class="fas fa-arrow-left"></i>
                        Вернуться к урокам
                    </button>
                </div>
            `);
            return;
        }

        currentModuleId = lesson.moduleId;

        // Fill lesson data
        const lessonTitle = DOM.find('#lessonTitle');
        const lessonBreadcrumb = DOM.find('#lessonBreadcrumb');

        if (lessonTitle) {
            DOM.text(lessonTitle, lesson.name || 'Урок');
            Animation.fadeInUp(lessonTitle, 400);
        }

        if (lessonBreadcrumb) DOM.text(lessonBreadcrumb, lesson.name || 'Урок');

        // Format and display content
        const content = lesson.content || '';
        const readingTime = Formatter.readingTime(content);

        const lessonContent = DOM.find('#lessonContent');
        if (lessonContent) {
            DOM.html(lessonContent, formatContent(content));
            
            // Animate content paragraphs
            const paragraphs = lessonContent.querySelectorAll('p');
            paragraphs.forEach((p, index) => {
                p.style.opacity = '0';
                p.style.transform = 'translateY(10px)';
                p.style.transition = `all 0.4s ease ${index * 0.05}s`;
                
                setTimeout(() => {
                    p.style.opacity = '1';
                    p.style.transform = 'translateY(0)';
                }, 100);
            });
        }

        // Reading time
        const readingTimeElement = DOM.find('#readingTime');
        if (readingTimeElement) {
            DOM.text(readingTimeElement, `~${readingTime} мин`);
        }

        // Load module info
        await loadModuleInfo(lesson.moduleId);

        // Load navigation
        await loadLessonNavigation(lesson.moduleId);

        // Check completion status
        await checkLessonCompleted();

        console.log('✅ Урок загружен');
    } catch (error) {
        ErrorHandler.handle(error, 'lesson loading');
    }
}

// ============================================================
// FORMAT CONTENT
// ============================================================

function formatContent(content) {
    // Split into paragraphs
    return content
        .split('\n\n')
        .map(p => {
            if (p.trim()) {
                return `<p class="mb-md" style="line-height: 1.8; color: var(--text-secondary);">${p.trim()}</p>`;
            }
            return '';
        })
        .join('');
}

// ============================================================
// LOAD MODULE INFO
// ============================================================

async function loadModuleInfo(moduleId) {
    const snapshot = await db.ref(DB_PATHS.MODULES + '/' + moduleId).once('value');
    const module = snapshot.val();

    if (module) {
        const moduleInfo = DOM.find('#moduleInfo');
        if (moduleInfo) {
            DOM.text(moduleInfo, module.name || 'Модуль');
        }
    }
}

// ============================================================
// LOAD LESSON NAVIGATION
// ============================================================

async function loadLessonNavigation(moduleId) {
    const snapshot = await db.ref(DB_PATHS.LESSONS).orderByChild('moduleId').equalTo(moduleId).once('value');
    const lessons = snapshot.val() || {};
    const lessonIds = Object.keys(lessons).sort((a, b) => {
        return (lessons[a].order || 0) - (lessons[b].order || 0);
    });
    
    const currentIndex = lessonIds.indexOf(currentLessonId);
    const navContainer = DOM.find('#lessonNavigation');

    if (!navContainer) return;

    let navHTML = '';

    if (currentIndex > 0) {
        const prevLessonId = lessonIds[currentIndex - 1];
        const prevLesson = lessons[prevLessonId];
        navHTML += `
            <button class="btn btn-secondary w-100 mb-md" onclick="navigateToLesson('${prevLessonId}')">
                <i class="fas fa-arrow-left"></i>
                ${prevLesson ? prevLesson.name : 'Предыдущий урок'}
            </button>
        `;
    }

    if (currentIndex < lessonIds.length - 1) {
        const nextLessonId = lessonIds[currentIndex + 1];
        const nextLesson = lessons[nextLessonId];
        navHTML += `
            <button class="btn btn-primary w-100" onclick="navigateToLesson('${nextLessonId}')">
                ${nextLesson ? nextLesson.name : 'Следующий урок'}
                <i class="fas fa-arrow-right"></i>
            </button>
        `;
    }

    if (!navHTML) {
        navHTML = '<p class="text-muted text-center">Это единственный урок в модуле</p>';
    }

    DOM.html(navContainer, navHTML);
}

// ============================================================
// CHECK LESSON COMPLETED
// ============================================================

async function checkLessonCompleted() {
    const userId = auth.currentUser.uid;
    const snapshot = await db.ref(DB_PATHS.PROGRESS + '/' + userId + '/completedLessons/' + currentLessonId).once('value');
    
    if (snapshot.exists()) {
        const btn = DOM.find('#completeLessonBtn');
        if (btn) {
            DOM.html(btn, '<i class="fas fa-check"></i> Урок завершен');
            btn.disabled = true;
            DOM.removeClass(btn, 'btn-primary');
            DOM.addClass(btn, 'btn-success');
        }
    }
}

// ============================================================
// COMPLETE LESSON
// ============================================================

async function completeLesson() {
    const userId = auth.currentUser.uid;
    const btn = DOM.find('#completeLessonBtn');

    if (!btn) return;

    // Show loading
    const originalText = btn.innerHTML;
    btn.disabled = true;
    DOM.html(btn, '<i class="fas fa-spinner fa-spin"></i> Сохранение...');

    try {
        // Mark lesson as completed
        await db.ref(DB_PATHS.PROGRESS + '/' + userId + '/completedLessons/' + currentLessonId).set(true);

        // Update last lesson
        await db.ref(DB_PATHS.PROGRESS + '/' + userId + '/lastLesson').set(currentLessonId);

        // Update overall progress
        await updateProgress();

        // Update button
        DOM.html(btn, '<i class="fas fa-check"></i> Урок завершен!');
        DOM.removeClass(btn, 'btn-primary');
        DOM.addClass(btn, 'btn-success');

        toast.success('Урок завершен! Прогресс сохранен.');

        // Auto-navigate to next lesson after 1.5 seconds
        setTimeout(async () => {
            const snapshot = await db.ref(DB_PATHS.LESSONS).orderByChild('moduleId').equalTo(currentModuleId).once('value');
            const lessons = snapshot.val() || {};
            const lessonIds = Object.keys(lessons).sort((a, b) => {
                return (lessons[a].order || 0) - (lessons[b].order || 0);
            });
            
            const currentIndex = lessonIds.indexOf(currentLessonId);
            
            if (currentIndex < lessonIds.length - 1) {
                const nextLessonId = lessonIds[currentIndex + 1];
                navigateToLesson(nextLessonId);
            } else {
                toast.info('Это был последний урок в модуле!');
            }
        }, 1500);

    } catch (error) {
        btn.disabled = false;
        DOM.html(btn, originalText);
        ErrorHandler.handle(error, 'lesson completion');
    }
}

// ============================================================
// UPDATE PROGRESS
// ============================================================

async function updateProgress() {
    const userId = auth.currentUser.uid;

    const lessonsSnapshot = await db.ref(DB_PATHS.LESSONS).once('value');
    const totalLessons = lessonsSnapshot.numChildren();

    const progressSnapshot = await db.ref(DB_PATHS.PROGRESS + '/' + userId + '/completedLessons').once('value');
    const completedLessons = progressSnapshot.numChildren();

    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    await db.ref(DB_PATHS.USERS + '/' + userId + '/progress').set(progress);
}

// ============================================================
// NAVIGATE TO LESSON
// ============================================================

function navigateToLesson(lessonId) {
    Storage.set('selectedLesson', lessonId);
    
    // Add transition effect
    const lesson = DOM.find('.lesson');
    if (lesson) {
        lesson.style.opacity = '0';
        lesson.style.transform = 'translateX(-20px)';
        lesson.style.transition = 'all 0.3s ease';
    }

    setTimeout(() => {
        window.location.reload();
    }, 300);
}

// ============================================================
// BACK TO LESSONS
// ============================================================

function backToLessons() {
    window.location.href = 'lessons.html';
}

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.completeLesson = completeLesson;
window.navigateToLesson = navigateToLesson;
window.backToLessons = backToLessons;

console.log('📖 Lesson.js загружен');