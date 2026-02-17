/* ============================================================
   ✅ TESTS.JS - Tests List Logic
   Enhanced with better UX and animations
   ============================================================ */

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initTestsPage();
});

function initTestsPage() {
    console.log('✅ Загрузка страницы тестов...');
    
    // Show loading
    showTestsLoading();
    
    // Check authentication
    auth.onAuthStateChanged((user) => {
        if (!user) {
            toast.warning('Необходимо авторизоваться');
            window.location.href = 'login.html';
        } else {
            loadTests();
        }
    });
}

// ============================================================
// LOADING STATES
// ============================================================

function showTestsLoading() {
    const container = DOM.find('#testsContainer');
    if (container) {
        Loading.skeleton(container, 4);
    }
}

function hideTestsLoading() {
    const container = DOM.find('#testsContainer');
    if (container) {
        Loading.removeSkeletons(container);
    }
}

// ============================================================
// LOAD TESTS
// ============================================================

async function loadTests() {
    try {
        const snapshot = await db.ref(DB_PATHS.TESTS).once('value');
        const tests = snapshot.val() || {};
        const container = DOM.find('#testsContainer');

        if (!container) return;

        if (Object.keys(tests).length === 0) {
            DOM.html(container, `
                <div class="text-center py-5 fade-in">
                    <div class="feature-icon mb-lg" style="width: 100px; height: 100px;">
                        <i class="fas fa-clipboard-list" style="font-size: 3rem;"></i>
                    </div>
                    <h3>Тесты пока не добавлены</h3>
                    <p class="text-muted">Проверьте знания, пройдя доступные тесты</p>
                    <button class="btn btn-secondary mt-lg" onclick="window.location.href='dashboard.html'">
                        <i class="fas fa-arrow-left"></i>
                        Вернуться к дашборду
                    </button>
                </div>
            `);
            return;
        }
        
        // Load module names for tests
        const modulesSnapshot = await db.ref(DB_PATHS.MODULES).once('value');
        const modules = modulesSnapshot.val() || {};

        // Load user's test results
        const userId = auth.currentUser.uid;
        const resultsSnapshot = await db.ref(DB_PATHS.TEST_RESULTS).orderByChild('userId').equalTo(userId).once('value');
        const testResults = resultsSnapshot.val() || {};

        DOM.html(container, Object.entries(tests).map(([id, test], index) => {
            const moduleName = modules[test.moduleId] ? modules[test.moduleId].name : 'Неизвестный модуль';
            const questionsCount = test.questions ? test.questions.length : 0;
            const delayClass = `stagger-${(index % 5) + 1}`;

            // Check if test was completed
            const userResults = Object.values(testResults).filter(r => r.testId === id);
            const lastResult = userResults.length > 0 ? userResults[userResults.length - 1] : null;
            const isCompleted = lastResult !== null;

            return `
                <div class="lesson-card fade-in-up ${delayClass} ${isCompleted ? 'completed' : ''}">
                    <div class="d-flex justify-between align-start gap-lg">
                        <div style="flex: 1;">
                            <div class="d-flex align-center gap-md mb-md">
                                <span class="badge ${isCompleted ? 'bg-success' : 'bg-primary'}">
                                    <i class="fas ${isCompleted ? 'fa-check' : 'fa-clipboard-list'}"></i>
                                    ${isCompleted ? 'Пройден' : 'Тест'}
                                </span>
                                <span class="text-muted" style="font-size: var(--font-size-sm);">
                                    <i class="fas fa-book"></i>
                                    ${moduleName}
                                </span>
                            </div>
                            <h4 style="font-family: var(--font-heading); font-size: var(--font-size-xl); font-weight: 600; margin-bottom: var(--spacing-sm);">
                                ${test.name || 'Тест'}
                            </h4>
                            <p class="text-muted" style="line-height: 1.6;">
                                ${questionsCount} вопрос${questionsCount !== 1 ? (questionsCount > 4 ? 'ов' : 'а') : ''}
                            </p>
                            ${lastResult ? `
                                <div class="mt-md">
                                    <span class="badge bg-${lastResult.score >= 70 ? 'success' : 'warning'}">
                                        Последний результат: ${lastResult.score}%
                                    </span>
                                    <small class="text-muted ml-sm">
                                        (${Formatter.date(lastResult.date)})
                                    </small>
                                </div>
                            ` : ''}
                        </div>
                        <button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}" onclick="startTest('${id}')">
                            <i class="fas ${isCompleted ? 'fa-redo' : 'fa-play'}"></i>
                            ${isCompleted ? 'Пройти снова' : 'Начать'}
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

        hideTestsLoading();

        console.log('✅ Тесты загружены');
    } catch (error) {
        hideTestsLoading();
        ErrorHandler.handle(error, 'tests loading');
    }
}

// ============================================================
// START TEST
// ============================================================

function startTest(testId) {
    Storage.set('selectedTest', testId);
    
    // Add transition effect
    const container = DOM.find('.tests');
    if (container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        container.style.transition = 'all 0.3s ease';
    }

    setTimeout(() => {
        window.location.href = 'test.html';
    }, 300);
}

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.startTest = startTest;

console.log('✅ Tests.js загружен');

// ============================================================
// Загрузка результатов
// ============================================================

function loadResults() {
    const userId = auth.currentUser.uid;
    db.ref(DB_PATHS.TEST_RESULTS).orderByChild('userId').equalTo(userId).once('value', (snapshot) => {
        const results = snapshot.val() || {};
        const tbody = document.getElementById('resultsTable');
        
        if (Object.keys(results).length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">Вы еще не прошли ни одного теста</td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = Object.entries(results)
            .sort((a, b) => new Date(b[1].date) - new Date(a[1].date))
            .map(([id, result]) => `
                <tr>
                    <td>${result.testName || 'Тест'}</td>
                    <td>
                        <span class="badge bg-${result.score >= 70 ? 'success' : 'danger'}">
                            ${result.score}%
                        </span>
                    </td>
                    <td>${result.date ? new Date(result.date).toLocaleDateString('ru-RU') : '-'}</td>
                    <td>
                        <span class="badge bg-${result.score >= 70 ? 'success' : 'warning'}">
                            ${result.score >= 70 ? 'Сдан' : 'Не сдан'}
                        </span>
                    </td>
                </tr>
            `).join('');
    });
}

// ============================================================
// Выход
// ============================================================

function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}