import { reviewService } from '../services/reviewService.js';

export class ReviewComponent {
    constructor(containerId, businessId) {
        this.container = document.getElementById(containerId);
        this.businessId = businessId;
        this.reviews = [];
        this.currentPage = 1;
        this.reviewsPerPage = 5;
        this.isLoading = false;
    }

    async init() {
        try {
            await this.loadReviews();
            this.render();
            this.attachEventListeners();
        } catch (error) {
            console.error('Değerlendirme bileşeni başlatma hatası:', error);
        }
    }

    async loadReviews() {
        try {
            this.isLoading = true;
            const params = {
                page: this.currentPage,
                limit: this.reviewsPerPage,
                sort: 'newest'
            };

            const response = await reviewService.getBusinessReviews(this.businessId, params);
            this.reviews = response.reviews;
            this.totalPages = response.totalPages;
            this.totalReviews = response.totalReviews;
        } catch (error) {
            console.error('Değerlendirme yükleme hatası:', error);
        } finally {
            this.isLoading = false;
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="reviews-section">
                <div class="reviews-header">
                    <h2>Değerlendirmeler</h2>
                    <div class="reviews-summary">
                        <div class="overall-rating">
                            <span class="rating-number">${this.calculateAverageRating()}</span>
                            <div class="rating-stars">
                                ${this.generateStars(this.calculateAverageRating())}
                            </div>
                            <span class="total-reviews">${this.totalReviews} değerlendirme</span>
                        </div>
                        <div class="rating-bars">
                            ${this.generateRatingBars()}
                        </div>
                    </div>
                </div>

                <div class="review-form" id="reviewForm">
                    <h3>Değerlendirme Yap</h3>
                    <form id="addReviewForm">
                        <div class="form-group">
                            <label for="rating">Puanınız</label>
                            <div class="rating-input">
                                ${this.generateRatingInput()}
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="comment">Yorumunuz</label>
                            <textarea id="comment" rows="4" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="photos">Fotoğraflar</label>
                            <input type="file" id="photos" multiple accept="image/*">
                            <div class="photo-preview" id="photoPreview"></div>
                        </div>
                        <button type="submit" class="btn btn-primary">Değerlendirme Yap</button>
                    </form>
                </div>

                <div class="reviews-list">
                    ${this.reviews.map(review => this.createReviewElement(review)).join('')}
                </div>

                ${this.generatePagination()}
            </div>
        `;
    }

    createReviewElement(review) {
        return `
            <div class="review-card" data-review-id="${review.id}">
                <div class="review-header">
                    <div class="reviewer-info">
                        <img src="${review.user.avatar || '/assets/images/default-avatar.png'}" 
                             alt="${review.user.name}" 
                             class="reviewer-avatar">
                        <div class="reviewer-details">
                            <h4>${review.user.name}</h4>
                            <span class="review-date">${this.formatDate(review.createdAt)}</span>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${this.generateStars(review.rating)}
                    </div>
                </div>
                <div class="review-content">
                    <p>${review.comment}</p>
                    ${review.photos.length > 0 ? `
                        <div class="review-photos">
                            ${review.photos.map(photo => `
                                <img src="${photo.url}" alt="Değerlendirme fotoğrafı" class="review-photo">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="review-actions">
                    ${this.canEditReview(review) ? `
                        <button class="btn-icon edit-review" title="Düzenle">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="btn-icon delete-review" title="Sil">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    ` : `
                        <button class="btn-icon report-review" title="Raporla">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
        }

        if (hasHalfStar) {
            stars += '<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<svg class="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
        }

        return stars;
    }

    generateRatingInput() {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `
                <input type="radio" id="star${i}" name="rating" value="${i}">
                <label for="star${i}">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                </label>
            `;
        }
        return stars;
    }

    generateRatingBars() {
        const stats = this.calculateRatingStats();
        let bars = '';
        for (let i = 5; i >= 1; i--) {
            const percentage = (stats[i] / this.totalReviews) * 100 || 0;
            bars += `
                <div class="rating-bar">
                    <span class="bar-label">${i} yıldız</span>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="bar-value">${stats[i]}</span>
                </div>
            `;
        }
        return bars;
    }

    calculateAverageRating() {
        if (this.reviews.length === 0) return 0;
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / this.reviews.length).toFixed(1);
    }

    calculateRatingStats() {
        const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        this.reviews.forEach(review => {
            stats[review.rating]++;
        });
        return stats;
    }

    generatePagination() {
        if (this.totalPages <= 1) return '';

        let pagination = '<div class="pagination">';
        for (let i = 1; i <= this.totalPages; i++) {
            pagination += `
                <button class="page-button ${i === this.currentPage ? 'active' : ''}" 
                        data-page="${i}">
                    ${i}
                </button>
            `;
        }
        pagination += '</div>';
        return pagination;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    canEditReview(review) {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        return currentUser && currentUser.id === review.user.id;
    }

    attachEventListeners() {
        // Değerlendirme formu
        const form = this.container.querySelector('#addReviewForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Fotoğraf önizleme
        const photoInput = this.container.querySelector('#photos');
        if (photoInput) {
            photoInput.addEventListener('change', (e) => this.handlePhotoPreview(e));
        }

        // Değerlendirme düzenleme
        this.container.querySelectorAll('.edit-review').forEach(button => {
            button.addEventListener('click', (e) => this.handleEdit(e));
        });

        // Değerlendirme silme
        this.container.querySelectorAll('.delete-review').forEach(button => {
            button.addEventListener('click', (e) => this.handleDelete(e));
        });

        // Değerlendirme raporlama
        this.container.querySelectorAll('.report-review').forEach(button => {
            button.addEventListener('click', (e) => this.handleReport(e));
        });

        // Sayfalama
        this.container.querySelectorAll('.page-button').forEach(button => {
            button.addEventListener('click', (e) => this.handlePageChange(e));
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const reviewData = {
                rating: parseInt(formData.get('rating')),
                comment: formData.get('comment'),
                photos: []
            };

            const review = await reviewService.addReview(this.businessId, reviewData);
            
            // Fotoğrafları yükle
            const photoFiles = e.target.querySelector('#photos').files;
            for (let i = 0; i < photoFiles.length; i++) {
                await reviewService.uploadReviewPhoto(review.id, photoFiles[i]);
            }

            await this.loadReviews();
            this.render();
            this.attachEventListeners();
            e.target.reset();
            this.showMessage('Değerlendirmeniz başarıyla eklendi.', 'success');
        } catch (error) {
            console.error('Değerlendirme ekleme hatası:', error);
            this.showMessage('Değerlendirme eklenirken bir hata oluştu.', 'error');
        }
    }

    handlePhotoPreview(e) {
        const preview = this.container.querySelector('#photoPreview');
        preview.innerHTML = '';
        
        Array.from(e.target.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-photo';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }

    async handleEdit(e) {
        const reviewCard = e.target.closest('.review-card');
        const reviewId = reviewCard.dataset.reviewId;
        const review = this.reviews.find(r => r.id === reviewId);

        // Düzenleme formunu göster
        const form = this.container.querySelector('#addReviewForm');
        form.querySelector('[name="rating"]').value = review.rating;
        form.querySelector('#comment').value = review.comment;
        form.dataset.editId = reviewId;

        // Sayfayı form bölümüne kaydır
        form.scrollIntoView({ behavior: 'smooth' });
    }

    async handleDelete(e) {
        if (!confirm('Bu değerlendirmeyi silmek istediğinizden emin misiniz?')) return;

        const reviewCard = e.target.closest('.review-card');
        const reviewId = reviewCard.dataset.reviewId;

        try {
            await reviewService.deleteReview(reviewId);
            await this.loadReviews();
            this.render();
            this.attachEventListeners();
            this.showMessage('Değerlendirme başarıyla silindi.', 'success');
        } catch (error) {
            console.error('Değerlendirme silme hatası:', error);
            this.showMessage('Değerlendirme silinirken bir hata oluştu.', 'error');
        }
    }

    async handleReport(e) {
        const reviewCard = e.target.closest('.review-card');
        const reviewId = reviewCard.dataset.reviewId;

        const reason = prompt('Lütfen raporlama nedeninizi belirtin:');
        if (!reason) return;

        try {
            await reviewService.reportReview(reviewId, { reason });
            this.showMessage('Değerlendirme başarıyla raporlandı.', 'success');
        } catch (error) {
            console.error('Raporlama hatası:', error);
            this.showMessage('Değerlendirme raporlanırken bir hata oluştu.', 'error');
        }
    }

    async handlePageChange(e) {
        const page = parseInt(e.target.dataset.page);
        if (page === this.currentPage) return;

        this.currentPage = page;
        await this.loadReviews();
        this.render();
        this.attachEventListeners();
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = message;
        this.container.prepend(messageDiv);
        setTimeout(() => messageDiv.remove(), 5000);
    }
} 