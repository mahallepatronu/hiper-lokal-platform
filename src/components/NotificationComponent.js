import { notificationService } from '../services/notificationService.js';

class NotificationComponent {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.isOpen = false;
        this.init();
    }

    init() {
        // Bildirim dinleyicisini ekle
        notificationService.addListener(this.handleNotificationsUpdate.bind(this));
        
        // Bildirimleri yükle
        this.loadNotifications();
        
        // WebSocket bağlantısını başlat
        notificationService.initializeWebSocket();
    }

    async loadNotifications() {
        try {
            const data = await notificationService.getNotifications();
            this.notifications = data.notifications;
            this.unreadCount = data.unreadCount;
            this.updateUI();
        } catch (error) {
            console.error('Bildirimler yüklenirken hata:', error);
        }
    }

    handleNotificationsUpdate(notifications, unreadCount) {
        this.notifications = notifications;
        this.unreadCount = unreadCount;
        this.updateUI();
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
        element.innerHTML = `
            <div class="notification-icon">
                ${this.getNotificationIcon(notification.type)}
            </div>
            <div class="notification-content">
                <p class="notification-text">${notification.message}</p>
                <span class="notification-time">${this.formatTime(notification.createdAt)}</span>
            </div>
            <div class="notification-actions">
                ${!notification.read ? `
                    <button class="btn-icon mark-read" title="Okundu olarak işaretle">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </button>
                ` : ''}
                <button class="btn-icon delete" title="Sil">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        `;

        // Okundu olarak işaretle butonu
        const markReadBtn = element.querySelector('.mark-read');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', () => this.markAsRead(notification.id));
        }

        // Sil butonu
        const deleteBtn = element.querySelector('.delete');
        deleteBtn.addEventListener('click', () => this.deleteNotification(notification.id));

        return element;
    }

    getNotificationIcon(type) {
        const icons = {
            campaign: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
            </svg>`,
            order: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>`,
            system: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`
        };

        return icons[type] || icons.system;
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) { // 1 dakikadan az
            return 'Az önce';
        } else if (diff < 3600000) { // 1 saatten az
            const minutes = Math.floor(diff / 60000);
            return `${minutes} dakika önce`;
        } else if (diff < 86400000) { // 1 günden az
            const hours = Math.floor(diff / 3600000);
            return `${hours} saat önce`;
        } else {
            return date.toLocaleDateString('tr-TR');
        }
    }

    async markAsRead(notificationId) {
        try {
            await notificationService.markAsRead(notificationId);
        } catch (error) {
            console.error('Bildirim okundu işaretlenirken hata:', error);
        }
    }

    async deleteNotification(notificationId) {
        try {
            await notificationService.deleteNotification(notificationId);
        } catch (error) {
            console.error('Bildirim silinirken hata:', error);
        }
    }

    async markAllAsRead() {
        try {
            await notificationService.markAllAsRead();
        } catch (error) {
            console.error('Bildirimler okundu işaretlenirken hata:', error);
        }
    }

    updateUI() {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        // Bildirim sayısını güncelle
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'block' : 'none';
        }

        // Bildirim listesini güncelle
        const list = container.querySelector('.notification-list');
        if (list) {
            list.innerHTML = '';
            this.notifications.forEach(notification => {
                list.appendChild(this.createNotificationElement(notification));
            });
        }

        // Boş durum mesajını göster/gizle
        const emptyState = container.querySelector('.notification-empty');
        if (emptyState) {
            emptyState.style.display = this.notifications.length === 0 ? 'block' : 'none';
        }
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const container = document.getElementById('notificationContainer');
        if (container) {
            container.classList.toggle('show', this.isOpen);
        }
    }

    destroy() {
        notificationService.removeListener(this.handleNotificationsUpdate.bind(this));
        notificationService.disconnect();
    }
}

export const notificationComponent = new NotificationComponent(); 