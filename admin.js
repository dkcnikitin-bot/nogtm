// Проверка авторизации администратора
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

// Навигация по разделам
document.querySelectorAll('.admin-nav a[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Убираем активный класс
        document.querySelectorAll('.admin-nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Скрываем все секции
        document.querySelectorAll('.admin-section').forEach(s => s.classList.add('d-none'));
        
        // Показываем выбранную секцию
        const section = link.dataset.section;
        document.getElementById(section + 'Section').classList.remove('d-none');
        
        // Обновляем заголовок
        const titles = {
            'dashboard': 'Панель управления',
            'students': 'Ученики',
            'modules': 'Модули',
            'lessons': 'Уроки',
            'tests': 'Тесты',
            'results': 'Результаты'
        };
        document.getElementById('pageTitle').textContent = titles[section] || 'Панель управления';
        
        // Загружаем данные
        if (section === 'dashboard') loadDashboard();
        if (section === 'students') loadStudents();
        if (section === 'modules') loadModules();
        if (section === 'lessons') { loadModuleSelects(); loadLessons(); }
        if (section === 'tests') { loadModuleSelects(); loadTests(); }
        if (section === 'results') loadResults();
    });
});

// Загрузка данных дашборда
function loadDashboard() {
    // Ученики
    db.ref(DB_PATHS.USERS).once('value', (snapshot) => {
        const users = snapshot.val() || {};
        document.getElementById('totalStudents').textContent = Object.keys(users).length;
        
        // Последние регистрации
        const recent = Object.entries(users)
            .sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt))
            .slice(0, 5);
        
        const tbody = document.getElementById('recentStudents');
        tbody.innerHTML = recent.map(([id, user]) => `
            <tr>
                <td>${user.name || ''} ${user.surname || ''}</td>
                <td>${user.email || ''}</td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '-'}</td>
                <td>
                    <div class="progress" style="width: 100px;">
                        <div class="progress-bar" style="width: ${user.progress || 0}%"></div>
                    </div>
                    <small>${user.progress || 0}%</small>
                </td>
            </tr>
        `).join('');
    });
    
    // Пройденные тесты
    db.ref(DB_PATHS.TEST_RESULTS).once('value', (snapshot) => {
        const results = snapshot.val() || {};
        document.getElementById('completedTests').textContent = Object.keys(results).length;
        
        // Средний балл
        const scores = Object.values(results).map(r => r.score);
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        document.getElementById('avgScore').textContent = avg + '%';
    });
}

// Загрузка учеников
function loadStudents() {
    db.ref(DB_PATHS.USERS).once('value', (snapshot) => {
        const users = snapshot.val() || {};
        const tbody = document.getElementById('studentsList');
        
        tbody.innerHTML = Object.entries(users).map(([id, user]) => `
            <tr>
                <td>${user.name || ''} ${user.surname || ''}</td>
                <td>${user.email || ''}</td>
                <td>${user.phone || ''}</td>
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
        `).join('');
    });
}

// Добавление ученика
document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('studentEmail').value;
    const password = document.getElementById('studentPassword').value;
    
    try {
        // Создаем пользователя в Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const userId = userCredential.user.uid;
        
        // Сохраняем данные в Realtime Database
        await db.ref(DB_PATHS.USERS + '/' + userId).set({
            name: document.getElementById('studentName').value,
            surname: document.getElementById('studentSurname').value,
            email: email,
            phone: document.getElementById('studentPhone').value,
            role: 'student',
            progress: 0,
            createdAt: new Date().toISOString()
        });
        
        alert('Ученик успешно добавлен!');
        bootstrap.Modal.getInstance(document.getElementById('addStudentModal')).hide();
        e.target.reset();
        loadStudents();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
});

