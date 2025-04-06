import { paymentService } from '../services/paymentService.js';

export class PaymentComponent {
    constructor(containerId, orderData) {
        this.container = document.getElementById(containerId);
        this.orderData = orderData;
        this.paymentMethods = [];
        this.installmentOptions = [];
        this.selectedMethod = null;
        this.selectedInstallment = null;
        this.isLoading = false;
    }

    async init() {
        try {
            await this.loadPaymentMethods();
            await this.loadInstallmentOptions();
            this.render();
            this.attachEventListeners();
        } catch (error) {
            console.error('Ödeme bileşeni başlatma hatası:', error);
        }
    }

    async loadPaymentMethods() {
        try {
            this.isLoading = true;
            this.paymentMethods = await paymentService.getPaymentMethods();
        } catch (error) {
            console.error('Ödeme yöntemleri yükleme hatası:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async loadInstallmentOptions() {
        try {
            this.isLoading = true;
            this.installmentOptions = await paymentService.getInstallmentOptions(this.orderData.totalAmount);
        } catch (error) {
            console.error('Taksit seçenekleri yükleme hatası:', error);
        } finally {
            this.isLoading = false;
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="payment-section">
                <div class="payment-header">
                    <h2>Ödeme</h2>
                    <div class="order-summary">
                        <div class="summary-item">
                            <span>Ara Toplam:</span>
                            <span>${this.formatPrice(this.orderData.subtotal)}</span>
                        </div>
                        <div class="summary-item">
                            <span>KDV (%${this.orderData.taxRate}):</span>
                            <span>${this.formatPrice(this.orderData.taxAmount)}</span>
                        </div>
                        <div class="summary-item total">
                            <span>Toplam:</span>
                            <span>${this.formatPrice(this.orderData.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                <div class="payment-methods">
                    <h3>Ödeme Yöntemi</h3>
                    <div class="methods-grid">
                        ${this.paymentMethods.map(method => `
                            <div class="payment-method-card ${this.selectedMethod?.id === method.id ? 'selected' : ''}" 
                                 data-method-id="${method.id}">
                                <img src="${method.icon}" alt="${method.name}" class="method-icon">
                                <h4>${method.name}</h4>
                                ${method.description ? `<p>${method.description}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${this.selectedMethod?.supportsInstallment ? `
                    <div class="installment-options">
                        <h3>Taksit Seçenekleri</h3>
                        <div class="installment-grid">
                            ${this.installmentOptions.map(option => `
                                <div class="installment-card ${this.selectedInstallment?.id === option.id ? 'selected' : ''}"
                                     data-installment-id="${option.id}">
                                    <div class="installment-header">
                                        <h4>${option.installmentCount} Taksit</h4>
                                        ${option.interestRate > 0 ? `
                                            <span class="interest-rate">%${option.interestRate} Faiz</span>
                                        ` : ''}
                                    </div>
                                    <div class="installment-details">
                                        <div class="monthly-payment">
                                            <span>Aylık Ödeme:</span>
                                            <span>${this.formatPrice(option.monthlyPayment)}</span>
                                        </div>
                                        <div class="total-payment">
                                            <span>Toplam Ödeme:</span>
                                            <span>${this.formatPrice(option.totalPayment)}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="payment-form" id="paymentForm">
                    <h3>Ödeme Bilgileri</h3>
                    <form id="paymentDetailsForm">
                        ${this.renderPaymentForm()}
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancelPayment">İptal</button>
                            <button type="submit" class="btn btn-primary" id="completePayment">
                                Ödemeyi Tamamla
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    renderPaymentForm() {
        if (!this.selectedMethod) return '';

        switch (this.selectedMethod.type) {
            case 'credit_card':
                return `
                    <div class="form-group">
                        <label for="cardNumber">Kart Numarası</label>
                        <input type="text" id="cardNumber" name="cardNumber" required 
                               pattern="[0-9]{16}" maxlength="16">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="expiryDate">Son Kullanma Tarihi</label>
                            <input type="text" id="expiryDate" name="expiryDate" required 
                                   pattern="[0-9]{2}/[0-9]{2}" maxlength="5">
                        </div>
                        <div class="form-group">
                            <label for="cvv">CVV</label>
                            <input type="text" id="cvv" name="cvv" required 
                                   pattern="[0-9]{3,4}" maxlength="4">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="cardHolder">Kart Üzerindeki İsim</label>
                        <input type="text" id="cardHolder" name="cardHolder" required>
                    </div>
                `;
            case 'bank_transfer':
                return `
                    <div class="form-group">
                        <label for="bankAccount">Banka Hesabı</label>
                        <select id="bankAccount" name="bankAccount" required>
                            <option value="">Hesap Seçin</option>
                            ${this.orderData.bankAccounts.map(account => `
                                <option value="${account.id}">
                                    ${account.bankName} - ${account.accountNumber}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                `;
            case 'digital_wallet':
                return `
                    <div class="form-group">
                        <label for="walletType">Cüzdan Seçin</label>
                        <select id="walletType" name="walletType" required>
                            <option value="">Cüzdan Seçin</option>
                            ${this.selectedMethod.wallets.map(wallet => `
                                <option value="${wallet.id}">${wallet.name}</option>
                            `).join('')}
                        </select>
                    </div>
                `;
            default:
                return '';
        }
    }

    attachEventListeners() {
        // Ödeme yöntemi seçimi
        this.container.querySelectorAll('.payment-method-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleMethodSelect(e));
        });

        // Taksit seçimi
        this.container.querySelectorAll('.installment-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleInstallmentSelect(e));
        });

        // Form gönderimi
        const form = this.container.querySelector('#paymentDetailsForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // İptal butonu
        const cancelButton = this.container.querySelector('#cancelPayment');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => this.handleCancel());
        }

        // Kart numarası formatı
        const cardNumber = this.container.querySelector('#cardNumber');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => this.formatCardNumber(e));
        }

        // Son kullanma tarihi formatı
        const expiryDate = this.container.querySelector('#expiryDate');
        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => this.formatExpiryDate(e));
        }
    }

    handleMethodSelect(e) {
        const card = e.target.closest('.payment-method-card');
        const methodId = card.dataset.methodId;
        this.selectedMethod = this.paymentMethods.find(m => m.id === methodId);
        
        this.container.querySelectorAll('.payment-method-card').forEach(c => {
            c.classList.remove('selected');
        });
        card.classList.add('selected');

        this.render();
        this.attachEventListeners();
    }

    handleInstallmentSelect(e) {
        const card = e.target.closest('.installment-card');
        const installmentId = card.dataset.installmentId;
        this.selectedInstallment = this.installmentOptions.find(i => i.id === installmentId);
        
        this.container.querySelectorAll('.installment-card').forEach(c => {
            c.classList.remove('selected');
        });
        card.classList.add('selected');
    }

    async handleSubmit(e) {
        e.preventDefault();
        try {
            this.isLoading = true;
            const formData = new FormData(e.target);
            const paymentData = {
                method: this.selectedMethod.id,
                amount: this.orderData.totalAmount,
                currency: this.orderData.currency,
                orderId: this.orderData.id,
                installment: this.selectedInstallment?.id,
                ...Object.fromEntries(formData)
            };

            const payment = await paymentService.initiatePayment(paymentData);
            await paymentService.completePayment(payment.id, paymentData);
            
            this.showMessage('Ödeme başarıyla tamamlandı.', 'success');
            this.generateInvoice(payment.id);
        } catch (error) {
            console.error('Ödeme hatası:', error);
            this.showMessage('Ödeme işlemi sırasında bir hata oluştu.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async handleCancel() {
        try {
            this.isLoading = true;
            await paymentService.cancelPayment(this.orderData.id);
            this.showMessage('Ödeme işlemi iptal edildi.', 'info');
        } catch (error) {
            console.error('İptal hatası:', error);
            this.showMessage('İptal işlemi sırasında bir hata oluştu.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    async generateInvoice(paymentId) {
        try {
            const invoice = await paymentService.generateInvoice(paymentId);
            const invoiceUrl = await paymentService.downloadInvoice(invoice.id);
            
            const link = document.createElement('a');
            link.href = invoiceUrl;
            link.download = `fatura-${invoice.id}.pdf`;
            link.click();
        } catch (error) {
            console.error('Fatura oluşturma hatası:', error);
        }
    }

    formatCardNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value;
    }

    formatExpiryDate(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        e.target.value = value;
    }

    formatPrice(amount) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: this.orderData.currency
        }).format(amount);
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = message;
        this.container.prepend(messageDiv);
        setTimeout(() => messageDiv.remove(), 5000);
    }
} 