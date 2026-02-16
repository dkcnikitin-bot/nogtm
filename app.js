function waitForFirebase(callback) {
    if (typeof db !== 'undefined' && typeof auth !== 'undefined') {
        callback();
    } else {
        setTimeout(() => waitForFirebase(callback), 100);
    }
}

function loadModulesOnMainPage() {
    waitForFirebase(() => {
        db.ref(DB_PATHS.MODULES).once('value', (snapshot) => {
            const modules = snapshot.val();
            const container = document.getElementById('modulesList');
            
            if (!modules || Object.keys(modules).length === 0) {
                // Инициализируем данные если их нет
                if (typeof window.dataInit_initializeApp === 'function') {
                    window.dataInit_initializeApp().then(() => {
                        setTimeout(loadModulesOnMainPage, 1000);
                    });
                } else {
                    container.innerHTML = `
                        <div class="card text-center">
                            <div class="card-body">
                                <i class="fas fa-exclamation-triangle fa-2x" style="color: var(--accent-primary); margin-bottom: var(--spacing-md);"></i>
                                <p>Модули не загружены. Пожалуйста, запустите диагностику.</p>
                                <a href="diagnostics.html" class="btn btn-primary">Запустить диагностику</a>
                            </div>
                        </div>
                    `;
                }
                return;
            }
            
            // Сортируем модули по порядковому номеру
            const sortedModules = Object.entries(modules)
                .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));
            
            container.innerHTML = sortedModules.map(([id, module]) => `
                <div class="card module-card">
                    <span class="module-number">${module.order || ''}</span>
                    <h4 style="margin-bottom: var(--spacing-md);">${module.name || ''}</h4>
                    <p style="flex: 1;">${module.description || ''}</p>
                    <a href="login.html" class="btn btn-primary w-100 mt-auto">
                        Подробнее
                    </a>
                </div>
            `).join('');
        }).catch(error => {
            console.error('Ошибка загрузки модулей:', error);
            const container = document.getElementById('modulesList');
            container.innerHTML = `
                <div class="card text-center">
                    <div class="card-body">
                        <i class="fas fa-exclamation-triangle fa-2x" style="color: #f44336; margin-bottom: var(--spacing-md);"></i>
                        <p>Ошибка загрузки модулей</p>
                        <p class="text-muted" style="font-size: var(--font-size-sm);">${error.message}</p>
                        <a href="diagnostics.html" class="btn btn-primary">Проверить подключение</a>
                    </div>
                </div>
            `;
        });
    });
}

// Отслеживание состояния авторизации для навигации
waitForFirebase(() => {
    auth.onAuthStateChanged((user) => {
        const authNavBtn = document.getElementById('authNavBtn');
        if (authNavBtn) {
            if (user) {
                db.ref(DB_PATHS.USERS + '/' + user.uid).once('value', (snapshot) => {
                    const userData = snapshot.val();
                    if (userData && userData.role === 'admin') {
                        authNavBtn.textContent = 'Админ-панель';
                        authNavBtn.href = 'admin.html';
                    } else {
                        authNavBtn.textContent = 'Кабинет';
                        authNavBtn.href = 'dashboard.html';
                    }
                });
            } else {
                authNavBtn.textContent = 'Войти';
                authNavBtn.href = 'login.html';
            }
        }
    });
});

// Обработка формы контактов
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Спасибо за сообщение! Мы свяжемся с вами в ближайшее время.');
    e.target.reset();
});

// Анимация navbar при скролле
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Загрузка модулей при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadModulesOnMainPage();
});