import { reportService } from '../services/reportService.js';
import Chart from 'chart.js/auto';

export class ReportComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentReport = null;
        this.dateRange = {
            start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            end: new Date()
        };
        this.isLoading = false;
        this.charts = {};
    }

    async init() {
        try {
            await this.loadReports();
            this.render();
            this.attachEventListeners();
            this.initializeCharts();
        } catch (error) {
            console.error('Raporlama bileşeni başlatma hatası:', error);
        }
    }

    async loadReports() {
        try {
            this.isLoading = true;
            const [salesReports, productAnalysis, customerSegmentation, trends, performance, financial] = await Promise.all([
                reportService.getSalesReports(this.dateRange),
                reportService.getProductSalesAnalysis(this.dateRange),
                reportService.getCustomerSegmentation(this.dateRange),
                reportService.getTrendAnalysis(this.dateRange),
                reportService.getPerformanceMetrics(this.dateRange),
                reportService.getFinancialReports(this.dateRange)
            ]);

            this.reports = {
                sales: salesReports,
                products: productAnalysis,
                customers: customerSegmentation,
                trends: trends,
                performance: performance,
                financial: financial
            };
        } catch (error) {
            console.error('Raporlar yükleme hatası:', error);
        } finally {
            this.isLoading = false;
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="reports-section">
                <div class="reports-header">
                    <h2>Raporlar</h2>
                    <div class="date-range-picker">
                        <div class="form-group">
                            <label for="startDate">Başlangıç Tarihi</label>
                            <input type="date" id="startDate" value="${this.formatDate(this.dateRange.start)}">
                        </div>
                        <div class="form-group">
                            <label for="endDate">Bitiş Tarihi</label>
                            <input type="date" id="endDate" value="${this.formatDate(this.dateRange.end)}">
                        </div>
                        <button class="btn btn-primary" id="updateReports">Güncelle</button>
                    </div>
                </div>

                <div class="reports-grid">
                    <div class="report-card" data-report="sales">
                        <h3>Satış Raporları</h3>
                        <div class="report-content">
                            ${this.renderSalesReport()}
                        </div>
                    </div>

                    <div class="report-card" data-report="products">
                        <h3>Ürün Analizleri</h3>
                        <div class="report-content">
                            ${this.renderProductAnalysis()}
                        </div>
                    </div>

                    <div class="report-card" data-report="customers">
                        <h3>Müşteri Segmentasyonu</h3>
                        <div class="report-content">
                            ${this.renderCustomerSegmentation()}
                        </div>
                    </div>

                    <div class="report-card" data-report="trends">
                        <h3>Trend Analizleri</h3>
                        <div class="report-content">
                            ${this.renderTrendAnalysis()}
                        </div>
                    </div>

                    <div class="report-card" data-report="performance">
                        <h3>Performans Metrikleri</h3>
                        <div class="report-content">
                            ${this.renderPerformanceMetrics()}
                        </div>
                    </div>

                    <div class="report-card" data-report="financial">
                        <h3>Finansal Raporlar</h3>
                        <div class="report-content">
                            ${this.renderFinancialReports()}
                        </div>
                    </div>
                </div>

                <div class="report-actions">
                    <button class="btn btn-secondary" id="saveReport">Raporu Kaydet</button>
                    <button class="btn btn-primary" id="downloadReport">Raporu İndir</button>
                </div>
            </div>
        `;
    }

    renderSalesReport() {
        if (!this.reports?.sales) return 'Yükleniyor...';

        const { totalSales, averageOrderValue, orderCount } = this.reports.sales;
        return `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">${this.formatPrice(totalSales)}</span>
                    <span class="stat-label">Toplam Satış</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.formatPrice(averageOrderValue)}</span>
                    <span class="stat-label">Ortalama Sipariş Değeri</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${orderCount}</span>
                    <span class="stat-label">Sipariş Sayısı</span>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="salesChart"></canvas>
            </div>
        `;
    }

    renderProductAnalysis() {
        if (!this.reports?.products) return 'Yükleniyor...';

        return `
            <div class="product-list">
                ${this.reports.products.map(product => `
                    <div class="product-item">
                        <div class="product-info">
                            <h4>${product.name}</h4>
                            <p>Satış: ${this.formatPrice(product.sales)}</p>
                            <p>Adet: ${product.quantity}</p>
                        </div>
                        <div class="product-chart">
                            <canvas id="productChart-${product.id}"></canvas>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCustomerSegmentation() {
        if (!this.reports?.customers) return 'Yükleniyor...';

        return `
            <div class="segmentation-grid">
                ${this.reports.customers.map(segment => `
                    <div class="segment-card">
                        <h4>${segment.name}</h4>
                        <div class="segment-stats">
                            <span class="stat-value">${segment.count}</span>
                            <span class="stat-label">Müşteri</span>
                        </div>
                        <div class="segment-chart">
                            <canvas id="segmentChart-${segment.id}"></canvas>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTrendAnalysis() {
        if (!this.reports?.trends) return 'Yükleniyor...';

        return `
            <div class="trends-container">
                <div class="trend-filters">
                    <select id="trendMetric">
                        <option value="sales">Satışlar</option>
                        <option value="orders">Siparişler</option>
                        <option value="customers">Müşteriler</option>
                    </select>
                    <select id="trendPeriod">
                        <option value="daily">Günlük</option>
                        <option value="weekly">Haftalık</option>
                        <option value="monthly">Aylık</option>
                    </select>
                </div>
                <div class="trend-chart">
                    <canvas id="trendChart"></canvas>
                </div>
            </div>
        `;
    }

    renderPerformanceMetrics() {
        if (!this.reports?.performance) return 'Yükleniyor...';

        const { conversionRate, customerLifetimeValue, campaignPerformance } = this.reports.performance;
        return `
            <div class="metrics-grid">
                <div class="metric-card">
                    <h4>Dönüşüm Oranı</h4>
                    <span class="metric-value">%${conversionRate}</span>
                </div>
                <div class="metric-card">
                    <h4>Müşteri Yaşam Boyu Değeri</h4>
                    <span class="metric-value">${this.formatPrice(customerLifetimeValue)}</span>
                </div>
                <div class="metric-card">
                    <h4>Kampanya Performansı</h4>
                    <div class="campaign-list">
                        ${campaignPerformance.map(campaign => `
                            <div class="campaign-item">
                                <span>${campaign.name}</span>
                                <span>${this.formatPrice(campaign.revenue)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderFinancialReports() {
        if (!this.reports?.financial) return 'Yükleniyor...';

        const { revenue, expenses, profit, cashFlow } = this.reports.financial;
        return `
            <div class="financial-grid">
                <div class="financial-card">
                    <h4>Gelir</h4>
                    <span class="financial-value positive">${this.formatPrice(revenue)}</span>
                </div>
                <div class="financial-card">
                    <h4>Gider</h4>
                    <span class="financial-value negative">${this.formatPrice(expenses)}</span>
                </div>
                <div class="financial-card">
                    <h4>Kâr</h4>
                    <span class="financial-value ${profit >= 0 ? 'positive' : 'negative'}">
                        ${this.formatPrice(profit)}
                    </span>
                </div>
                <div class="financial-card">
                    <h4>Nakit Akışı</h4>
                    <span class="financial-value ${cashFlow >= 0 ? 'positive' : 'negative'}">
                        ${this.formatPrice(cashFlow)}
                    </span>
                </div>
            </div>
            <div class="financial-chart">
                <canvas id="financialChart"></canvas>
            </div>
        `;
    }

    attachEventListeners() {
        // Tarih aralığı güncelleme
        const updateButton = this.container.querySelector('#updateReports');
        if (updateButton) {
            updateButton.addEventListener('click', () => this.handleDateRangeUpdate());
        }

        // Rapor kaydetme
        const saveButton = this.container.querySelector('#saveReport');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.handleSaveReport());
        }

        // Rapor indirme
        const downloadButton = this.container.querySelector('#downloadReport');
        if (downloadButton) {
            downloadButton.addEventListener('click', () => this.handleDownloadReport());
        }

        // Trend metrik değişikliği
        const trendMetric = this.container.querySelector('#trendMetric');
        if (trendMetric) {
            trendMetric.addEventListener('change', () => this.handleTrendMetricChange());
        }

        // Trend periyot değişikliği
        const trendPeriod = this.container.querySelector('#trendPeriod');
        if (trendPeriod) {
            trendPeriod.addEventListener('change', () => this.handleTrendPeriodChange());
        }
    }

    async handleDateRangeUpdate() {
        const startDate = this.container.querySelector('#startDate').value;
        const endDate = this.container.querySelector('#endDate').value;

        this.dateRange = {
            start: new Date(startDate),
            end: new Date(endDate)
        };

        await this.loadReports();
        this.render();
        this.attachEventListeners();
        this.initializeCharts();
    }

    async handleSaveReport() {
        try {
            const reportData = {
                dateRange: this.dateRange,
                reports: this.reports
            };

            await reportService.saveReport(reportData);
            this.showMessage('Rapor başarıyla kaydedildi.', 'success');
        } catch (error) {
            console.error('Rapor kaydetme hatası:', error);
            this.showMessage('Rapor kaydedilirken bir hata oluştu.', 'error');
        }
    }

    async handleDownloadReport() {
        try {
            const reportUrl = await reportService.downloadReport(this.currentReport?.id);
            const link = document.createElement('a');
            link.href = reportUrl;
            link.download = `rapor-${this.formatDate(new Date())}.pdf`;
            link.click();
        } catch (error) {
            console.error('Rapor indirme hatası:', error);
            this.showMessage('Rapor indirilirken bir hata oluştu.', 'error');
        }
    }

    initializeCharts() {
        // Satış Grafiği
        const salesCtx = document.getElementById('salesChart');
        if (salesCtx && this.reports?.sales) {
            this.charts.sales = new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: this.reports.sales.dates,
                    datasets: [{
                        label: 'Satışlar',
                        data: this.reports.sales.values,
                        borderColor: '#4F46E5',
                        tension: 0.4,
                        fill: true,
                        backgroundColor: 'rgba(79, 70, 229, 0.1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => this.formatPrice(value)
                            }
                        }
                    }
                }
            });
        }

        // Ürün Grafikleri
        if (this.reports?.products) {
            this.reports.products.forEach(product => {
                const productCtx = document.getElementById(`productChart-${product.id}`);
                if (productCtx) {
                    this.charts[`product-${product.id}`] = new Chart(productCtx, {
                        type: 'bar',
                        data: {
                            labels: ['Satış', 'Adet'],
                            datasets: [{
                                data: [product.sales, product.quantity],
                                backgroundColor: ['#4F46E5', '#10B981']
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: value => this.formatPrice(value)
                                    }
                                }
                            }
                        }
                    });
                }
            });
        }

        // Müşteri Segmentasyonu Grafikleri
        if (this.reports?.customers) {
            this.reports.customers.forEach(segment => {
                const segmentCtx = document.getElementById(`segmentChart-${segment.id}`);
                if (segmentCtx) {
                    this.charts[`segment-${segment.id}`] = new Chart(segmentCtx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Bu Segment', 'Diğer'],
                            datasets: [{
                                data: [segment.count, segment.total - segment.count],
                                backgroundColor: ['#4F46E5', '#E5E7EB']
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false
                                }
                            }
                        }
                    });
                }
            });
        }

        // Trend Grafiği
        const trendCtx = document.getElementById('trendChart');
        if (trendCtx && this.reports?.trends) {
            this.charts.trend = new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: this.reports.trends.dates,
                    datasets: [{
                        label: this.reports.trends.metric,
                        data: this.reports.trends.values,
                        borderColor: '#4F46E5',
                        tension: 0.4,
                        fill: true,
                        backgroundColor: 'rgba(79, 70, 229, 0.1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => this.formatPrice(value)
                            }
                        }
                    }
                }
            });
        }

        // Finansal Grafik
        const financialCtx = document.getElementById('financialChart');
        if (financialCtx && this.reports?.financial) {
            this.charts.financial = new Chart(financialCtx, {
                type: 'bar',
                data: {
                    labels: ['Gelir', 'Gider', 'Kâr', 'Nakit Akışı'],
                    datasets: [{
                        data: [
                            this.reports.financial.revenue,
                            this.reports.financial.expenses,
                            this.reports.financial.profit,
                            this.reports.financial.cashFlow
                        ],
                        backgroundColor: [
                            '#10B981',
                            '#EF4444',
                            '#4F46E5',
                            '#F59E0B'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => this.formatPrice(value)
                            }
                        }
                    }
                }
            });
        }
    }

    handleTrendMetricChange() {
        const metric = this.container.querySelector('#trendMetric').value;
        if (this.charts.trend) {
            this.charts.trend.destroy();
            this.loadReports();
            this.initializeCharts();
        }
    }

    handleTrendPeriodChange() {
        const period = this.container.querySelector('#trendPeriod').value;
        if (this.charts.trend) {
            this.charts.trend.destroy();
            this.loadReports();
            this.initializeCharts();
        }
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    formatPrice(amount) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
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