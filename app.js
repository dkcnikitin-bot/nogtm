/* ============================================================
   🚀 APP.JS - Main Application Logic
   Enhanced with utilities and better UX
   ============================================================ */

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    console.log('🌸 Академия Лобачевой Анны - Инициализация...');
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize navbar scroll effect
    initNavbarScroll();
    
    // Check authentication status
    checkAuthStatus();
    
    // Animate elements on scroll
    initScrollAnimations();
    
    // Load modules on homepage
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        loadHomepageModules();
    }
    
    console.log('✅ Приложение инициализировано');
}

// ============================================================
// MOBILE MENU
// ============================================================

function initMobileMenu() {
    const toggle = DOM.find('.navbar-toggle');
    const nav = DOM.find('.navbar-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            DOM.toggleClass(nav, 'show');
            
            // Change icon
            const icon = toggle.querySelector('i');
            if (icon) {
                if (nav.classList.contains('show')) {
                    DOM.removeClass(icon, 'fa-bars');
                    DOM.addClass(icon, 'fa-times');
                } else {
                    DOM.removeClass(icon, 'fa-times');
                    DOM.addClass(icon, 'fa-bars');
                }
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !toggle.contains(e.target)) {
                DOM.removeClass(nav, 'show');
                const icon = toggle.querySelector('i');
                if (icon) {
                    DOM.removeClass(icon, 'fa-times');
                    DOM.addClass(icon, 'fa-bars');
                }
            }
        });

        // Close menu on link click
        const links = DOM.findAll('.nav-link', nav);
        links.forEach(link => {
            link.addEventListener('click', () => {
                DOM.removeClass(nav, 'show');
                const icon = toggle.querySelector('i');
                if (icon) {
                    DOM.removeClass(icon, 'fa-times');
                    DOM.addClass(icon, 'fa-bars');
                }
            });
        });
    }
}

// ============================================================
// NAVBAR SCROLL EFFECT
// ============================================================

