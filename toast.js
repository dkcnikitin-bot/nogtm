/* ============================================================
   🔔 TOAST NOTIFICATION SYSTEM
   Beautiful, non-intrusive notifications
   ============================================================ */

class Toast {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
    }

    init() {
        // Create container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {object} options - Additional options
     */
    show(message, type = 'info', options = {}) {
        const {
            title = '',
            duration = 5000,
            closable = true,
            icon = null
        } = options;

        const toast = this.createToast(message, type, title, closable, icon);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.hide(toast);
            }, duration);
        }

        return toast;
    }

    createToast(message, type, title, closable, customIcon) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'fa-check',
            error: 'fa-times',
            warning: 'fa-exclamation',
            info: 'fa-info'
        };

        const titles = {
            success: 'Успешно',
            error: 'Ошибка',
            warning: 'Предупреждение',
            info: 'Информация'
        };

        const iconClass = customIcon || icons[type] || icons.info;
        const titleText = title || titles[type] || titles.info;

        toast.innerHTML = `
            <div class="toast-header">
                <div class="toast-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="toast-title">${titleText}</div>
                ${closable ? '<button class="toast-close">&times;</button>' : ''}
            </div>
            <div class="toast-body">${message}</div>
        `;

        // Add close handler
        if (closable) {
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => {
                this.hide(toast);
            });
        }

        // Click to dismiss
        toast.addEventListener('click', (e) => {
            if (e.target.closest('.toast-close')) return;
            // Optional: Click anywhere to dismiss
            // this.hide(toast);
        });

        return toast;
    }

    hide(toast) {
        if (!toast || !toast.parentNode) return;

        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', { ...options, duration: 7000 });
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    // Hide all toasts
    hideAll() {
        this.toasts.forEach(toast => this.hide(toast));
    }

    // Show confirmation dialog
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Подтверждение',
                confirmText = 'Да',
                cancelText = 'Отмена',
                type = 'warning'
            } = options;

            // Create custom confirm modal
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.style.zIndex = '1100';
            
            modal.innerHTML = `
                <div class="modal-backdrop"></div>
                <div class="modal-dialog" style="max-width: 400px;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5>${title}</h5>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p>${message}</p>
                        </div>
                        <div class="modal-footer" style="padding: var(--spacing-lg); border-top: 1px solid var(--glass-border); display: flex; gap: var(--spacing-sm); justify-content: flex-end;">
                            <button class="btn btn-secondary btn-cancel">${cancelText}</button>
                            <button class="btn btn-primary btn-confirm">${confirmText}</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const closeBtn = modal.querySelector('.modal-close');
            const cancelBtn = modal.querySelector('.btn-cancel');
            const confirmBtn = modal.querySelector('.btn-confirm');

            const cleanup = () => {
                modal.remove();
            };

            closeBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });

            cancelBtn.addEventListener('click', () => {
                cleanup();
                resolve(false);
            });

            confirmBtn.addEventListener('click', () => {
                cleanup();
                resolve(true);
            });

            // Close on backdrop click
            modal.querySelector('.modal-backdrop').addEventListener('click', () => {
                cleanup();
                resolve(false);
            });
        });
    }
}

// Create global instance
const toast = new Toast();

// Make it available globally
window.toast = toast;

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Toast;
}
