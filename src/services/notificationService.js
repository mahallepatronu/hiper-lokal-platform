import { api } from './api';

class NotificationService {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.socket = null;
        this.listeners = new Set();
    }

    // WebSocket bağlantısını başlat
    initializeWebSocket() {
        const token = localStorage.getItem('token');
        if (!token) return;

        this.socket = new WebSocket(`ws://localhost:3000/ws/notifications?token=${token}`);

        this.socket.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            this.handleNewNotification(notification);
        };

        this.socket.onclose = () => {
            // Bağlantı koptuğunda yeniden bağlan
            setTimeout(() => this.initializeWebSocket(), 5000);
        };
    }

    // Yeni bildirim geldiğinde
    handleNewNotification(notification) {
        this.notifications.unshift(notification);
        this.unreadCount++;
        this.notifyListeners();
    }

    // Dinleyici ekle
    addListener(listener) {
        this.listeners.add(listener);
    }

    // Dinleyici kaldır
    removeListener(listener) {
        this.listeners.delete(listener);
    }

    // Tüm dinleyicileri bilgilendir
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.notifications, this.unreadCount));
    }

    // Bildirimleri getir
    async getNotifications(page = 1, limit = 20) {
        try {
            const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
            this.notifications = response.data.notifications;
            this.unreadCount = response.data.unreadCount;
            this.notifyListeners();
            return response.data;
        } catch (error) {
            console.error('Bildirimler yüklenirken hata:', error);
            throw error;
        }
    }

    // Bildirimi okundu olarak işaretle
    async markAsRead(notificationId) {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                this.unreadCount = Math.max(0, this.unreadCount - 1);
                this.notifyListeners();
            }
        } catch (error) {
            console.error('Bildirim okundu işaretlenirken hata:', error);
            throw error;
        }
    }

    // Tüm bildirimleri okundu olarak işaretle
    async markAllAsRead() {
        try {
            await api.put('/notifications/read-all');
            this.notifications.forEach(notification => notification.read = true);
            this.unreadCount = 0;
            this.notifyListeners();
        } catch (error) {
            console.error('Bildirimler okundu işaretlenirken hata:', error);
            throw error;
        }
    }

    // Bildirim tercihlerini getir
    async getPreferences() {
        try {
            const response = await api.get('/notifications/preferences');
            return response.data;
        } catch (error) {
            console.error('Bildirim tercihleri yüklenirken hata:', error);
            throw error;
        }
    }

    // Bildirim tercihlerini güncelle
    async updatePreferences(preferences) {
        try {
            const response = await api.put('/notifications/preferences', preferences);
            return response.data;
        } catch (error) {
            console.error('Bildirim tercihleri güncellenirken hata:', error);
            throw error;
        }
    }

    // Bildirimi sil
    async deleteNotification(notificationId) {
        try {
            await api.delete(`/notifications/${notificationId}`);
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
            this.notifyListeners();
        } catch (error) {
            console.error('Bildirim silinirken hata:', error);
            throw error;
        }
    }

    // WebSocket bağlantısını kapat
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

export const notificationService = new NotificationService(); 