function initNavbarScroll() {
    const navbar = DOM.find('.navbar');
    
    if (navbar) {
        const handleScroll = throttle(() => {
            if (window.scrollY > 50) {
                DOM.addClass(navbar, 'scrolled');
            } else {
                DOM.removeClass(navbar, 'scrolled');
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);
    }
}

// ============================================================
// AUTHENTICATION
// ============================================================

function checkAuthStatus() {
    auth.onAuthStateChanged((user) => {
        const loginLink = DOM.find('a[href="login.html"]');
        const registerLink = DOM.find('a[href="register.html"]');
        const dashboardLink = DOM.find('a[href="dashboard.html"]');
        const profileLink = DOM.find('a[href="profile.html"]');
        const logoutBtn = DOM.find('[onclick="logout()"]');

        if (user) {
            // User is logged in
            if (loginLink) DOM.hide(loginLink);
            if (registerLink) DOM.hide(registerLink);
            if (dashboardLink) DOM.show(dashboardLink);
            if (profileLink) DOM.show(profileLink);
            if (logoutBtn) DOM.show(logoutBtn);
        } else {
            // User is logged out
            if (loginLink) DOM.show(loginLink);
            if (registerLink) DOM.show(registerLink);
            if (dashboardLink) DOM.hide(dashboardLink);
            if (profileLink) DOM.hide(profileLink);
            if (logoutBtn) DOM.hide(logoutBtn);
        }
    });
}

// Logout function
function logout() {
    toast.confirm('Вы уверены, что хотите выйти?', {
        title: 'Выход из аккаунта',
        confirmText: 'Выйти',
        cancelText: 'Отмена'
    }).then((confirmed) => {
        if (confirmed) {
            auth.signOut()
                .then(() => {
                    toast.success('Вы успешно вышли из системы');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                })
                .catch((error) => {
                    ErrorHandler.handle(error, 'logout');
                });
        }
    });
}

// ============================================================
// SCROLL ANIMATIONS
// ============================================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                DOM.addClass(entry.target, 'animate-in');
                
                // Add staggered animation to children
                const children = DOM.findAll('.stagger-1, .stagger-2, .stagger-3, .stagger-4, .stagger-5', entry.target);
                children.forEach((child, index) => {
                    setTimeout(() => {
                        DOM.addClass(child, 'animate-in');
                    }, index * 100);
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    const animatedElements = DOM.findAll('.fade-in, .fade-in-up, .fade-in-down, .slide-in-left, .slide-in-right, .scale-in');
    animatedElements.forEach(el => observer.observe(el));
}

// ============================================================
// HERO SECTION ANIMATIONS
// ============================================================

function initHeroAnimations() {
    const heroTitle = DOM.find('.hero-title');
    const heroSubtitle = DOM.find('.hero-subtitle');
    const heroButtons = DOM.find('.hero-buttons');

    if (heroTitle) {
        Animation.fadeInUp(heroTitle, 600);
    }

    if (heroSubtitle) {
        setTimeout(() => {
            Animation.fadeInUp(heroSubtitle, 500);
        }, 200);
    }

    if (heroButtons) {
        setTimeout(() => {
            Animation.fadeInUp(heroButtons, 500);
        }, 400);
    }
}

// ============================================================
// MODULE CARDS
// ============================================================

function openModule(moduleId) {
    Storage.set('selectedModule', moduleId);
    window.location.href = 'lessons.html';
}

// Load modules on homepage
async function loadHomepageModules() {
    try {
        const container = DOM.find('#modulesList');
        if (!container) return;

        const snapshot = await db.ref(DB_PATHS.MODULES).once('value');
        const modules = snapshot.val() || {};

        if (Object.keys(modules).length === 0) {
            DOM.html(container, `
                <div class="text-center" style="grid-column: 1 / -1;">
                    <i class="fas fa-folder-open fa-3x text-muted mb-4"></i>
                    <p class="text-muted">Модули скоро появятся</p>
                </div>
            `);
            return;
        }

        const modulesArray = Object.entries(modules).map(([id, module]) => ({
            id,
            ...module
        }));

        DOM.html(container, modulesArray.map((module, index) => `
            <div class="module-card">
                <div class="module-number">${index + 1}</div>
                <div class="module-icon">
                    <i class="fas fa-${getModuleIcon(index)}"></i>
                </div>
                <h3 class="module-title">${module.title || 'Модуль ' + (index + 1)}</h3>
                <p class="module-description">${module.description || 'Описание модуля'}</p>
            </div>
        `).join(''));

    } catch (error) {
        ErrorHandler.handle(error, 'load modules');
        const container = DOM.find('#modulesList');
        if (container) {
            DOM.html(container, `
                <div class="text-center" style="grid-column: 1 / -1;">
                    <i class="fas fa-exclamation-circle fa-3x text-accent mb-4"></i>
                    <p class="text-muted">Ошибка загрузки модулей</p>
                </div>
            `);
        }
    }
}

function getModuleIcon(index) {
    // Professional icons for educational modules
    const icons = [
        'graduation-cap',   // Введение и основы
        'clipboard-list',   // Анатомия и гигиена
        'tasks',            // Маникюр и педикюр
        'palette',          // Дизайн и искусство
        'award',            // Продвинутые техники
        'chalkboard-teacher', // Педагогика
        'book-open',        // Методика обучения
        'users',            // Психология общения
        'chart-line',       // Маркетинг и бизнес
        'certificate'       // Финальная аттестация
    ];
    return icons[index % icons.length];
}

// ============================================================
// PRICING
// ============================================================

function selectTariff(tariff) {
    Storage.set('selectedTariff', tariff);
    
    // Scroll to registration form
    const registerForm = DOM.find('#registerForm');
    if (registerForm) {
        registerForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Set tariff in select
        const tariffSelect = DOM.find('#registerTariff');
        if (tariffSelect) {
            DOM.val(tariffSelect, tariff);
        }
        
        toast.info(`Выбран тариф: ${getTariffName(tariff)}`);
    } else {
        window.location.href = 'register.html';
    }
}

function getTariffName(tariff) {
    const tariffs = {
        'basic': 'Базовый',
        'standard': 'Стандарт',
        'vip': 'VIP'
    };
    return tariffs[tariff] || tariff;
}

// ============================================================
// CONTACT FORM
// ============================================================

async function submitContactForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate
    if (!Validator.required(data.name)) {
        toast.warning('Пожалуйста, введите ваше имя');
        return;
    }

    if (!Validator.required(data.email)) {
        toast.warning('Пожалуйста, введите email');
        return;
    }

    if (!Validator.email(data.email)) {
        toast.error('Неверный формат email');
        return;
    }

    if (!Validator.required(data.message)) {
        toast.warning('Пожалуйста, введите сообщение');
        return;
    }

    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
        form.reset();
    } catch (error) {
        ErrorHandler.handle(error, 'contact form');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// ============================================================
// SMOOTH SCROLL
// ============================================================

function smoothScrollTo(target) {
    const element = typeof target === 'string' ? DOM.find(target) : target;
    
    if (element) {
        const navbar = DOM.find('.navbar');
        const offset = navbar ? navbar.offsetHeight : 0;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const targetPosition = elementPosition - offset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        toast.success('Скопировано в буфер обмена');
        return true;
    } catch (error) {
        console.error('Copy failed:', error);
        toast.error('Не удалось скопировать');
        return false;
    }
}

// Share on social media
function shareOnSocial(platform, url, title) {
    const shareUrls = {
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
        vk: `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    };

    const shareUrl = shareUrls[platform];
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// ============================================================
// PERFORMANCE OPTIMIZATION
// ============================================================

// Lazy load images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    
                    if (src) {
                        img.src = src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        const lazyImages = DOM.findAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Preload critical resources
function preloadResources() {
    const criticalFonts = [
        'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600;700&display=swap'
    ];

    criticalFonts.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = font;
        document.head.appendChild(link);
    });
}

// ============================================================
// ACCESSIBILITY
// ============================================================

// Handle keyboard navigation
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // ESC key closes modals
        if (e.key === 'Escape') {
            const modals = DOM.findAll('.modal.show');
            modals.forEach(modal => {
                const closeBtn = modal.querySelector('.modal-close');
                if (closeBtn) closeBtn.click();
            });
        }
    });
}

// Focus trap for modals
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstFocusable) {
                e.preventDefault();
                lastFocusable.focus();
            } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                e.preventDefault();
                firstFocusable.focus();
            }
        }
    });
}

// ============================================================
// INITIALIZATION CALLS
// ============================================================

// Run on page load
window.addEventListener('load', () => {
    initHeroAnimations();
    initLazyLoading();
    preloadResources();
    initKeyboardNavigation();
    
    // Load modules on homepage
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        loadHomepageModules();
    }
});

// Run before unload
window.addEventListener('beforeunload', (e) => {
    // Check if there are unsaved changes
    const hasUnsavedChanges = document.querySelector('[data-unsaved="true"]');
    
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'У вас есть несохраненные изменения. Вы уверены, что хотите уйти?';
        return e.returnValue;
    }
});

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

// Make functions available globally
window.openModule = openModule;
window.loadHomepageModules = loadHomepageModules;
window.selectTariff = selectTariff;
window.submitContactForm = submitContactForm;
window.smoothScrollTo = smoothScrollTo;
window.copyToClipboard = copyToClipboard;
window.shareOnSocial = shareOnSocial;
window.logout = logout;

console.log('📦 App.js загружен');