// Удаление ученика
async function deleteStudent(userId) {
    if (confirm('Вы уверены, что хотите удалить этого ученика?')) {
        try {
            await db.ref(DB_PATHS.USERS + '/' + userId).remove();
            loadStudents();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

// Загрузка модулей
function loadModules() {
    db.ref(DB_PATHS.MODULES).once('value', (snapshot) => {
        const modules = snapshot.val() || {};
        const container = document.getElementById('modulesList');
        
        container.innerHTML = Object.entries(modules)
            .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
            .map(([id, module]) => `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="admin-card h-100">
                        <div class="d-flex justify-content-between align-items-start mb-3">
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
                        <p class="text-muted small">${module.description || ''}</p>
                    </div>
                </div>
            `).join('');
    });
}

// Добавление модуля
document.getElementById('addModuleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const newModuleRef = db.ref(DB_PATHS.MODULES).push();
        await newModuleRef.set({
            name: document.getElementById('moduleName').value,
            description: document.getElementById('moduleDescription').value,
            order: parseInt(document.getElementById('moduleOrder').value),
            createdAt: new Date().toISOString()
        });
        
        alert('Модуль успешно добавлен!');
        bootstrap.Modal.getInstance(document.getElementById('addModuleModal')).hide();
        e.target.reset();
        loadModules();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
});

// Удаление модуля
async function deleteModule(moduleId) {
    if (confirm('Вы уверены, что хотите удалить этот модуль?')) {
        try {
            await db.ref(DB_PATHS.MODULES + '/' + moduleId).remove();
            loadModules();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

// Загрузка списка модулей в select
function loadModuleSelects() {
    db.ref(DB_PATHS.MODULES).once('value', (snapshot) => {
        const modules = snapshot.val() || {};
        const options = Object.entries(modules)
            .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
            .map(([id, module]) => `<option value="${id}">${module.name || ''}</option>`)
            .join('');
        
        document.getElementById('lessonModule').innerHTML = '<option value="">Выберите модуль</option>' + options;
        document.getElementById('testModule').innerHTML = '<option value="">Выберите модуль</option>' + options;
        document.getElementById('moduleFilter').innerHTML = '<option value="">Все модули</option>' + options;
    });
}

// Загрузка уроков
function loadLessons() {
    const moduleFilter = document.getElementById('moduleFilter').value;
    let query = db.ref(DB_PATHS.LESSONS);
    
    query.once('value', (snapshot) => {
        const lessons = snapshot.val() || {};
        const tbody = document.getElementById('lessonsList');
        
        let filteredLessons = Object.entries(lessons);
        if (moduleFilter) {
            filteredLessons = filteredLessons.filter(([id, lesson]) => lesson.moduleId === moduleFilter);
        }
        
        tbody.innerHTML = filteredLessons.map(([id, lesson]) => `
            <tr>
                <td>${lesson.name || ''}</td>
                <td><span class="badge bg-secondary">${getModuleName(lesson.moduleId)}</span></td>
                <td><small class="text-muted">${(lesson.content || '').substring(0, 100)}...</small></td>
                <td>
                    <button class="btn btn-action btn-action-primary btn-sm" onclick="editLesson('${id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-action btn-action-danger btn-sm" onclick="deleteLesson('${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    });
}

// Получение названия модуля
function getModuleName(moduleId) {
    // Кэшируем модули для быстрого доступа
    if (!window.modulesCache) {
        db.ref(DB_PATHS.MODULES).once('value', (snapshot) => {
            window.modulesCache = snapshot.val() || {};
        });
    }
    return window.modulesCache && window.modulesCache[moduleId] ? window.modulesCache[moduleId].name : 'Неизвестно';
}

// Добавление урока
document.getElementById('addLessonForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const newLessonRef = db.ref(DB_PATHS.LESSONS).push();
        await newLessonRef.set({
            name: document.getElementById('lessonName').value,
            moduleId: document.getElementById('lessonModule').value,
            content: document.getElementById('lessonContent').value,
            createdAt: new Date().toISOString()
        });
        
        alert('Урок успешно добавлен!');
        bootstrap.Modal.getInstance(document.getElementById('addLessonModal')).hide();
        e.target.reset();
        loadLessons();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
});

// Удаление урока
async function deleteLesson(lessonId) {
    if (confirm('Вы уверены, что хотите удалить этот урок?')) {
        try {
            await db.ref(DB_PATHS.LESSONS + '/' + lessonId).remove();
            loadLessons();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

// Загрузка тестов
function loadTests() {
    db.ref(DB_PATHS.TESTS).once('value', (snapshot) => {
        const tests = snapshot.val() || {};
        const tbody = document.getElementById('testsList');
        
        tbody.innerHTML = Object.entries(tests).map(([id, test]) => `
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
        `).join('');
    });
}

// Добавление вопроса в форму теста
let questionCount = 1;
function addQuestion() {
    questionCount++;
    const container = document.getElementById('questionsContainer');
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

// Добавление теста
document.getElementById('addTestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const questions = [];
    document.querySelectorAll('.question-item').forEach(item => {
        const options = [];
        item.querySelectorAll('.answer-option').forEach(opt => options.push(opt.value));
        
        questions.push({
            text: item.querySelector('.question-text').value,
            options: options,
            correctAnswer: parseInt(item.querySelector('.correct-answer').value)
        });
    });
    
    try {
        const newTestRef = db.ref(DB_PATHS.TESTS).push();
        await newTestRef.set({
            name: document.getElementById('testName').value,
            moduleId: document.getElementById('testModule').value,
            questions: questions,
            createdAt: new Date().toISOString()
        });
        
        alert('Тест успешно добавлен!');
        bootstrap.Modal.getInstance(document.getElementById('addTestModal')).hide();
        e.target.reset();
        questionCount = 1;
        loadTests();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
});

// Удаление теста
async function deleteTest(testId) {
    if (confirm('Вы уверены, что хотите удалить этот тест?')) {
        try {
            await db.ref(DB_PATHS.TESTS + '/' + testId).remove();
            loadTests();
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }
}

// Загрузка результатов тестов
function loadResults() {
    db.ref(DB_PATHS.TEST_RESULTS).once('value', (snapshot) => {
        const results = snapshot.val() || {};
        const tbody = document.getElementById('resultsList');
        
        tbody.innerHTML = Object.entries(results).map(([id, result]) => `
            <tr>
                <td>${result.studentName || 'Неизвестно'}</td>
                <td>${result.testName || 'Неизвестно'}</td>
                <td>
                    <span class="badge bg-${result.score >= 70 ? 'success' : 'danger'}">
                        ${result.score}%
                    </span>
                </td>
                <td>${result.date ? new Date(result.date).toLocaleDateString('ru-RU') : '-'}</td>
            </tr>
        `).join('');
    });
}

// Обновление данных
function refreshData() {
    const activeSection = document.querySelector('.admin-nav a.active').dataset.section;
    if (activeSection === 'dashboard') loadDashboard();
    if (activeSection === 'students') loadStudents();
    if (activeSection === 'modules') loadModules();
    if (activeSection === 'lessons') loadLessons();
    if (activeSection === 'tests') loadTests();
    if (activeSection === 'results') loadResults();
}

// Загрузка при старте
loadDashboard();
