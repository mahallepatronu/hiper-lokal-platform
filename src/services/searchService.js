export class SearchService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
    }

    // İşletme arama
    async searchBusinesses(params) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseUrl}/businesses/search?${queryString}`);
            
            if (!response.ok) {
                throw new Error('İşletme araması başarısız oldu');
            }

            return await response.json();
        } catch (error) {
            console.error('İşletme arama hatası:', error);
            throw error;
        }
    }

    // Kampanya arama
    async searchCampaigns(params) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseUrl}/campaigns/search?${queryString}`);
            
            if (!response.ok) {
                throw new Error('Kampanya araması başarısız oldu');
            }

            return await response.json();
        } catch (error) {
            console.error('Kampanya arama hatası:', error);
            throw error;
        }
    }

    // Kategorileri getir
    async getCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/categories`);
            
            if (!response.ok) {
                throw new Error('Kategoriler getirilemedi');
            }

            return await response.json();
        } catch (error) {
            console.error('Kategori getirme hatası:', error);
            throw error;
        }
    }

    // Bölgeleri getir
    async getRegions() {
        try {
            const response = await fetch(`${this.baseUrl}/regions`);
            
            if (!response.ok) {
                throw new Error('Bölgeler getirilemedi');
            }

            return await response.json();
        } catch (error) {
            console.error('Bölge getirme hatası:', error);
            throw error;
        }
    }

    // Filtreleme seçeneklerini getir
    async getFilterOptions() {
        try {
            const response = await fetch(`${this.baseUrl}/filters/options`);
            
            if (!response.ok) {
                throw new Error('Filtreleme seçenekleri getirilemedi');
            }

            return await response.json();
        } catch (error) {
            console.error('Filtreleme seçenekleri getirme hatası:', error);
            throw error;
        }
    }

    // Gelişmiş arama
    async advancedSearch(params) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseUrl}/search/advanced?${queryString}`);
            
            if (!response.ok) {
                throw new Error('Gelişmiş arama başarısız oldu');
            }

            return await response.json();
        } catch (error) {
            console.error('Gelişmiş arama hatası:', error);
            throw error;
        }
    }
} 