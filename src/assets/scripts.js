// Loading durumu yönetimi
const loadingManager = {
    show(element) {
        if (element) {
            element.classList.add('loading');
        }
    },
    hide(element) {
        if (element) {
            element.classList.remove('loading');
        }
    }
};

// Form gönderimi sırasında loading durumu
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', () => {
            loadingManager.show(form);
        });
    });
});

// API istekleri için loading durumu
const api = {
    async request(url, options = {}) {
        const element = document.querySelector('.loading-container');
        loadingManager.show(element);

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        } finally {
            loadingManager.hide(element);
        }
    }
};

// Animasyonları kontrol et
const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

// Animasyonlu elementleri gözlemle
document.querySelectorAll('.animate-on-scroll').forEach(element => {
    animationObserver.observe(element);
});

// Dark mode toggle
const darkModeToggle = document.querySelector('.dark-mode-toggle');
if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Sayfa yüklendiğinde dark mode durumunu kontrol et
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

// Form validasyonu
const validateForm = (form) => {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
};

// Form submit olaylarını dinle
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        if (!validateForm(form)) {
            e.preventDefault();
            showError('Lütfen tüm zorunlu alanları doldurun.');
        }
    });
});

// Hata mesajı göster
const showError = (message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.form-container').prepend(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
};

// Başarı mesajı göster
const showSuccess = (message) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.form-container').prepend(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}; 