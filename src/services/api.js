// API Temel URL
const API_BASE_URL = 'http://localhost:3000/api';

// API İstekleri için Yardımcı Fonksiyonlar
const api = {
    // GET isteği
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('GET İsteği Hatası:', error);
            throw error;
        }
    },

    // POST isteği
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('POST İsteği Hatası:', error);
            throw error;
        }
    },

    // PUT isteği
    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('PUT İsteği Hatası:', error);
            throw error;
        }
    },

    // DELETE isteği
    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('DELETE İsteği Hatası:', error);
            throw error;
        }
    }
};

// Auth Servisi
const authService = {
    // Giriş yap
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                return response;
            }
            throw new Error('Giriş başarısız');
        } catch (error) {
            console.error('Giriş Hatası:', error);
            throw error;
        }
    },

    // Kayıt ol
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            return response;
        } catch (error) {
            console.error('Kayıt Hatası:', error);
            throw error;
        }
    },

    // Çıkış yap
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/src/pages/LoginPage.html';
    },

    // Kullanıcı bilgilerini al
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Token kontrolü
    isAuthenticated() {
        return !!localStorage.getItem('token');
    }
};

// Kullanıcı Servisi
const userService = {
    // Profil bilgilerini getir
    async getProfile() {
        try {
            return await api.get('/users/profile');
        } catch (error) {
            console.error('Profil Bilgileri Hatası:', error);
            throw error;
        }
    },

    // Profil güncelle
    async updateProfile(userData) {
        try {
            return await api.put('/users/profile', userData);
        } catch (error) {
            console.error('Profil Güncelleme Hatası:', error);
            throw error;
        }
    },

    // Şifre değiştir
    async changePassword(passwordData) {
        try {
            return await api.put('/users/change-password', passwordData);
        } catch (error) {
            console.error('Şifre Değiştirme Hatası:', error);
            throw error;
        }
    }
};

// İşletme Servisi
const businessService = {
    // İşletme listesi
    async getBusinesses() {
        try {
            return await api.get('/businesses');
        } catch (error) {
            console.error('İşletme Listesi Hatası:', error);
            throw error;
        }
    },

    // İşletme detayı
    async getBusinessDetail(id) {
        try {
            return await api.get(`/businesses/${id}`);
        } catch (error) {
            console.error('İşletme Detay Hatası:', error);
            throw error;
        }
    },

    // İşletme ekle
    async addBusiness(businessData) {
        try {
            return await api.post('/businesses', businessData);
        } catch (error) {
            console.error('İşletme Ekleme Hatası:', error);
            throw error;
        }
    },

    // İşletme güncelle
    async updateBusiness(id, businessData) {
        try {
            return await api.put(`/businesses/${id}`, businessData);
        } catch (error) {
            console.error('İşletme Güncelleme Hatası:', error);
            throw error;
        }
    }
};

// Kampanya Servisi
const campaignService = {
    // Kampanya listesi
    async getCampaigns() {
        try {
            return await api.get('/campaigns');
        } catch (error) {
            console.error('Kampanya Listesi Hatası:', error);
            throw error;
        }
    },

    // Kampanya detayı
    async getCampaignDetail(id) {
        try {
            return await api.get(`/campaigns/${id}`);
        } catch (error) {
            console.error('Kampanya Detay Hatası:', error);
            throw error;
        }
    },

    // Kampanya ekle
    async addCampaign(campaignData) {
        try {
            return await api.post('/campaigns', campaignData);
        } catch (error) {
            console.error('Kampanya Ekleme Hatası:', error);
            throw error;
        }
    }
};

export {
    api,
    authService,
    userService,
    businessService,
    campaignService
}; 