/* ============================================================
   📝 TEST.JS - Test Taking Logic
   Enhanced with better UX and animations
   ============================================================ */

let currentTestId = null;
let currentTest = null;
let userAnswers = [];

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initTestPage();
});

function initTestPage() {
    console.log('📝 Загрузка теста...');
    
    // Show loading
    showTestLoading();
    
    // Check authentication
    auth.onAuthStateChanged((user) => {
        if (!user) {
            toast.warning('Необходимо авторизоваться');
            window.location.href = 'login.html';
        } else {
            loadTest();
        }
    });
}

// ============================================================
// LOADING STATES
// ============================================================

function showTestLoading() {
    const title = DOM.find('#testTitle');
    const questionsContainer = DOM.find('#questionsContainer');
    
    if (title) DOM.text(title, 'Загрузка...');
    if (questionsContainer) {
        DOM.html(questionsContainer, `
            <div class="skeleton skeleton-text long"></div>
            <div class="skeleton skeleton-text long"></div>
            <div class="skeleton skeleton-text medium"></div>
        `);
    }
}

// ============================================================
// LOAD TEST
// ============================================================

async function loadTest() {
    try {
        currentTestId = Storage.get('selectedTest');
        
        if (!currentTestId) {
            toast.warning('Тест не выбран');
            window.location.href = 'dashboard.html';
            return;
        }
        
        const snapshot = await db.ref(DB_PATHS.TESTS + '/' + currentTestId).once('value');
        const test = snapshot.val();

        if (!test || !test.questions || test.questions.length === 0) {
            DOM.html(DOM.find('.test'), `
                <div class="text-center py-5">
                    <div class="feature-icon mb-lg" style="width: 100px; height: 100px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                    </div>
                    <h3>Тест не найден</h3>
                    <p class="text-muted mb-lg">Запрошенный тест не существует или был удален</p>
                    <button class="btn btn-primary" onclick="backToTests()">
                        <i class="fas fa-arrow-left"></i>
                        Вернуться к тестам
                    </button>
                </div>
            `);
            return;
        }

        currentTest = test;

        // Update title
        const testTitle = DOM.find('#testTitle');
        const testBreadcrumb = DOM.find('#testBreadcrumb');

        if (testTitle) {
            DOM.text(testTitle, test.name || 'Тест');
            Animation.fadeInUp(testTitle, 400);
        }

        if (testBreadcrumb) DOM.text(testBreadcrumb, test.name || 'Тест');

        // Load module info
        await loadModuleInfo(test.moduleId);

        // Render questions
        renderQuestions(test.questions);

        console.log('✅ Тест загружен');
    } catch (error) {
        ErrorHandler.handle(error, 'test loading');
    }
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
// RENDER QUESTIONS
// ============================================================

function renderQuestions(questions) {
    const container = DOM.find('#questionsContainer');
    if (!container) return;

    userAnswers = new Array(questions.length).fill(null);

    DOM.html(container, questions.map((question, index) => `
        <div class="test-question fade-in-up stagger-${(index % 5) + 1}" id="question-${index}">
            <h5 style="font-family: var(--font-heading); font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--spacing-md);">
                <span class="badge bg-primary mr-md">${index + 1}</span>
                ${question.text || 'Вопрос'}
            </h5>
            <div class="answers-list">
                ${question.options.map((option, optIndex) => `
                    <label class="form-check d-flex align-center gap-md" style="padding: var(--spacing-md); background: white; border: 1px solid var(--glass-border); border-radius: var(--radius-md); margin-bottom: var(--spacing-sm); cursor: pointer; transition: all var(--transition-fast);">
                        <input class="form-check-input" type="radio" name="question-${index}" value="${optIndex}" onchange="selectAnswer(${index}, ${optIndex})">
                        <span class="form-check-label">${option || 'Вариант ответа'}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join(''));

    // Trigger animations
    requestAnimationFrame(() => {
        const questionDivs = DOM.findAll('.test-question');
        questionDivs.forEach((div, index) => {
            setTimeout(() => {
                DOM.addClass(div, 'animate-in');
            }, index * 100);
        });
    });

    // Update progress
    updateTestProgress();
}

// ============================================================
// SELECT ANSWER
// ============================================================

function selectAnswer(questionIndex, answerIndex) {
    userAnswers[questionIndex] = answerIndex;
    
    // Update visual feedback
    const options = DOM.findAll(`#question-${questionIndex} .form-check`);
    options.forEach((option, index) => {
        const input = option.querySelector('input');
        if (index === answerIndex) {
            DOM.addClass(option, 'selected');
            option.style.background = 'rgba(232, 180, 184, 0.1)';
            option.style.borderColor = 'var(--color-primary)';
        } else {
            DOM.removeClass(option, 'selected');
            option.style.background = 'white';
            option.style.borderColor = 'var(--glass-border)';
        }
    });

    // Update progress
    updateTestProgress();
}

// ============================================================
// UPDATE TEST PROGRESS
// ============================================================

function updateTestProgress() {
    const answeredCount = userAnswers.filter(a => a !== null).length;
    const totalQuestions = currentTest.questions.length;
    const progress = Math.round((answeredCount / totalQuestions) * 100);

    const progressText = DOM.find('#testProgressText');
    const progressBar = DOM.find('#testProgressBar');

    if (progressText) {
        DOM.text(progressText, `${answeredCount} из ${totalQuestions}`);
    }

    if (progressBar) {
        progressBar.style.width = progress + '%';
    }

    // Enable/disable submit button
    const submitBtn = DOM.find('#submitTestBtn');
    if (submitBtn) {
        submitBtn.disabled = answeredCount < totalQuestions;
    }
}

// ============================================================
// SUBMIT TEST
// ============================================================

async function submitTest() {
    // Check if all questions are answered
    const unanswered = userAnswers.findIndex(a => a === null);
    
    if (unanswered !== -1) {
        toast.warning('Пожалуйста, ответьте на все вопросы');
        DOM.find(`#question-${unanswered}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    
    // Confirm submission
    const confirmed = await toast.confirm(
        'Вы уверены, что хотите отправить ответы? После отправки редактирование невозможно.',
        {
            title: 'Отправка теста',
            confirmText: 'Отправить',
            cancelText: 'Отмена'
        }
    );

    if (!confirmed) return;

    // Show loading
    const submitBtn = DOM.find('#submitTestBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    DOM.html(submitBtn, '<i class="fas fa-spinner fa-spin"></i> Проверка...');

    try {
        // Calculate score
        let correctAnswers = 0;
        currentTest.questions.forEach((question, index) => {
            if (userAnswers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });

        const score = Math.round((correctAnswers / currentTest.questions.length) * 100);

        // Save result
        const userId = auth.currentUser.uid;
        const userSnapshot = await db.ref(DB_PATHS.USERS + '/' + userId).once('value');
        const userData = userSnapshot.val();

        const resultRef = db.ref(DB_PATHS.TEST_RESULTS).push();
        await resultRef.set({
            testId: currentTestId,
            testName: currentTest.name,
            userId: userId,
            studentName: userData ? `${userData.name || ''} ${userData.surname || ''}`.trim() : 'Ученик',
            score: score,
            totalQuestions: currentTest.questions.length,
            correctAnswers: correctAnswers,
            answers: userAnswers,
            date: new Date().toISOString()
        });

        // Show results
        showResults(score, correctAnswers, currentTest.questions.length);

    } catch (error) {
        submitBtn.disabled = false;
        DOM.html(submitBtn, originalText);
        ErrorHandler.handle(error, 'test submission');
    }
}

// ============================================================
// SHOW RESULTS
// ============================================================

function showResults(score, correct, total) {
    const container = DOM.find('.test');
    
    if (!container) return;

    const isPassed = score >= 70;

    DOM.html(container, `
        <div class="text-center py-5 fade-in">
            <div class="feature-icon mb-lg ${isPassed ? 'bg-success' : 'bg-danger'}" style="width: 120px; height: 120px;">
                <i class="fas ${isPassed ? 'fa-check' : 'fa-times'}" style="font-size: 4rem;"></i>
            </div>
            <h2 style="font-family: var(--font-display); font-size: var(--font-size-3xl); font-weight: 600; margin-bottom: var(--spacing-md);">
                ${isPassed ? 'Поздравляем!' : 'Попробуйте еще раз'}
            </h2>
            <p class="text-muted mb-xl" style="font-size: var(--font-size-lg);">
                ${isPassed 
                    ? 'Вы успешно прошли тест!' 
                    : 'Необходимо набрать минимум 70% для прохождения теста.'}
            </p>
            
            <div class="test-score">${score}%</div>
            
            <div class="d-flex justify-center gap-lg mb-xl">
                <div class="text-center">
                    <div style="font-size: var(--font-size-2xl); font-weight: 600; color: var(--color-success);">
                        ${correct}
                    </div>
                    <div class="text-muted">Правильных</div>
                </div>
                <div class="text-center">
                    <div style="font-size: var(--font-size-2xl); font-weight: 600; color: var(--color-danger);">
                        ${total - correct}
                    </div>
                    <div class="text-muted">Неправильных</div>
                </div>
                <div class="text-center">
                    <div style="font-size: var(--font-size-2xl); font-weight: 600;">
                        ${total}
                    </div>
                    <div class="text-muted">Всего</div>
                </div>
            </div>
            
            <div class="d-flex justify-center gap-md">
                <button class="btn btn-secondary" onclick="backToTests()">
                    <i class="fas fa-arrow-left"></i>
                    Вернуться к тестам
                </button>
                <button class="btn btn-primary" onclick="retakeTest()">
                    <i class="fas fa-redo"></i>
                    Пройти снова
                </button>
            </div>
        </div>
    `);

    // Animate score
    setTimeout(() => {
        const scoreElement = DOM.find('.test-score');
        if (scoreElement) {
            Animation.scaleIn(scoreElement, 500);
        }
    }, 200);
}

// ============================================================
// BACK TO TESTS
// ============================================================

function backToTests() {
    window.location.href = 'tests.html';
}

// ============================================================
// RETAKE TEST
// ============================================================

function retakeTest() {
    userAnswers = [];
    window.location.reload();
}

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.selectAnswer = selectAnswer;
window.submitTest = submitTest;
window.backToTests = backToTests;
window.retakeTest = retakeTest;

console.log('📝 Test.js загружен');