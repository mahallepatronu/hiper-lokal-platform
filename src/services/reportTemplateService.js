import { apiService } from './apiService.js';

export class ReportTemplateService {
    constructor() {
        this.baseUrl = '/api/report-templates';
    }

    async getTemplates() {
        try {
            const response = await fetch(this.baseUrl);
            if (!response.ok) throw new Error('Şablonlar yüklenemedi');
            return await response.json();
        } catch (error) {
            console.error('Şablonlar yükleme hatası:', error);
            throw error;
        }
    }

    async getTemplateById(templateId) {
        try {
            const response = await fetch(`${this.baseUrl}/${templateId}`);
            if (!response.ok) throw new Error('Şablon yüklenemedi');
            return await response.json();
        } catch (error) {
            console.error('Şablon yükleme hatası:', error);
            throw error;
        }
    }

    async createTemplate(templateData) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(templateData)
            });
            if (!response.ok) throw new Error('Şablon oluşturulamadı');
            return await response.json();
        } catch (error) {
            console.error('Şablon oluşturma hatası:', error);
            throw error;
        }
    }

    async updateTemplate(templateId, templateData) {
        try {
            const response = await fetch(`${this.baseUrl}/${templateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(templateData)
            });
            if (!response.ok) throw new Error('Şablon güncellenemedi');
            return await response.json();
        } catch (error) {
            console.error('Şablon güncelleme hatası:', error);
            throw error;
        }
    }

    async deleteTemplate(templateId) {
        try {
            const response = await fetch(`${this.baseUrl}/${templateId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Şablon silinemedi');
            return await response.json();
        } catch (error) {
            console.error('Şablon silme hatası:', error);
            throw error;
        }
    }

    async generateReport(templateId) {
        try {
            const response = await fetch(`${this.baseUrl}/${templateId}/generate`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Rapor oluşturulamadı');
            return await response.json();
        } catch (error) {
            console.error('Rapor oluşturma hatası:', error);
            throw error;
        }
    }

    async exportReport(reportId) {
        try {
            const response = await fetch(`${this.baseUrl}/reports/${reportId}/export`);
            if (!response.ok) throw new Error('Rapor dışa aktarılamadı');
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Rapor dışa aktarma hatası:', error);
            throw error;
        }
    }

    async scheduleReport(templateId, scheduleData) {
        try {
            const response = await apiService.post(`${this.baseUrl}/${templateId}/schedule`, scheduleData);
            return response.data;
        } catch (error) {
            console.error('Rapor planlaması oluşturulamadı:', error);
            throw error;
        }
    }

    async getScheduledReports() {
        try {
            const response = await apiService.get(`${this.baseUrl}/scheduled`);
            return response.data;
        } catch (error) {
            console.error('Planlanmış raporlar alınamadı:', error);
            throw error;
        }
    }

    async cancelScheduledReport(scheduleId) {
        try {
            await apiService.delete(`${this.baseUrl}/scheduled/${scheduleId}`);
        } catch (error) {
            console.error('Planlanmış rapor iptal edilemedi:', error);
            throw error;
        }
    }
}

import { apiService } from './apiService.js';

export class ReportTemplateService {
    constructor() {
        this.baseUrl = '/api/report-templates';
    }

    async getTemplates() {
        try {
            const response = await apiService.get(this.baseUrl);
            return response.data;
        } catch (error) {
            console.error('Rapor şablonları alınamadı:', error);
            throw error;
        }
    }

    async getTemplateById(templateId) {
        try {
            const response = await apiService.get(`${this.baseUrl}/${templateId}`);
            return response.data;
        } catch (error) {
            console.error('Rapor şablonu alınamadı:', error);
            throw error;
        }
    }

    async createTemplate(templateData) {
        try {
            const response = await apiService.post(this.baseUrl, templateData);
            return response.data;
        } catch (error) {
            console.error('Rapor şablonu oluşturulamadı:', error);
            throw error;
        }
    }

    async updateTemplate(templateId, templateData) {
        try {
            const response = await apiService.put(`${this.baseUrl}/${templateId}`, templateData);
            return response.data;
        } catch (error) {
            console.error('Rapor şablonu güncellenemedi:', error);
            throw error;
        }
    }

    async deleteTemplate(templateId) {
        try {
            await apiService.delete(`${this.baseUrl}/${templateId}`);
        } catch (error) {
            console.error('Rapor şablonu silinemedi:', error);
            throw error;
        }
    }

    async generateReport(templateId, data) {
        try {
            const response = await apiService.post(`${this.baseUrl}/${templateId}/generate`, data);
            return response.data;
        } catch (error) {
            console.error('Rapor oluşturulamadı:', error);
            throw error;
        }
    }

    async exportReport(reportId, format = 'pdf') {
        try {
            const response = await apiService.get(`${this.baseUrl}/reports/${reportId}/export`, {
                params: { format },
                responseType: 'blob'
            });
            return URL.createObjectURL(response.data);
        } catch (error) {
            console.error('Rapor dışa aktarılamadı:', error);
            throw error;
        }
    }

    async scheduleReport(templateId, scheduleData) {
        try {
            const response = await apiService.post(`${this.baseUrl}/${templateId}/schedule`, scheduleData);
            return response.data;
        } catch (error) {
            console.error('Rapor planlaması oluşturulamadı:', error);
            throw error;
        }
    }

    async getScheduledReports() {
        try {
            const response = await apiService.get(`${this.baseUrl}/scheduled`);
            return response.data;
        } catch (error) {
            console.error('Planlanmış raporlar alınamadı:', error);
            throw error;
        }
    }

    async cancelScheduledReport(scheduleId) {
        try {
            await apiService.delete(`${this.baseUrl}/scheduled/${scheduleId}`);
        } catch (error) {
            console.error('Planlanmış rapor iptal edilemedi:', error);
            throw error;
        }
    }
}

export const reportTemplateService = new ReportTemplateService(); 