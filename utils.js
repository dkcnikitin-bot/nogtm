/* ============================================================
   🛠️ UTILITY FUNCTIONS
   Common helper functions for the application
   ============================================================ */

// ============================================================
// VALIDATION
// ============================================================

const Validator = {
    // Email validation
    email: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    },

    // Phone validation (Russian format)
    phone: (phone) => {
        const re = /^(\+7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;
        return re.test(phone);
    },

    // Password validation
    password: (password) => {
        return password && password.length >= 6;
    },

    // Required field validation
    required: (value) => {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    // Name validation
    name: (name) => {
        const re = /^[а-яА-ЯёЁa-zA-Z\s\-]+$/;
        return re.test(name);
    }
};

// ============================================================
// FORMATTING
// ============================================================

const Formatter = {
    // Format phone number
    phone: (phone) => {
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
        if (match) {
            return `+7 (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
        }
        return phone;
    },

    // Format date
    date: (date, format = 'short') => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const options = {
            short: { day: 'numeric', month: 'short', year: 'numeric' },
            long: { day: 'numeric', month: 'long', year: 'numeric' },
            full: { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        };

        return d.toLocaleDateString('ru-RU', options[format] || options.short);
    },

    // Format number with spaces
    number: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    },

    // Format currency
    currency: (amount) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0
        }).format(amount);
    },

    // Truncate text
    truncate: (text, maxLength = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    },

    // Calculate reading time
    readingTime: (text) => {
        const wordsPerMinute = 200;
        const words = text.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }
};

// ============================================================
// STORAGE
// ============================================================

const Storage = {
    // Get item from localStorage
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },

    // Set item to localStorage
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    // Remove item from localStorage
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    // Clear all localStorage
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    }
};

// ============================================================
// DOM HELPERS
// ============================================================

const DOM = {
    // Find element by selector
    find: (selector, parent = document) => {
        return parent.querySelector(selector);
    },

    // Find all elements by selector
    findAll: (selector, parent = document) => {
        return Array.from(parent.querySelectorAll(selector));
    },

    // Create element with attributes
    create: (tag, attributes = {}, content = '') => {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                const eventType = key.substring(2).toLowerCase();
                element.addEventListener(eventType, value);
            } else {
                element.setAttribute(key, value);
            }
        });

        if (content) {
            element.innerHTML = content;
        }

        return element;
    },

    // Add class to element
    addClass: (element, className) => {
        if (element && className) {
            element.classList.add(className);
        }
    },

    // Remove class from element
    removeClass: (element, className) => {
        if (element && className) {
            element.classList.remove(className);
        }
    },

    // Toggle class on element
    toggleClass: (element, className, force) => {
        if (element && className) {
            element.classList.toggle(className, force);
        }
    },

    // Show element
    show: (element) => {
        if (element) {
            element.style.display = '';
            DOM.removeClass(element, 'd-none');
        }
    },

    // Hide element
    hide: (element) => {
        if (element) {
            element.style.display = 'none';
            DOM.addClass(element, 'd-none');
        }
    },

    // Set element content
    html: (element, content) => {
        if (element) {
            element.innerHTML = content;
        }
    },

    // Set element text
    text: (element, text) => {
        if (element) {
            element.textContent = text;
        }
    },

    // Set element value
    val: (element, value) => {
        if (element) {
            if (value !== undefined) {
                element.value = value;
            }
            return element.value;
        }
    }
};

// ============================================================
// LOADING STATES
// ============================================================

const Loading = {
    // Show loading overlay
    show: (message = 'Загрузка...') => {
        let overlay = document.querySelector('.loading-overlay');
        
        if (!overlay) {
            overlay = DOM.create('div', { className: 'loading-overlay' }, `
                <div class="spinner spinner-lg"></div>
                <div class="loading-text">${message}</div>
            `);
            document.body.appendChild(overlay);
        } else {
            overlay.querySelector('.loading-text').textContent = message;
            DOM.show(overlay);
        }

        return overlay;
    },

    // Hide loading overlay
    hide: () => {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            DOM.hide(overlay);
        }
    },

    // Show skeleton loading for card
    skeleton: (element, count = 1) => {
        const skeletons = [];
        for (let i = 0; i < count; i++) {
            const skeleton = DOM.create('div', { className: 'skeleton skeleton-card' });
            element.appendChild(skeleton);
            skeletons.push(skeleton);
        }
        return skeletons;
    },

    // Remove all skeletons from element
    removeSkeletons: (element) => {
        const skeletons = element.querySelectorAll('.skeleton');
        skeletons.forEach(s => s.remove());
    }
};

// ============================================================
// DEBOUNCE & THROTTLE
// ============================================================

const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit = 300) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ============================================================
// ERROR HANDLING
// ============================================================

const ErrorHandler = {
    // Handle Firebase auth errors
    authError: (error) => {
        const errorMessages = {
            'auth/invalid-email': 'Неверный формат email',
            'auth/email-already-in-use': 'Этот email уже зарегистрирован',
            'auth/weak-password': 'Пароль должен содержать минимум 6 символов',
            'auth/wrong-password': 'Неверный пароль',
            'auth/user-not-found': 'Пользователь не найден',
            'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
            'auth/user-disabled': 'Аккаунт отключен',
            'auth/popup-closed-by-user': 'Окно авторизации закрыто',
            'auth/operation-not-allowed': 'Операция не разрешена',
            'auth/expired-action-code': 'Код действия истек',
            'auth/invalid-action-code': 'Неверный код действия'
        };

        return errorMessages[error.code] || error.message || 'Произошла ошибка';
    },

    // Handle general errors
    handle: (error, context = '') => {
        console.error(`Error${context ? ` in ${context}` : ''}:`, error);
        
        const message = error.message || 'Произошла непредвиденная ошибка';
        
        toast.error(message, {
            title: 'Ошибка',
            duration: 7000
        });

        return message;
    },

    // Handle async errors
    async: async (fn, context = '') => {
        try {
            return await fn();
        } catch (error) {
            ErrorHandler.handle(error, context);
            throw error;
        }
    }
};

// ============================================================
// URL HELPERS
// ============================================================

const URLHelper = {
    // Get URL parameter
    getParam: (name) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    // Set URL parameter
    setParam: (name, value) => {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    },

    // Remove URL parameter
    removeParam: (name) => {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    },

    // Get all URL parameters
    getParams: () => {
        const params = new URLSearchParams(window.location.search);
        return Object.fromEntries(params.entries());
    }
};

// ============================================================
// ANIMATION HELPERS
// ============================================================

const Animation = {
    // Fade in element
    fadeIn: (element, duration = 300) => {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });

        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    },

    // Fade out element
    fadeOut: (element, duration = 300) => {
        if (!element) return;
        
        element.style.opacity = '1';
        element.style.transition = `opacity ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '0';
        });

        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    },

    // Slide in from top
    slideInDown: (element, duration = 300) => {
        if (!element) return;
        
        element.style.transform = 'translateY(-20px)';
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        });

        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    },

    // Slide in from bottom
    slideInUp: (element, duration = 300) => {
        if (!element) return;
        
        element.style.transform = 'translateY(20px)';
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        });

        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
};

// ============================================================
// EXPORT
// ============================================================

// Make utilities available globally
window.Validator = Validator;
window.Formatter = Formatter;
window.Storage = Storage;
window.DOM = DOM;
window.Loading = Loading;
window.debounce = debounce;
window.throttle = throttle;
window.ErrorHandler = ErrorHandler;
window.URLHelper = URLHelper;
window.Animation = Animation;

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Validator,
        Formatter,
        Storage,
        DOM,
        Loading,
        debounce,
        throttle,
        ErrorHandler,
        URLHelper,
        Animation
    };
}
