export class PaymentService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
    }

    // Ödeme başlat
    async initiatePayment(paymentData) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(paymentData)
            });
            
            if (!response.ok) {
                throw new Error('Ödeme başlatılamadı');
            }

            return await response.json();
        } catch (error) {
            console.error('Ödeme başlatma hatası:', error);
            throw error;
        }
    }

    // Ödeme tamamla
    async completePayment(paymentId, paymentData) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/${paymentId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(paymentData)
            });
            
            if (!response.ok) {
                throw new Error('Ödeme tamamlanamadı');
            }

            return await response.json();
        } catch (error) {
            console.error('Ödeme tamamlama hatası:', error);
            throw error;
        }
    }

    // Ödeme iptal et
    async cancelPayment(paymentId) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/${paymentId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Ödeme iptal edilemedi');
            }

            return await response.json();
        } catch (error) {
            console.error('Ödeme iptal hatası:', error);
            throw error;
        }
    }

    // Ödeme detaylarını getir
    async getPaymentDetails(paymentId) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Ödeme detayları getirilemedi');
            }

            return await response.json();
        } catch (error) {
            console.error('Ödeme detay getirme hatası:', error);
            throw error;
        }
    }

    // Ödeme geçmişini getir
    async getPaymentHistory(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseUrl}/payments/history?${queryString}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Ödeme geçmişi getirilemedi');
            }

            return await response.json();
        } catch (error) {
            console.error('Ödeme geçmişi getirme hatası:', error);
            throw error;
        }
    }

    // İade talebi oluştur
    async createRefundRequest(paymentId, refundData) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/${paymentId}/refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(refundData)
            });
            
            if (!response.ok) {
                throw new Error('İade talebi oluşturulamadı');
            }

            return await response.json();
        } catch (error) {
            console.error('İade talebi oluşturma hatası:', error);
            throw error;
        }
    }

    // İade durumunu kontrol et
    async checkRefundStatus(refundId) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/refunds/${refundId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('İade durumu kontrol edilemedi');
            }

            return await response.json();
        } catch (error) {
            console.error('İade durumu kontrol hatası:', error);
            throw error;
        }
    }

    // Fatura oluştur
    async generateInvoice(paymentId) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/${paymentId}/invoice`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Fatura oluşturulamadı');
            }

            return await response.json();
        } catch (error) {
            console.error('Fatura oluşturma hatası:', error);
            throw error;
        }
    }

    // Fatura indir
    async downloadInvoice(invoiceId) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/invoices/${invoiceId}/download`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Fatura indirilemedi');
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Fatura indirme hatası:', error);
            throw error;
        }
    }

    // Ödeme yöntemlerini getir
    async getPaymentMethods() {
        try {
            const response = await fetch(`${this.baseUrl}/payments/methods`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Ödeme yöntemleri getirilemedi');
            }

            return await response.json();
        } catch (error) {
            console.error('Ödeme yöntemleri getirme hatası:', error);
            throw error;
        }
    }

    // Taksit seçeneklerini getir
    async getInstallmentOptions(amount) {
        try {
            const response = await fetch(`${this.baseUrl}/payments/installments?amount=${amount}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Taksit seçenekleri getirilemedi');
            }

            return await response.json();
        } catch (error) {
            console.error('Taksit seçenekleri getirme hatası:', error);
            throw error;
        }
    }
} 