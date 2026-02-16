
console.log('[data-init.js] Script loading...');

// Готовые модули курса
const defaultModules = [
    {
        id: 'module_1',
        name: 'Основные принципы инструкторства',
        description: 'Необходимые качества инструктора, ораторское искусство, работа с учениками, предотвращение конфликтов',
        order: 1
    },
    {
        id: 'module_2',
        name: 'Методология',
        description: 'Поэтапная инструкция деятельности инструктора, разработка авторских программ, создание сертификатов',
        order: 2
    },
    {
        id: 'module_3',
        name: 'Юридическое оформление',
        description: 'Открытие школы, выбор организационной формы, лицензирование, договоры и документы',
        order: 3
    },
    {
        id: 'module_4',
        name: 'Экспертность. Мастер маникюра. Теория',
        description: 'Материаловедение, заболевания ногтей, строение и архитектура ногтя, комби для разных уровней',
        order: 4
    },
    {
        id: 'module_5',
        name: 'Экспертность. Мастер маникюра. Практика',
        description: 'Комби-маникюр, восстановление формы, аппаратный маникюр, укрепление гелем, французский маникюр',
        order: 5
    },
    {
        id: 'module_6',
        name: 'Упаковка курса',
        description: 'Оформление страницы мастера, ведение блога, сторис, прямые эфиры, монтаж видео и фотокоррекция',
        order: 6
    },
    {
        id: 'module_7',
        name: 'Позиционирование. Реклама и продвижение',
        description: 'Портрет ЦА, анализ конкурентов, УТП, офферы и лид-магниты, рекламные методы, использование ИИ',
        order: 7
    },
    {
        id: 'module_8',
        name: 'Разработка курса',
        description: 'Построение курса, система обучения по стандартам, создание учебных материалов',
        order: 8
    },
    {
        id: 'module_9',
        name: 'Экономическая модель',
        description: 'Окупаемость курсов, выбор помещения, документооборот, расходные материалы, поиск моделей',
        order: 9
    },
    {
        id: 'module_10',
        name: 'Практика на живых учениках',
        description: 'Презентации, работа с реальными учениками, проведение курса, выдача сертификатов, стажировка',
        order: 10
    }
];

