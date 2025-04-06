import { reportTemplateService } from '../services/reportTemplateService.js';

export class ReportTemplateComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.templates = [];
        this.selectedTemplate = null;
        this.isLoading = false;
        this.filters = {
            search: '',
            type: '',
            format: '',
            schedule: '',
            sortBy: 'name'
        };
    }

    async init() {
        try {
            await this.loadTemplates();
            this.render();
            this.attachEventListeners();
        } catch (error) {
            console.error('Rapor şablonları bileşeni başlatma hatası:', error);
        }
    }

    async loadTemplates() {
        try {
            this.isLoading = true;
            this.templates = await reportTemplateService.getTemplates();
        } catch (error) {
            console.error('Şablonlar yükleme hatası:', error);
        } finally {
            this.isLoading = false;
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="report-templates-section">
                <div class="templates-header">
                    <h2>Rapor Şablonları</h2>
                    <button class="btn btn-primary" id="createTemplate">Yeni Şablon Oluştur</button>
                </div>

                <div class="templates-filters">
                    <div class="search-box">
                        <input type="text" id="searchInput" placeholder="Şablon ara..." value="${this.filters.search}">
                        <i class="fas fa-search"></i>
                    </div>
                    <div class="filter-group">
                        <select id="typeFilter" value="${this.filters.type}">
                            <option value="">Tüm Rapor Tipleri</option>
                            <option value="sales">Satış Raporu</option>
                            <option value="inventory">Envanter Raporu</option>
                            <option value="financial">Finansal Rapor</option>
                            <option value="customer">Müşteri Raporu</option>
                        </select>
                        <select id="formatFilter" value="${this.filters.format}">
                            <option value="">Tüm Formatlar</option>
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                            <option value="csv">CSV</option>
                        </select>
                        <select id="scheduleFilter" value="${this.filters.schedule}">
                            <option value="">Tüm Planlamalar</option>
                            <option value="daily">Günlük</option>
                            <option value="weekly">Haftalık</option>
                            <option value="monthly">Aylık</option>
                        </select>
                        <select id="sortBy" value="${this.filters.sortBy}">
                            <option value="name">İsim (A-Z)</option>
                            <option value="name_desc">İsim (Z-A)</option>
                            <option value="date">Tarih (Yeni-Eski)</option>
                            <option value="date_desc">Tarih (Eski-Yeni)</option>
                        </select>
                    </div>
                </div>

                <div class="templates-grid">
                    ${this.renderTemplates()}
                </div>

                <div class="template-modal" id="templateModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Şablon Düzenle</h3>
                            <button class="close-button">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="templateForm">
                                <div class="form-group">
                                    <label for="templateName">Şablon Adı</label>
                                    <input type="text" id="templateName" required>
                                </div>
                                <div class="form-group">
                                    <label for="templateDescription">Açıklama</label>
                                    <textarea id="templateDescription" rows="3"></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="templateType">Rapor Tipi</label>
                                    <select id="templateType" required>
                                        <option value="sales">Satış Raporu</option>
                                        <option value="inventory">Envanter Raporu</option>
                                        <option value="financial">Finansal Rapor</option>
                                        <option value="customer">Müşteri Raporu</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="templateFormat">Format</label>
                                    <select id="templateFormat" required>
                                        <option value="pdf">PDF</option>
                                        <option value="excel">Excel</option>
                                        <option value="csv">CSV</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="templateSchedule">Planlama</label>
                                    <select id="templateSchedule">
                                        <option value="">Planlama Yok</option>
                                        <option value="daily">Günlük</option>
                                        <option value="weekly">Haftalık</option>
                                        <option value="monthly">Aylık</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="templateRecipients">Alıcılar</label>
                                    <input type="email" id="templateRecipients" multiple>
                                </div>
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary">Kaydet</button>
                                    <button type="button" class="btn btn-secondary" id="cancelTemplate">İptal</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTemplates() {
        if (this.isLoading) return '<div class="loading">Yükleniyor...</div>';
        
        let filteredTemplates = this.filterTemplates();
        
        if (filteredTemplates.length === 0) {
            return '<div class="no-templates">Arama kriterlerinize uygun şablon bulunamadı.</div>';
        }

        return filteredTemplates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-header">
                    <h3>${template.name}</h3>
                    <div class="template-actions">
                        <button class="btn-icon edit-template" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-template" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-icon generate-report" title="Rapor Oluştur">
                            <i class="fas fa-file-alt"></i>
                        </button>
                    </div>
                </div>
                <p class="template-description">${template.description}</p>
                <div class="template-meta">
                    <span class="template-type">${this.getTemplateTypeLabel(template.type)}</span>
                    <span class="template-format">${template.format.toUpperCase()}</span>
                    ${template.schedule ? `<span class="template-schedule">${this.getScheduleLabel(template.schedule)}</span>` : ''}
                </div>
                <div class="template-recipients">
                    ${template.recipients.map(recipient => `
                        <span class="recipient">${recipient}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    filterTemplates() {
        return this.templates.filter(template => {
            const matchesSearch = !this.filters.search || 
                template.name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                template.description.toLowerCase().includes(this.filters.search.toLowerCase());
            
            const matchesType = !this.filters.type || template.type === this.filters.type;
            const matchesFormat = !this.filters.format || template.format === this.filters.format;
            const matchesSchedule = !this.filters.schedule || template.schedule === this.filters.schedule;

            return matchesSearch && matchesType && matchesFormat && matchesSchedule;
        }).sort((a, b) => {
            switch (this.filters.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                case 'date':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'date_desc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                default:
                    return 0;
            }
        });
    }

    getTemplateTypeLabel(type) {
        const types = {
            sales: 'Satış Raporu',
            inventory: 'Envanter Raporu',
            financial: 'Finansal Rapor',
            customer: 'Müşteri Raporu'
        };
        return types[type] || type;
    }

    getScheduleLabel(schedule) {
        const schedules = {
            daily: 'Günlük',
            weekly: 'Haftalık',
            monthly: 'Aylık'
        };
        return schedules[schedule] || schedule;
    }

    attachEventListeners() {
        // Filtreleme ve arama
        const searchInput = this.container.querySelector('#searchInput');
        const typeFilter = this.container.querySelector('#typeFilter');
        const formatFilter = this.container.querySelector('#formatFilter');
        const scheduleFilter = this.container.querySelector('#scheduleFilter');
        const sortBy = this.container.querySelector('#sortBy');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.render();
                this.attachEventListeners();
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
                this.render();
                this.attachEventListeners();
            });
        }

        if (formatFilter) {
            formatFilter.addEventListener('change', (e) => {
                this.filters.format = e.target.value;
                this.render();
                this.attachEventListeners();
            });
        }

        if (scheduleFilter) {
            scheduleFilter.addEventListener('change', (e) => {
                this.filters.schedule = e.target.value;
                this.render();
                this.attachEventListeners();
            });
        }

        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.filters.sortBy = e.target.value;
                this.render();
                this.attachEventListeners();
            });
        }

        // Yeni şablon oluşturma
        const createButton = this.container.querySelector('#createTemplate');
        if (createButton) {
            createButton.addEventListener('click', () => this.showTemplateModal());
        }

        // Şablon düzenleme
        const editButtons = this.container.querySelectorAll('.edit-template');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const templateId = e.target.closest('.template-card').dataset.templateId;
                this.editTemplate(templateId);
            });
        });

        // Şablon silme
        const deleteButtons = this.container.querySelectorAll('.delete-template');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const templateId = e.target.closest('.template-card').dataset.templateId;
                this.deleteTemplate(templateId);
            });
        });

        // Rapor oluşturma
        const generateButtons = this.container.querySelectorAll('.generate-report');
        generateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const templateId = e.target.closest('.template-card').dataset.templateId;
                this.generateReport(templateId);
            });
        });

        // Modal kapatma
        const closeButton = this.container.querySelector('.close-button');
        const cancelButton = this.container.querySelector('#cancelTemplate');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hideTemplateModal());
        }
        if (cancelButton) {
            cancelButton.addEventListener('click', () => this.hideTemplateModal());
        }

        // Form gönderimi
        const form = this.container.querySelector('#templateForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    async showTemplateModal(templateId = null) {
        this.selectedTemplate = templateId ? 
            await reportTemplateService.getTemplateById(templateId) : null;

        const modal = this.container.querySelector('#templateModal');
        const form = modal.querySelector('#templateForm');

        if (this.selectedTemplate) {
            form.querySelector('#templateName').value = this.selectedTemplate.name;
            form.querySelector('#templateDescription').value = this.selectedTemplate.description;
            form.querySelector('#templateType').value = this.selectedTemplate.type;
            form.querySelector('#templateFormat').value = this.selectedTemplate.format;
            form.querySelector('#templateSchedule').value = this.selectedTemplate.schedule || '';
            form.querySelector('#templateRecipients').value = this.selectedTemplate.recipients.join(', ');
        } else {
            form.reset();
        }

        modal.style.display = 'flex';
    }

    hideTemplateModal() {
        const modal = this.container.querySelector('#templateModal');
        modal.style.display = 'none';
        this.selectedTemplate = null;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = {
            name: form.querySelector('#templateName').value,
            description: form.querySelector('#templateDescription').value,
            type: form.querySelector('#templateType').value,
            format: form.querySelector('#templateFormat').value,
            schedule: form.querySelector('#templateSchedule').value || null,
            recipients: form.querySelector('#templateRecipients').value.split(',').map(email => email.trim())
        };

        try {
            if (this.selectedTemplate) {
                await reportTemplateService.updateTemplate(this.selectedTemplate.id, formData);
                this.showMessage('Şablon başarıyla güncellendi.', 'success');
            } else {
                await reportTemplateService.createTemplate(formData);
                this.showMessage('Şablon başarıyla oluşturuldu.', 'success');
            }

            this.hideTemplateModal();
            await this.loadTemplates();
            this.render();
            this.attachEventListeners();
        } catch (error) {
            console.error('Form gönderim hatası:', error);
            this.showMessage('Bir hata oluştu.', 'error');
        }
    }

    async deleteTemplate(templateId) {
        if (!confirm('Bu şablonu silmek istediğinizden emin misiniz?')) return;

        try {
            await reportTemplateService.deleteTemplate(templateId);
            this.showMessage('Şablon başarıyla silindi.', 'success');
            await this.loadTemplates();
            this.render();
            this.attachEventListeners();
        } catch (error) {
            console.error('Şablon silme hatası:', error);
            this.showMessage('Şablon silinirken bir hata oluştu.', 'error');
        }
    }

    async generateReport(templateId) {
        try {
            const report = await reportTemplateService.generateReport(templateId);
            const reportUrl = await reportTemplateService.exportReport(report.id);
            
            const link = document.createElement('a');
            link.href = reportUrl;
            link.download = `rapor-${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();

            this.showMessage('Rapor başarıyla oluşturuldu.', 'success');
        } catch (error) {
            console.error('Rapor oluşturma hatası:', error);
            this.showMessage('Rapor oluşturulurken bir hata oluştu.', 'error');
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = message;
        this.container.prepend(messageDiv);
        setTimeout(() => messageDiv.remove(), 5000);
    }
} 