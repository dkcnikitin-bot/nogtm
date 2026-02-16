let currentTest = null;
let currentQuestionIndex = 0;
let userAnswers = [];

// Проверка авторизации
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        loadTest();
    }
});

// Загрузка теста
function loadTest() {
    const testId = localStorage.getItem('selectedTest');
    
    if (!testId) {
        window.location.href = 'tests.html';
        return;
    }
    
    db.ref(DB_PATHS.TESTS + '/' + testId).once('value', (snapshot) => {
        const test = snapshot.val();
        if (!test || !test.questions || test.questions.length === 0) {
            alert('Тест не найден или не содержит вопросов');
            window.location.href = 'tests.html';
            return;
        }
        
        currentTest = test;
        userAnswers = new Array(test.questions.length).fill(null);
        currentQuestionIndex = 0;
        
        document.getElementById('testTitle').textContent = test.name || 'Тест';
        showQuestion();
    });
}

// Показать вопрос
function showQuestion() {
    const question = currentTest.questions[currentQuestionIndex];
    const container = document.getElementById('questionContainer');
    
    document.getElementById('testProgress').textContent = 
        `Вопрос ${currentQuestionIndex + 1} из ${currentTest.questions.length}`;
    
    container.innerHTML = `
        <div class="test-question fade-in-up">
            <h4>${question.text || 'Вопрос'}</h4>
            <div class="answers-list">
                ${question.options.map((option, index) => `
                    <div class="form-check mb-3">
                        <input class="form-check-input" type="radio" 
                            name="answer" id="option${index}" value="${index}"
                            ${userAnswers[currentQuestionIndex] === index ? 'checked' : ''}
                            onchange="selectAnswer(${index})">
                        <label class="form-check-label" for="option${index}">
                            ${option}
                        </label>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Обновляем кнопки навигации
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').textContent = 
        currentQuestionIndex === currentTest.questions.length - 1 ? 'Завершить' : 'Далее';
}

// Выбор ответа
function selectAnswer(answerIndex) {
    userAnswers[currentQuestionIndex] = answerIndex;
}

// Следующий вопрос
function nextQuestion() {
    if (userAnswers[currentQuestionIndex] === null) {
        alert('Пожалуйста, выберите ответ');
        return;
    }
    
    if (currentQuestionIndex < currentTest.questions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        finishTest();
    }
}

// Предыдущий вопрос
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

// Завершение теста
async function finishTest() {
    // Подсчет результата
    let correctAnswers = 0;
    currentTest.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswer) {
            correctAnswers++;
        }
    });
    
    const score = Math.round((correctAnswers / currentTest.questions.length) * 100);
    
    // Сохранение результата
    const userId = auth.currentUser.uid;
    const userName = await getUserName(userId);
    
    await db.ref(DB_PATHS.TEST_RESULTS).push({
        userId: userId,
        studentName: userName,
        testName: currentTest.name,
        score: score,
        date: new Date().toISOString()
    });
    
    // Показываем результат
    document.getElementById('testContainer').classList.add('d-none');
    document.getElementById('resultContainer').classList.remove('d-none');
    
    document.getElementById('finalScore').textContent = score + '%';
    
    if (score >= 70) {
        document.getElementById('resultMessage').innerHTML = `
            <span class="text-success"><i class="fas fa-check-circle"></i> Поздравляем! Вы успешно прошли тест.</span>
        `;
    } else {
        document.getElementById('resultMessage').innerHTML = `
            <span class="text-warning"><i class="fas fa-exclamation-circle"></i> Попробуйте пройти тест еще раз после повторения материала.</span>
        `;
    }
}

// Получение имени пользователя
async function getUserName(userId) {
    const snapshot = await db.ref(DB_PATHS.USERS + '/' + userId).once('value');
    const userData = snapshot.val();
    return userData ? `${userData.name || ''} ${userData.surname || ''}`.trim() : 'Ученик';
}

// Перезапуск теста
function restartTest() {
    document.getElementById('resultContainer').classList.add('d-none');
    document.getElementById('testContainer').classList.remove('d-none');
    currentQuestionIndex = 0;
    userAnswers = new Array(currentTest.questions.length).fill(null);
    showQuestion();
}

// Выход
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}