// Готовые уроки для модулей
const defaultLessons = [
    // Модуль 1
    { moduleId: 'module_1', name: 'Необходимые качества инструктора', content: 'Инструктор - это не просто мастер с опытом, это педагог и наставник. Ключевые качества: коммуникабельность, педагогическое мышление, терпение, эмпатия, профессионализм.' },
    { moduleId: 'module_1', name: 'Ораторское искусство', content: 'Умение говорить уверенно и убедительно - ключевой навык инструктора. Изучите дыхательные упражнения, структуру выступления и работу с аудиторией.' },
    { moduleId: 'module_1', name: 'Работа с учениками', content: 'Каждый ученик уникален. Основные типы: быстрый, медленный, скептик, перфекционист, неуверенный. Научитесь определять тип и адаптировать стиль обучения.' },
    { moduleId: 'module_1', name: 'Предотвращение конфликтов', content: 'Конфликты неизбежны, но их можно предотвратить. Техники активного слушания, методы деэскалации, превращение конфликта в конструктивный диалог.' },
    // Модуль 2
    { moduleId: 'module_2', name: 'Поэтапная инструкция деятельности', content: 'Подготовка к занятию: планирование, подготовка материалов. Проведение: вступление, демонстрация, практика, самостоятельная работа. После занятия: обратная связь, анализ.' },
    { moduleId: 'module_2', name: 'Разработка авторской программы', content: 'Этапы: определение ЦА, формирование целей, структурирование, разработка материалов, система оценки, тестирование.' },
    { moduleId: 'module_2', name: 'Разработка сертификатов', content: 'Требования к сертификату: структура, дизайн, защита от подделки, верификация. Цифровые сертификаты и системы верификации.' },
    // Модуль 3
    { moduleId: 'module_3', name: 'Открытие своей школы', content: 'Выбор направления, анализ рынка, формирование УТП, бизнес-планирование, поиск финансирования.' },
    { moduleId: 'module_3', name: 'Организационные формы', content: 'Самозанятость: простота, низкие налоги. ИП: больше возможностей, льготы. ООО: защита имущества, престиж.' },
    { moduleId: 'module_3', name: 'Помещение и требования', content: 'Требования: площадь, вентиляция, освещение, санитария, безопасность. Аренда: выбор, договор, ремонт, согласование.' },
    // Модуль 4
    { moduleId: 'module_4', name: 'Материаловедение', content: 'Типы покрытий: лаки, гель-лаки, гели, акригели. Химия: состав, взаимодействие, полимеризация. Выбор: критерии качества, совместимость.' },
    { moduleId: 'module_4', name: 'Заболевания ногтей', content: 'Группы заболеваний: грибковые, воспалительные, травмы, врожденные, системные. Противопоказания к процедурам.' },
    { moduleId: 'module_4', name: 'Строение и архитектура ногтя', content: 'Анатомия: пластина, ложе, кутикула, матрикс. Архитектура: stress zone, apex, c-curve, баланс и пропорции.' },
    // Модуль 5
    { moduleId: 'module_5', name: 'Комби-маникюр', content: 'Преимущества: чистота, здоровье ногтя, идеальная основа. Техника: подготовка, классический этап, аппаратный этап, завершение.' },
    { moduleId: 'module_5', name: 'Укрепление гелем', content: 'Показания: слабые ногти, ломкость. Техника: подготовка, бондинг, выкладка, формирование, опил. Виды: однофазное, двухфазное, трехфазное.' },
    { moduleId: 'module_5', name: 'Французский маникюр', content: 'Виды: классический, цветной, обратный, миллениум. Техника: разметка, улыбка, работа с цветом, покрытие. Секреты идеального френча.' },
    // Модуль 6
    { moduleId: 'module_6', name: 'Оформление страницы мастера', content: 'Структура: аватар, обложка, описание, контакты, услуги. Визуальный стиль: цветовая гамма, шрифты, фотографии. Контент-стратегия: рубрики, регулярность.' },
    { moduleId: 'module_6', name: 'Ведение блога', content: 'Типы контента: обучающие, кейсы, личный, промо. Планирование: контент-план, время публикации, частота. Написание: заголовки, структура, призывы.' },
    { moduleId: 'module_6', name: 'Сторис и прямые эфиры', content: 'Сторис: рубрики, интерактивы, частота. Эфиры: темы, подготовка, вовлечение, монетизация. Инструменты: музыка, фильтры, стикеры.' },
    // Модуль 7
    { moduleId: 'module_7', name: 'Портрет целевой аудитории', content: 'Исследование: анализ конкурентов, опросы, соцсети. Сегментация: географическая, демографическая, психографическая. Портрет: возраст, доход, боли, цели.' },
    { moduleId: 'module_7', name: 'УТП и офферы', content: 'УТП: что отличает, какую проблему решаете. Офферы: лид-магниты, трипваеры, основной, бэкенд. Тексты продаж: заголовки, описание, призывы.' },
    { moduleId: 'module_7', name: 'Продвижение и реклама', content: 'Бесплатные: SEO, соцсети, партнерства, SMM. Платные: таргет, контекст, инфлюенс-маркетинг, площадки. Бюджетирование и ROI.' },
    // Модуль 8
    { moduleId: 'module_8', name: 'Построение курса', content: 'Цели: чему научат, какой результат. Структура: логика, баланс теории и практики, проверки. Материалы: видео, презентации, чек-листы, шаблоны.' },
    { moduleId: 'module_8', name: 'Стандарты обучения', content: 'Требования: актуальность, методика, обратная связь. Метрики: тестирование, практические задания, финальный проект. Сертификация: критерии, уровни.' },
    // Модуль 9
    { moduleId: 'module_9', name: 'Окупаемость курсов', content: 'Расчет: затраты на разработку и проведение, маржинальность. Ценообразование: стратегии, психология, скидки. Окупаемость: точка безубыточности, ROI, LTV.' },
    { moduleId: 'module_9', name: 'Организация рабочего места', content: 'Оборудование: рабочие места, освещение, вентиляция, мебель. Инструменты: наборы, расходные, расчет. Документация: журналы, договоры, акты.' },
    // Модуль 10
    { moduleId: 'module_10', name: 'Практика ведения презентаций', content: 'Структура: введение, основная часть, заключение. Дизайн: слайды, графика, шрифты, цвет. Подача: речь, темп, язык тела, работа с аудиторией.' },
    { moduleId: 'module_10', name: 'Проведение курса', content: 'Подготовка: планирование, материалы, помещение. Проведение: первое занятие, динамика группы, трудности. Завершение: тестирование, сертификаты, обратная связь.' },
    { moduleId: 'module_10', name: 'Стажировка', content: 'Организация: выбор стажеров, программа, наставничество. Роль стажера: наблюдение, помощь, самостоятельная работа. Оценка: критерии, обратная связь, рекомендации.' }
];

