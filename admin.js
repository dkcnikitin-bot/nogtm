/* ============================================================
   ⚙️ ADMIN.JS - Admin Panel Logic
   Enhanced with better UX and toast notifications
   ============================================================ */

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});

function initAdmin() {
    console.log('⚙️ Загрузка админ-панели...');
    
    // Check authentication
    auth.onAuthStateChanged((user) => {
        if (!user) {
            toast.warning('Необходимо авторизоваться');
            window.location.href = 'login.html';
            return;
        }

        // Check admin role
        checkAdminRole(user);
    });

    // Initialize navigation
    initAdminNavigation();

    // Initialize forms
    initAdminForms();
}

// ============================================================
// CHECK ADMIN ROLE
// ============================================================

async function checkAdminRole(user) {
    try {
        const snapshot = await db.ref(DB_PATHS.USERS + '/' + user.uid).once('value');
        const userData = snapshot.val();

        if (!userData || userData.role !== 'admin') {
            toast.error('Доступ запрещен. Требуются права администратора.', {
                duration: 5000
            });
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            return;
        }

        // Load dashboard
        loadDashboard();

    } catch (error) {
        ErrorHandler.handle(error, 'admin role check');
    }
}

// ============================================================
// ADMIN NAVIGATION
// ============================================================

function initAdminNavigation() {
    const navLinks = DOM.findAll('.admin-nav-link');
    const sections = DOM.findAll('.admin-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const section = link.dataset.section;
            
            // Update active link
            navLinks.forEach(l => DOM.removeClass(l, 'active'));
            DOM.addClass(link, 'active');

            // Show corresponding section
            sections.forEach(s => {
                if (s.id === section + 'Section') {
                    DOM.show(s);
                    Animation.fadeIn(s, 300);
                } else {
                    DOM.hide(s);
                }
            });

            // Load data for section
            loadSectionData(section);
        });
    });
}

function loadSectionData(section) {
    switch (section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'students':
            loadStudents();
            break;
        case 'modules':
            loadModules();
            break;
        case 'lessons':
            loadLessons();
            break;
        case 'tests':
            loadTests();
            break;
        case 'results':
            loadResults();
            break;
    }
}

// ============================================================
// ADMIN FORMS
// ============================================================

function initAdminForms() {
    // Add student form
    const addStudentForm = DOM.find('#addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', handleAddStudent);
    }

    // Add module form
    const addModuleForm = DOM.find('#addModuleForm');
    if (addModuleForm) {
        addModuleForm.addEventListener('submit', handleAddModule);
    }

    // Add lesson form
    const addLessonForm = DOM.find('#addLessonForm');
    if (addLessonForm) {
        addLessonForm.addEventListener('submit', handleAddLesson);
    }

    // Add test form
    const addTestForm = DOM.find('#addTestForm');
    if (addTestForm) {
        addTestForm.addEventListener('submit', handleAddTest);
    }

    // Load module selects
    loadModuleSelects();

    // Module filter
    const moduleFilter = DOM.find('#moduleFilter');
    if (moduleFilter) {
        moduleFilter.addEventListener('change', loadLessons);
    }
}

// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadDashboard() {
    try {
        // Total students
        const usersSnapshot = await db.ref(DB_PATHS.USERS).once('value');
        const users = usersSnapshot.val() || {};
        const totalStudents = DOM.find('#totalStudents');
        if (totalStudents) {
            animateNumber(totalStudents, Object.keys(users).length);
        }

        // Recent registrations
        const recent = Object.entries(users)
            .sort((a, b) => new Date(b[1].createdAt || 0) - new Date(a[1].createdAt || 0))
            .slice(0, 5);

        const tbody = DOM.find('#recentStudents');
        if (tbody) {
            DOM.html(tbody, recent.map(([id, user]) => `
                <tr>
                    <td>${user.name || ''} ${user.surname || ''}</td>
                    <td>${user.email || ''}</td>
                    <td>${user.createdAt ? Formatter.date(user.createdAt) : '-'}</td>
                    <td>
                        <div class="progress" style="width: 100px;">
                            <div class="progress-bar" style="width: ${user.progress || 0}%"></div>
                        </div>
                        <small>${user.progress || 0}%</small>
                    </td>
                </tr>
            `).join(''));
        }

        // Completed tests
        const resultsSnapshot = await db.ref(DB_PATHS.TEST_RESULTS).once('value');
        const results = resultsSnapshot.val() || {};
        const completedTests = DOM.find('#completedTests');
        if (completedTests) {
            animateNumber(completedTests, Object.keys(results).length);
        }

        // Average score
        const scores = Object.values(results).map(r => r.score || 0);
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        const avgScore = DOM.find('#avgScore');
        if (avgScore) {
            animateNumber(avgScore, avg);
        }

    } catch (error) {
        ErrorHandler.handle(error, 'dashboard loading');
    }
}

