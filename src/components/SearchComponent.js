import { searchService } from '../services/searchService.js';

export class SearchComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.searchParams = {
            query: '',
            category: '',
            region: '',
            minRating: 0,
            isOpen: false,
            hasCampaign: false,
            sortBy: 'rating'
        };
    }

    async init() {
        try {
            // Kategorileri ve bölgeleri yükle
            const [categories, regions] = await Promise.all([
                searchService.getCategories(),
                searchService.getRegions()
            ]);

            this.render(categories, regions);
            this.attachEventListeners();
        } catch (error) {
            console.error('Arama bileşeni başlatma hatası:', error);
        }
    }

    render(categories, regions) {
        this.container.innerHTML = `
            <div class="search-container">
                <div class="search-header">
                    <div class="search-input-group">
                        <input type="text" 
                               class="search-input" 
                               placeholder="İşletme veya kampanya ara..."
                               value="${this.searchParams.query}">
                        <button class="search-button">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="search-filters">
                    <div class="filter-group">
                        <label for="category">Kategori</label>
                        <select id="category" class="filter-select">
                            <option value="">Tümü</option>
                            ${categories.map(category => `
                                <option value="${category.id}" ${this.searchParams.category === category.id ? 'selected' : ''}>
                                    ${category.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="region">Bölge</label>
                        <select id="region" class="filter-select">
                            <option value="">Tümü</option>
                            ${regions.map(region => `
                                <option value="${region.id}" ${this.searchParams.region === region.id ? 'selected' : ''}>
                                    ${region.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="minRating">Minimum Puan</label>
                        <select id="minRating" class="filter-select">
                            <option value="0" ${this.searchParams.minRating === 0 ? 'selected' : ''}>Tümü</option>
                            <option value="4" ${this.searchParams.minRating === 4 ? 'selected' : ''}>4+ Yıldız</option>
                            <option value="3" ${this.searchParams.minRating === 3 ? 'selected' : ''}>3+ Yıldız</option>
                            <option value="2" ${this.searchParams.minRating === 2 ? 'selected' : ''}>2+ Yıldız</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="sortBy">Sıralama</label>
                        <select id="sortBy" class="filter-select">
                            <option value="rating" ${this.searchParams.sortBy === 'rating' ? 'selected' : ''}>Puana Göre</option>
                            <option value="distance" ${this.searchParams.sortBy === 'distance' ? 'selected' : ''}>Uzaklığa Göre</option>
                            <option value="popularity" ${this.searchParams.sortBy === 'popularity' ? 'selected' : ''}>Popülerliğe Göre</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="isOpen" ${this.searchParams.isOpen ? 'checked' : ''}>
                            <span>Açık İşletmeler</span>
                        </label>
                    </div>

                    <div class="filter-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="hasCampaign" ${this.searchParams.hasCampaign ? 'checked' : ''}>
                            <span>Aktif Kampanyası Olanlar</span>
                        </label>
                    </div>
                </div>

                <div class="search-results" id="searchResults">
                    <!-- Arama sonuçları buraya eklenecek -->
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Arama butonu
        const searchButton = this.container.querySelector('.search-button');
        searchButton.addEventListener('click', () => this.performSearch());

        // Enter tuşu ile arama
        const searchInput = this.container.querySelector('.search-input');
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Filtre değişikliklerini dinle
        const filterInputs = this.container.querySelectorAll('.filter-select, .checkbox-label input');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => this.updateSearchParams());
        });
    }

    updateSearchParams() {
        this.searchParams = {
            query: this.container.querySelector('.search-input').value,
            category: this.container.querySelector('#category').value,
            region: this.container.querySelector('#region').value,
            minRating: parseInt(this.container.querySelector('#minRating').value),
            isOpen: this.container.querySelector('#isOpen').checked,
            hasCampaign: this.container.querySelector('#hasCampaign').checked,
            sortBy: this.container.querySelector('#sortBy').value
        };
    }

    async performSearch() {
        try {
            this.updateSearchParams();
            const results = await searchService.searchBusinesses(this.searchParams);
            this.displayResults(results);
        } catch (error) {
            console.error('Arama hatası:', error);
            this.showError('Arama sırasında bir hata oluştu.');
        }
    }

    displayResults(results) {
        const resultsContainer = this.container.querySelector('#searchResults');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p>Aramanızla eşleşen sonuç bulunamadı.</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = results.map(business => `
            <div class="business-card">
                <div class="business-image">
                    <img src="${business.image}" alt="${business.name}">
                </div>
                <div class="business-info">
                    <h3>${business.name}</h3>
                    <div class="business-meta">
                        <span class="rating">
                            ${this.generateStars(business.rating)}
                            <span class="rating-count">(${business.reviewCount})</span>
                        </span>
                        <span class="category">${business.category}</span>
                    </div>
                    <p class="address">${business.address}</p>
                    ${business.hasCampaign ? `
                        <div class="campaign-badge">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                            </svg>
                            Aktif Kampanya
                        </div>
                    ` : ''}
                </div>
                <div class="business-actions">
                    <a href="/business/${business.id}" class="btn btn-primary">Detaylar</a>
                    <button class="btn btn-outline" onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(business.address)}', '_blank')">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        Harita
                    </button>
                </div>
            </div>
        `).join('');
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
        }

        if (hasHalfStar) {
            stars += '<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
        }

        return stars;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.container.prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
} 