// Готовые тесты
const defaultTests = [
    {
        moduleId: 'module_1',
        name: 'Тест: Основные принципы инструкторства',
        questions: [
            { text: 'Какое качество является ключевым для успешного инструктора?', options: ['Высокий голос', 'Коммуникабельность', 'Быстрая речь', 'Строгий вид'], correctAnswer: 1 },
            { text: 'Что помогает преодолеть страх публичных выступлений?', options: ['Избегать выступлений', 'Дыхательные упражнения', 'Говорить быстрее', 'Не готовиться'], correctAnswer: 1 },
            { text: 'Как работать со скептиком среди учеников?', options: ['Игнорировать', 'Предоставлять факты и доказательства', 'Критиковать', 'Исключить из группы'], correctAnswer: 1 },
            { text: 'Что является важным при предотвращении конфликтов?', options: ['Наказывать виновных', 'Активное слушание', 'Игнорировать проблемы', 'Повышать голос'], correctAnswer: 1 },
            { text: 'Какое качество помогает инструктору понимать состояние ученика?', options: ['Эмпатия', 'Гордость', 'Строгость', 'Безразличие'], correctAnswer: 0 }
        ]
    },
    {
        moduleId: 'module_2',
        name: 'Тест: Методология',
        questions: [
            { text: 'С чего начинается подготовка к занятию?', options: ['Проведение занятия', 'Планирование темы и целей', 'Выдача сертификатов', 'Анализ результатов'], correctAnswer: 1 },
            { text: 'Что является первым этапом разработки авторской программы?', options: ['Создание дизайна', 'Определение целевой аудитории', 'Печать материалов', 'Продажа курса'], correctAnswer: 1 },
            { text: 'Какая информация обязательна в сертификате?', options: ['Только имя', 'ФИО, название курса, дата, подпись', 'Только дата', 'Только название курса'], correctAnswer: 1 },
            { text: 'Что включает этап проведения занятия?', options: ['Только демонстрация', 'Вступление, демонстрация, практика, самостоятельная работа', 'Только практика', 'Только теория'], correctAnswer: 1 },
            { text: 'Зачем нужна система верификации сертификатов?', options: ['Для красоты', 'Для защиты от подделки', 'Не нужна', 'Для увеличения цены'], correctAnswer: 1 }
        ]
    },
    {
        moduleId: 'module_3',
        name: 'Тест: Юридическое оформление',
        questions: [
            { text: 'Какая организационная форма самая простая для регистрации?', options: ['ООО', 'ИП', 'Самозанятость', 'АО'], correctAnswer: 2 },
            { text: 'Что является преимуществом ООО?', options: ['Простая регистрация', 'Защита личного имущества', 'Низкие налоги', 'Нет отчетности'], correctAnswer: 1 },
            { text: 'Какое требование обязательно к помещению школы?', options: ['Большая площадь', 'Вентиляция и освещение', 'Дорогой ремонт', 'Центральное расположение'], correctAnswer: 1 },
            { text: 'Для чего нужно лицензирование образовательной деятельности?', options: ['Не нужно', 'Для законности деятельности', 'Для повышения цены', 'Для престижа'], correctAnswer: 1 },
            { text: 'Что включает договор аренды?', options: ['Только цену', 'Условия, права, обязанности, ответственность', 'Только срок', 'Только адрес'], correctAnswer: 1 }
        ]
    }
];

// Данные администратора
const adminData = {
    email: 'admin@lobacheva-academy.ru',
    password: 'Admin2024!',
    name: 'Анна',
    surname: 'Лобачева',
    role: 'admin'
};

// Инициализация модулей
async function initializeModules() {
    console.log('[data-init.js] Initializing modules...');
    
    const modulesSnapshot = await db.ref('modules').once('value');
    
    if (!modulesSnapshot.exists() || Object.keys(modulesSnapshot.val() || {}).length === 0) {
        console.log('[data-init.js] Adding modules...');
        for (const module of defaultModules) {
            await db.ref('modules/' + module.id).set(module);
        }
        console.log('[data-init.js] Modules added successfully');
        return true;
    } else {
        console.log('[data-init.js] Modules already exist');
        return false;
    }
}

// Инициализация уроков
async function initializeLessons() {
    console.log('[data-init.js] Initializing lessons...');
    
    const lessonsSnapshot = await db.ref('lessons').once('value');
    
    if (!lessonsSnapshot.exists() || Object.keys(lessonsSnapshot.val() || {}).length === 0) {
        console.log('[data-init.js] Adding lessons...');
        for (const lesson of defaultLessons) {
            const lessonRef = db.ref('lessons').push();
            await lessonRef.set(lesson);
        }
        console.log('[data-init.js] Lessons added successfully');
        return true;
    } else {
        console.log('[data-init.js] Lessons already exist');
        return false;
    }
}