// ============================================================
// LOAD STUDENTS
// ============================================================

async function loadStudents() {
    try {
        const snapshot = await db.ref(DB_PATHS.USERS).once('value');
        const users = snapshot.val() || {};
        const tbody = DOM.find('#studentsList');

        if (!tbody) return;

        if (Object.keys(users).length === 0) {
            DOM.html(tbody, `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <p class="text-muted">Нет зарегистрированных учеников</p>
                    </td>
                </tr>
            `);
            return;
        }

        DOM.html(tbody, Object.entries(users).map(([id, user]) => `
            <tr>
                <td>${user.name || ''} ${user.surname || ''}</td>
                <td>${user.email || ''}</td>
                <td>${user.phone || '-'}</td>
                <td>
                    <div class="progress" style="width: 100px;">
                        <div class="progress-bar" style="width: ${user.progress || 0}%"></div>
                    </div>
                    <small>${user.progress || 0}%</small>
                </td>
                <td>
                    <span class="badge bg-${(user.progress || 0) >= 100 ? 'success' : 'warning'}">
                        ${(user.progress || 0) >= 100 ? 'Завершил' : 'В процессе'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-action btn-action-primary btn-sm" onclick="editStudent('${id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-action btn-action-danger btn-sm" onclick="deleteStudent('${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join(''));

    } catch (error) {
        ErrorHandler.handle(error, 'students loading');
    }
}

// ============================================================
// HANDLE ADD STUDENT
// ============================================================

async function handleAddStudent(e) {
    e.preventDefault();

    const email = DOM.val(DOM.find('#studentEmail'));
    const password = DOM.val(DOM.find('#studentPassword'));

    // Validate
    if (!Validator.required(email) || !Validator.email(email)) {
        toast.error('Неверный формат email');
        return;
    }

    if (!Validator.required(password) || !Validator.password(password)) {
        toast.error('Пароль должен содержать минимум 6 символов');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    DOM.html(submitBtn, '<i class="fas fa-spinner fa-spin"></i> Добавление...');

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const userId = userCredential.user.uid;

        await db.ref(DB_PATHS.USERS + '/' + userId).set({
            name: DOM.val(DOM.find('#studentName')).trim(),
            surname: DOM.val(DOM.find('#studentSurname')).trim(),
            email: email.trim(),
            phone: DOM.val(DOM.find('#studentPhone')).trim(),
            role: 'student',
            progress: 0,
            createdAt: new Date().toISOString()
        });

        toast.success('Ученик успешно добавлен!');
        
        const modal = bootstrap.Modal.getInstance(DOM.find('#addStudentModal'));
        if (modal) modal.hide();
        
        e.target.reset();
        loadStudents();

    } catch (error) {
        const errorMessage = ErrorHandler.authError(error);
        toast.error(errorMessage);
    } finally {
        submitBtn.disabled = false;
        DOM.html(submitBtn, originalText);
    }
}

// ============================================================
// DELETE STUDENT
// ============================================================

async function deleteStudent(userId) {
    const confirmed = await toast.confirm(
        'Вы уверены, что хотите удалить этого ученика? Все данные будут потеряны.',
        {
            title: 'Удаление ученика',
            confirmText: 'Удалить',
            cancelText: 'Отмена',
            type: 'error'
        }
    );

    if (confirmed) {
        try {
            await db.ref(DB_PATHS.USERS + '/' + userId).remove();
            toast.success('Ученик удален');
            loadStudents();
        } catch (error) {
            ErrorHandler.handle(error, 'student deletion');
        }
    }
}

// ============================================================
// LOAD MODULES
// ============================================================

async function loadModules() {
    try {
        const snapshot = await db.ref(DB_PATHS.MODULES).once('value');
        const modules = snapshot.val() || {};
        const container = DOM.find('#modulesList');

        if (!container) return;

        if (Object.keys(modules).length === 0) {
            DOM.html(container, `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">Нет модулей</p>
                </div>
            `);
            return;
        }

        DOM.html(container, Object.entries(modules)
            .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
            .map(([id, module]) => `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="admin-card h-100">
                        <div class="d-flex justify-between align-start mb-3">
                            <span class="badge bg-primary">Модуль ${module.order || ''}</span>
                            <div>
                                <button class="btn btn-action btn-action-primary btn-sm" onclick="editModule('${id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-action btn-action-danger btn-sm" onclick="deleteModule('${id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <h5>${module.name || ''}</h5>
                        <p class="text-muted small">${Formatter.truncate(module.description || '', 100)}</p>
                    </div>
                </div>
            `).join(''));

    } catch (error) {
        ErrorHandler.handle(error, 'modules loading');
    }
}

// ============================================================
// HANDLE ADD MODULE
// ============================================================

async function handleAddModule(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    DOM.html(submitBtn, '<i class="fas fa-spinner fa-spin"></i> Добавление...');

    try {
        const newModuleRef = db.ref(DB_PATHS.MODULES).push();
        await newModuleRef.set({
            name: DOM.val(DOM.find('#moduleName')).trim(),
            description: DOM.val(DOM.find('#moduleDescription')).trim(),
            order: parseInt(DOM.val(DOM.find('#moduleOrder'))) || 1,
            createdAt: new Date().toISOString()
        });

        toast.success('Модуль успешно добавлен!');
        
        const modal = bootstrap.Modal.getInstance(DOM.find('#addModuleModal'));
        if (modal) modal.hide();
        
        e.target.reset();
        loadModules();
        loadModuleSelects();

    } catch (error) {
        ErrorHandler.handle(error, 'module addition');
    } finally {
        submitBtn.disabled = false;
        DOM.html(submitBtn, originalText);
    }
}

// ============================================================
// DELETE MODULE
// ============================================================

async function deleteModule(moduleId) {
    const confirmed = await toast.confirm(
        'Вы уверены, что хотите удалить этот модуль? Все уроки и тесты будут также удалены.',
        {
            title: 'Удаление модуля',
            confirmText: 'Удалить',
            cancelText: 'Отмена',
            type: 'error'
        }
    );

    if (confirmed) {
        try {
            await db.ref(DB_PATHS.MODULES + '/' + moduleId).remove();
            toast.success('Модуль удален');
            loadModules();
            loadModuleSelects();
        } catch (error) {
            ErrorHandler.handle(error, 'module deletion');
        }
    }
}

// ============================================================
// LOAD MODULE SELECTS
// ============================================================

async function loadModuleSelects() {
    try {
        const snapshot = await db.ref(DB_PATHS.MODULES).once('value');
        const modules = snapshot.val() || {};
        
        const options = Object.entries(modules)
            .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
            .map(([id, module]) => `<option value="${id}">${module.name || ''}</option>`)
            .join('');

        const lessonModule = DOM.find('#lessonModule');
        if (lessonModule) {
            DOM.html(lessonModule, '<option value="">Выберите модуль</option>' + options);
        }

        const testModule = DOM.find('#testModule');
        if (testModule) {
            DOM.html(testModule, '<option value="">Выберите модуль</option>' + options);
        }

        const moduleFilter = DOM.find('#moduleFilter');
        if (moduleFilter) {
            DOM.html(moduleFilter, '<option value="">Все модули</option>' + options);
        }

        // Cache modules
        window.modulesCache = modules;

    } catch (error) {
        ErrorHandler.handle(error, 'module selects loading');
    }
}

// ============================================================
// LOAD LESSONS
// ============================================================

async function loadLessons() {
    try {
        const moduleFilter = DOM.val(DOM.find('#moduleFilter'));
        
        const snapshot = await db.ref(DB_PATHS.LESSONS).once('value');
        const lessons = snapshot.val() || {};
        const tbody = DOM.find('#lessonsList');

        if (!tbody) return;

        let filteredLessons = Object.entries(lessons);
        if (moduleFilter) {
            filteredLessons = filteredLessons.filter(([id, lesson]) => lesson.moduleId === moduleFilter);
        }

        if (filteredLessons.length === 0) {
            DOM.html(tbody, `
                <tr>
                    <td colspan="4" class="text-center py-5">
                        <p class="text-muted">Нет уроков</p>
                    </td>
                </tr>
            `);
            return;
        }

        DOM.html(tbody, filteredLessons.map(([id, lesson]) => `
            <tr>
                <td>${lesson.name || ''}</td>
                <td><span class="badge bg-secondary">${getModuleName(lesson.moduleId)}</span></td>
                <td><small class="text-muted">${Formatter.truncate(lesson.content || '', 100)}</small></td>
                <td>
                    <button class="btn btn-action btn-action-primary btn-sm" onclick="editLesson('${id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-action btn-action-danger btn-sm" onclick="deleteLesson('${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join(''));

    } catch (error) {
        ErrorHandler.handle(error, 'lessons loading');
    }
}

// ============================================================
// GET MODULE NAME
// ============================================================

function getModuleName(moduleId) {
    return window.modulesCache && window.modulesCache[moduleId] 
        ? window.modulesCache[moduleId].name 
        : 'Неизвестно';
}

// ============================================================
// HANDLE ADD LESSON
// ============================================================

async function handleAddLesson(e) {
    e.preventDefault();

    const moduleId = DOM.val(DOM.find('#lessonModule'));

    if (!Validator.required(moduleId)) {
        toast.warning('Выберите модуль');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    DOM.html(submitBtn, '<i class="fas fa-spinner fa-spin"></i> Добавление...');

    try {
        const newLessonRef = db.ref(DB_PATHS.LESSONS).push();
        await newLessonRef.set({
            name: DOM.val(DOM.find('#lessonName')).trim(),
            moduleId: moduleId,
            content: DOM.val(DOM.find('#lessonContent')).trim(),
            order: parseInt(DOM.val(DOM.find('#lessonOrder'))) || 1,
            createdAt: new Date().toISOString()
        });

        toast.success('Урок успешно добавлен!');
        
        const modal = bootstrap.Modal.getInstance(DOM.find('#addLessonModal'));
        if (modal) modal.hide();
        
        e.target.reset();
        loadLessons();

    } catch (error) {
        ErrorHandler.handle(error, 'lesson addition');
    } finally {
        submitBtn.disabled = false;
        DOM.html(submitBtn, originalText);
    }
}

// ============================================================
// DELETE LESSON
// ============================================================

async function deleteLesson(lessonId) {
    const confirmed = await toast.confirm(
        'Вы уверены, что хотите удалить этот урок?',
        {
            title: 'Удаление урока',
            confirmText: 'Удалить',
            cancelText: 'Отмена',
            type: 'error'
        }
    );

    if (confirmed) {
        try {
            await db.ref(DB_PATHS.LESSONS + '/' + lessonId).remove();
            toast.success('Урок удален');
            loadLessons();
        } catch (error) {
            ErrorHandler.handle(error, 'lesson deletion');
        }
    }
}

// ============================================================
// LOAD TESTS
// ============================================================

async function loadTests() {
    try {
        const snapshot = await db.ref(DB_PATHS.TESTS).once('value');
        const tests = snapshot.val() || {};
        const tbody = DOM.find('#testsList');

        if (!tbody) return;

        if (Object.keys(tests).length === 0) {
            DOM.html(tbody, `
                <tr>
                    <td colspan="4" class="text-center py-5">
                        <p class="text-muted">Нет тестов</p>
                    </td>
                </tr>
            `);
            return;
        }

        DOM.html(tbody, Object.entries(tests).map(([id, test]) => `
            <tr>
                <td>${test.name || ''}</td>
                <td><span class="badge bg-secondary">${getModuleName(test.moduleId)}</span></td>
                <td>${test.questions ? test.questions.length : 0}</td>
                <td>
                    <button class="btn btn-action btn-action-primary btn-sm" onclick="editTest('${id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-action btn-action-danger btn-sm" onclick="deleteTest('${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join(''));

    } catch (error) {
        ErrorHandler.handle(error, 'tests loading');
    }
}

// ============================================================
// ADD QUESTION
// ============================================================

let questionCount = 1;

function addQuestion() {
    questionCount++;
    const container = DOM.find('#questionsContainer');
    
    const questionHTML = `
        <div class="question-item mb-4 p-3 bg-light rounded">
            <h6>Вопрос ${questionCount}</h6>
            <div class="mb-2">
                <input type="text" class="form-control question-text" placeholder="Текст вопроса" required>
            </div>
            <div class="mb-2">
                <label class="form-label">Варианты ответов</label>
                <div class="answers-container">
                    <input type="text" class="form-control mb-2 answer-option" placeholder="Вариант 1" required>
                    <input type="text" class="form-control mb-2 answer-option" placeholder="Вариант 2" required>
                    <input type="text" class="form-control mb-2 answer-option" placeholder="Вариант 3" required>
                    <input type="text" class="form-control mb-2 answer-option" placeholder="Вариант 4" required>
                </div>
            </div>
            <div class="mb-2">
                <label class="form-label">Правильный ответ</label>
                <select class="form-select correct-answer">
                    <option value="0">Вариант 1</option>
                    <option value="1">Вариант 2</option>
                    <option value="2">Вариант 3</option>
                    <option value="3">Вариант 4</option>
                </select>
            </div>
            <button type="button" class="btn btn-action btn-action-danger btn-sm" onclick="this.closest('.question-item').remove()">
                <i class="fas fa-trash"></i> Удалить вопрос
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', questionHTML);
}

// ============================================================
// HANDLE ADD TEST
// ============================================================

async function handleAddTest(e) {
    e.preventDefault();

    const moduleId = DOM.val(DOM.find('#testModule'));

    if (!Validator.required(moduleId)) {
        toast.warning('Выберите модуль');
        return;
    }

    const questions = [];
    DOM.findAll('.question-item').forEach(item => {
        const options = [];
        item.querySelectorAll('.answer-option').forEach(opt => options.push(opt.value.trim()));

        questions.push({
            text: item.querySelector('.question-text').value.trim(),
            options: options,
            correctAnswer: parseInt(item.querySelector('.correct-answer').value)
        });
    });

    if (questions.length === 0) {
        toast.warning('Добавьте хотя бы один вопрос');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    DOM.html(submitBtn, '<i class="fas fa-spinner fa-spin"></i> Добавление...');

    try {
        const newTestRef = db.ref(DB_PATHS.TESTS).push();
        await newTestRef.set({
            name: DOM.val(DOM.find('#testName')).trim(),
            moduleId: moduleId,
            questions: questions,
            createdAt: new Date().toISOString()
        });

        toast.success('Тест успешно добавлен!');
        
        const modal = bootstrap.Modal.getInstance(DOM.find('#addTestModal'));
        if (modal) modal.hide();
        
        e.target.reset();
        questionCount = 1;
        loadTests();

    } catch (error) {
        ErrorHandler.handle(error, 'test addition');
    } finally {
        submitBtn.disabled = false;
        DOM.html(submitBtn, originalText);
    }
}

// ============================================================
// DELETE TEST
// ============================================================

async function deleteTest(testId) {
    const confirmed = await toast.confirm(
        'Вы уверены, что хотите удалить этот тест?',
        {
            title: 'Удаление теста',
            confirmText: 'Удалить',
            cancelText: 'Отмена',
            type: 'error'
        }
    );

    if (confirmed) {
        try {
            await db.ref(DB_PATHS.TESTS + '/' + testId).remove();
            toast.success('Тест удален');
            loadTests();
        } catch (error) {
            ErrorHandler.handle(error, 'test deletion');
        }
    }
}

// ============================================================
// LOAD RESULTS
// ============================================================

async function loadResults() {
    try {
        const snapshot = await db.ref(DB_PATHS.TEST_RESULTS).once('value');
        const results = snapshot.val() || {};
        const tbody = DOM.find('#resultsList');

        if (!tbody) return;

        if (Object.keys(results).length === 0) {
            DOM.html(tbody, `
                <tr>
                    <td colspan="4" class="text-center py-5">
                        <p class="text-muted">Нет результатов тестов</p>
                    </td>
                </tr>
            `);
            return;
        }

        DOM.html(tbody, Object.entries(results).map(([id, result]) => `
            <tr>
                <td>${result.studentName || 'Неизвестно'}</td>
                <td>${result.testName || 'Неизвестно'}</td>
                <td>
                    <span class="badge bg-${result.score >= 70 ? 'success' : 'danger'}">
                        ${result.score}%
                    </span>
                </td>
                <td>${result.date ? Formatter.date(result.date) : '-'}</td>
            </tr>
        `).join(''));

    } catch (error) {
        ErrorHandler.handle(error, 'results loading');
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
// REFRESH DATA
// ============================================================

function refreshData() {
    const activeLink = DOM.find('.admin-nav-link.active');
    if (activeLink) {
        const section = activeLink.dataset.section;
        loadSectionData(section);
        toast.info('Данные обновлены');
    }
}

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.deleteStudent = deleteStudent;
window.editStudent = (id) => toast.info('Редактирование ученика в разработке');
window.deleteModule = deleteModule;
window.editModule = (id) => toast.info('Редактирование модуля в разработке');
window.deleteLesson = deleteLesson;
window.editLesson = (id) => toast.info('Редактирование урока в разработке');
window.deleteTest = deleteTest;
window.editTest = (id) => toast.info('Редактирование теста в разработке');
window.addQuestion = addQuestion;
window.refreshData = refreshData;

console.log('⚙️ Admin.js загружен');