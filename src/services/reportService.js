import { apiService } from './apiService.js';

export class ReportService {
    constructor() {
        this.baseUrl = '/api/reports';
    }

    async getSalesReports(dateRange) {
        try {
            const response = await apiService.get(`${this.baseUrl}/sales`, {
                params: {
                    startDate: dateRange.start.toISOString(),
                    endDate: dateRange.end.toISOString()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Satış raporları alınamadı:', error);
            throw error;
        }
    }

    async getProductSalesAnalysis(dateRange) {
        try {
            const response = await apiService.get(`${this.baseUrl}/products`, {
                params: {
                    startDate: dateRange.start.toISOString(),
                    endDate: dateRange.end.toISOString()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Ürün satış analizi alınamadı:', error);
            throw error;
        }
    }

    async getCustomerSegmentation(dateRange) {
        try {
            const response = await apiService.get(`${this.baseUrl}/customers`, {
                params: {
                    startDate: dateRange.start.toISOString(),
                    endDate: dateRange.end.toISOString()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Müşteri segmentasyonu alınamadı:', error);
            throw error;
        }
    }

    async getTrendAnalysis(dateRange, metric = 'sales', period = 'daily') {
        try {
            const response = await apiService.get(`${this.baseUrl}/trends`, {
                params: {
                    startDate: dateRange.start.toISOString(),
                    endDate: dateRange.end.toISOString(),
                    metric,
                    period
                }
            });
            return response.data;
        } catch (error) {
            console.error('Trend analizi alınamadı:', error);
            throw error;
        }
    }

    async getPerformanceMetrics(dateRange) {
        try {
            const response = await apiService.get(`${this.baseUrl}/performance`, {
                params: {
                    startDate: dateRange.start.toISOString(),
                    endDate: dateRange.end.toISOString()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Performans metrikleri alınamadı:', error);
            throw error;
        }
    }

    async getFinancialReports(dateRange) {
        try {
            const response = await apiService.get(`${this.baseUrl}/financial`, {
                params: {
                    startDate: dateRange.start.toISOString(),
                    endDate: dateRange.end.toISOString()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Finansal raporlar alınamadı:', error);
            throw error;
        }
    }

    async downloadReport(reportId, format = 'pdf') {
        try {
            const response = await apiService.get(`${this.baseUrl}/${reportId}/download`, {
                params: { format },
                responseType: 'blob'
            });
            return URL.createObjectURL(response.data);
        } catch (error) {
            console.error('Rapor indirilemedi:', error);
            throw error;
        }
    }

    async saveReport(reportData) {
        try {
            const response = await apiService.post(`${this.baseUrl}/save`, reportData);
            return response.data;
        } catch (error) {
            console.error('Rapor kaydedilemedi:', error);
            throw error;
        }
    }

    async getSavedReports() {
        try {
            const response = await apiService.get(`${this.baseUrl}/saved`);
            return response.data;
        } catch (error) {
            console.error('Kaydedilmiş raporlar alınamadı:', error);
            throw error;
        }
    }
}

export const reportService = new ReportService(); 