// Инициализация тестов
async function initializeTests() {
    console.log('[data-init.js] Initializing tests...');
    
    const testsSnapshot = await db.ref('tests').once('value');
    
    if (!testsSnapshot.exists() || Object.keys(testsSnapshot.val() || {}).length === 0) {
        console.log('[data-init.js] Adding tests...');
        for (const test of defaultTests) {
            const testRef = db.ref('tests').push();
            await testRef.set(test);
        }
        console.log('[data-init.js] Tests added successfully');
        return true;
    } else {
        console.log('[data-init.js] Tests already exist');
        return false;
    }
}

// Создание администратора
async function createAdmin() {
    console.log('[data-init.js] Checking administrator...');
    
    try {
        const usersSnapshot = await db.ref('users').orderByChild('email').equalTo(adminData.email).once('value');
        
        if (!usersSnapshot.exists()) {
            console.log('[data-init.js] Creating administrator...');
            
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(adminData.email, adminData.password);
                const userId = userCredential.user.uid;
                
                await db.ref('users/' + userId).set({
                    name: adminData.name,
                    surname: adminData.surname,
                    email: adminData.email,
                    role: adminData.role,
                    createdAt: new Date().toISOString()
                });
                
                console.log('[data-init.js] Administrator created successfully!');
                console.log('[data-init.js] Email:', adminData.email);
                console.log('[data-init.js] Password:', adminData.password);
                return true;
            } catch (authError) {
                if (authError.code === 'auth/email-already-in-use') {
                    console.log('[data-init.js] User already exists in Auth. Signing in...');
                    
                    try {
                        await auth.signInWithEmailAndPassword(adminData.email, adminData.password);
                        const userId = auth.currentUser.uid;
                        
                        const existingUser = await db.ref('users/' + userId).once('value');
                        
                        if (!existingUser.exists()) {
                            await db.ref('users/' + userId).set({
                                name: adminData.name,
                                surname: adminData.surname,
                                email: adminData.email,
                                role: adminData.role,
                                createdAt: new Date().toISOString()
                            });
                            console.log('[data-init.js] User added to database with admin role');
                        } else {
                            console.log('[data-init.js] User already exists in database');
                        }
                        
                        await auth.signOut();
                        return true;
                    } catch (loginError) {
                        console.error('[data-init.js] Login error:', loginError);
                        return false;
                    }
                } else {
                    throw authError;
                }
            }
        } else {
            console.log('[data-init.js] Administrator already exists');
            return true;
        }
    } catch (error) {
        console.error('[data-init.js] Error creating administrator:', error);
        return false;
    }
}

// Главная функция инициализации
async function initializeData() {
    console.log('[data-init.js] === Starting data initialization ===');
    
    const modulesInit = await initializeModules();
    const lessonsInit = await initializeLessons();
    const testsInit = await initializeTests();
    
    console.log('[data-init.js] === Data initialization completed ===');
    console.log('[data-init.js] Modules:', modulesInit ? 'added' : 'already exist');
    console.log('[data-init.js] Lessons:', lessonsInit ? 'added' : 'already exist');
    console.log('[data-init.js] Tests:', testsInit ? 'added' : 'already exist');
    
    return { modulesInit, lessonsInit, testsInit };
}

// Главная функция приложения
async function initializeApp() {
    console.log('[data-init.js] === App initialization ===');
    
    const dataInitialized = await initializeData();
    const adminCreated = await createAdmin();
    
    if (dataInitialized.modulesInit || dataInitialized.lessonsInit || dataInitialized.testsInit || adminCreated) {
        console.log('[data-init.js] === Initialization completed successfully ===');
        console.log('[data-init.js] Administrator:');
        console.log('[data-init.js] Email:', adminData.email);
        console.log('[data-init.js] Password:', adminData.password);
        console.log('[data-init.js]');
        console.log('[data-init.js] Ready to work!');
    } else {
        console.log('[data-init.js] === Data already initialized ===');
    }
    
    return { 
        dataInitialized: true, 
        adminCreated 
    };
}

// Экспорт функций в глобальную область видимости
window.dataInit_initializeData = initializeData;
window.dataInit_initializeApp = initializeApp;
window.dataInit_createAdmin = createAdmin;

console.log('[data-init.js] Script loaded successfully!');
console.log('[data-init.js] Available functions: dataInit_initializeApp(), dataInit_initializeData(), dataInit_createAdmin()');

