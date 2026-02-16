// Проверка авторизации
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        loadTests();
        loadResults();
    }
});

// Загрузка тестов
function loadTests() {
    db.ref(DB_PATHS.TESTS).once('value', (snapshot) => {
        const tests = snapshot.val() || {};
        const container = document.getElementById('testsContainer');
        
        if (Object.keys(tests).length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Тесты пока не добавлены</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = Object.entries(tests).map(([id, test]) => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="admin-card h-100">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <span class="badge bg-primary">
                            <i class="fas fa-question-circle"></i> ${test.questions ? test.questions.length : 0} вопросов
                        </span>
                    </div>
                    <h5>${test.name || 'Тест'}</h5>
                    <p class="text-muted small mb-3">
                        Модуль: <span id="test-module-${id}">Загрузка...</span>
                    </p>
                    <button class="btn btn-primary w-100" onclick="startTest('${id}')">
                        <i class="fas fa-play"></i> Начать тест
                    </button>
                </div>
            </div>
        `).join('');
        
        // Загружаем названия модулей
        Object.entries(tests).forEach(([id, test]) => {
            if (test.moduleId) {
                db.ref(DB_PATHS.MODULES + '/' + test.moduleId).once('value', (moduleSnapshot) => {
                    const module = moduleSnapshot.val();
                    if (module) {
                        const moduleSpan = document.getElementById('test-module-' + id);
                        if (moduleSpan) {
                            moduleSpan.textContent = module.name || 'Модуль';
                        }
                    }
                });
            }
        });
    });
}

// Загрузка результатов
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

// Начало теста
function startTest(testId) {
    localStorage.setItem('selectedTest', testId);
    window.location.href = 'test.html';
}

// Выход
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}
