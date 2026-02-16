// ============================================================
// 🔧 FIREBASE CONFIGURATION
// ============================================================
// 
// ✅ КОНФИГУРАЦИЯ НАСТРОЕНА
// Project: annat-dd407
// Auth Domain: annat-dd407.firebaseapp.com
// Database: annat-dd407-default-rtdb.firebaseio.com
// 
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyBwUZveKhvF8Pc9JO-2XBBSW-JrfwXu70c",
    authDomain: "annat-dd407.firebaseapp.com",
    databaseURL: "https://annat-dd407-default-rtdb.firebaseio.com",
    projectId: "annat-dd407",
    storageBucket: "annat-dd407.firebasestorage.app",
    messagingSenderId: "372333877728",
    appId: "1:372333877728:web:c966b4750abf81f2e33385"
};

// ============================================================
// 🚀 Инициализация Firebase
// ============================================================

try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
    console.log('📊 Project ID:', firebaseConfig.projectId);
    console.log('🔗 Database URL:', firebaseConfig.databaseURL);
    console.log('🔐 Auth Domain:', firebaseConfig.authDomain);
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    alert('Ошибка инициализации Firebase. Проверьте консоль для деталей.');
}

// ============================================================
// 📦 Firebase Services
// ============================================================

const db = firebase.database();      // Realtime Database
const auth = firebase.auth();        // Authentication

// ============================================================
// 📁 Пути к данным в Realtime Database
// ============================================================

const DB_PATHS = {
    USERS: 'users',           // Пользователи
    MODULES: 'modules',       // Модули курса
    LESSONS: 'lessons',       // Уроки
    TESTS: 'tests',           // Тесты
    TEST_RESULTS: 'testResults',  // Результаты тестов
    PROGRESS: 'progress',     // Прогресс обучения
    SETTINGS: 'settings'      // Настройки
};

// ============================================================
// 👤 Данные администратора
// ============================================================

const ADMIN_EMAIL = 'admin@lobacheva-academy.ru';
const ADMIN_PASSWORD = 'Admin2024!';

console.log('🔐 Admin credentials:', { email: ADMIN_EMAIL, password: '***' });

// ============================================================
// ✅ Проверка конфигурации
// ============================================================

function validateConfig() {
    const required = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId'];
    const missing = required.filter(key => !firebaseConfig[key]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required config fields:', missing);
        return false;
    }
    
    console.log('✅ All required config fields present');
    return true;
}

// Проверяем конфигурацию при загрузке
validateConfig();