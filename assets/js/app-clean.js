// Main Application JavaScript
class CertificationLearningPlatform {
    constructor() {
        this.certifications = [];
        this.contentParser = new ContentParser();
        this.currentUser = {
            streak: 7,
            completedCertifications: [],
            badges: ['aws', 'databricks', 'scrum'],
            studyTime: 0,
            xp: 1250,
            level: 5,
            studiedTopics: ['aws-basics', 'security'],
            lastStudyDate: new Date().toISOString().split('T')[0]
        };
        this.searchTimeout = null;
        this.achievements = new Map();
        this.init();
    }

    async init() {
        this.showWelcomeMessage();
        await this.loadContent();
        await this.loadCertifications();
        this.setupEventListeners();
        this.renderCertifications();
        this.updateStats();
        this.startAnimations();
        this.setupSearch();
        this.setupKeyboardShortcuts();
        this.initializeGamification();
    }

    showWelcomeMessage() {
        const welcomeToast = document.createElement('div');
        welcomeToast.className = 'achievement-popup show';
        welcomeToast.innerHTML = `
            <div class="achievement-icon">🚀</div>
            <div class="achievement-title">Welcome to HuGoLearn!</div>
            <div class="achievement-description">Your personalized certification journey starts here</div>
        `;
        document.body.appendChild(welcomeToast);
        
        setTimeout(() => {
            welcomeToast.remove();
        }, 4000);
    }

    async loadContent() {
        try {
            const loader = document.getElementById('loading-overlay');
            if (loader) loader.style.display = 'flex';
            
            await this.contentParser.loadAllContent();
            
            if (loader) loader.style.display = 'none';
        } catch (error) {
            console.error('Error loading content:', error);
            this.showNotification('Error loading content. Please refresh.', 'error');
        }
    }

    async loadCertifications() {
        this.certifications = Object.entries(PLATFORM_CONFIG.certifications).map(([id, cert]) => ({
            id,
            title: cert.name,
            provider: cert.provider,
            description: `${cert.name} certification covering ${cert.domains.length} key domains`,
            difficulty: cert.questions > 60 ? 'Advanced' : 'Intermediate',
            duration: cert.duration + ' minutes',
            questions: cert.questions,
            domains: cert.domains.map(d => `${d.name} (${d.weight}%)`),
            path: cert.studyPath,
            status: 'available'
        }));
    }

    setupEventListeners() {
        // Navigation
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.navigateToSection(targetId);
                
                // Close mobile menu
                if (navMenu) navMenu.classList.remove('active');
            });
        });

        // Certification filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                this.filterCertifications(filter);
            });
        });

        // Global functions for buttons
        window.startFlashcards = () => this.startFlashcardSession();
        window.startQuickQuiz = () => this.startQuickQuiz();
        window.startTimedPractice = () => this.startTimedPractice();
        window.startMockExam = () => this.startMockExam();
        window.showCertifications = () => this.navigateToSection('certifications');
        window.showProgress = () => this.navigateToSection('progress');
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        
        if (!searchInput || !searchResults) return;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }
            
            this.searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }

    async performSearch(query) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        searchResults.innerHTML = '<div class="search-loading">Searching...</div>';
        searchResults.style.display = 'block';
        
        try {
            const results = await this.contentParser.searchContent(query);
            this.displaySearchResults(results);
            
            // Track search
            this.awardXP(1, 'search');
        } catch (error) {
            console.error('Search error:', error);
            searchResults.innerHTML = '<div class="search-error">Search failed. Please try again.</div>';
        }
    }

    displaySearchResults(results) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-empty">No results found</div>';
            return;
        }

        searchResults.innerHTML = results.map(result => `
            <div class="search-result" onclick="app.openSearchResult('${result.type}', '${result.id}', '${result.section || ''}')">
                <div class="search-result-type">${result.type}</div>
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-preview">${result.preview}</div>
            </div>
        `).join('');
    }

    openSearchResult(type, id, section) {
        const searchResults = document.getElementById('search-results');
        if (searchResults) searchResults.style.display = 'none';
        
        if (type === 'flashcard') {
            this.startFlashcardSession(id);
        } else if (type === 'quiz') {
            this.startQuickQuiz(id);
        }
        
        this.awardXP(2, 'navigation');
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        document.getElementById('search-input')?.focus();
                        break;
                    case '1':
                        e.preventDefault();
                        this.navigateToSection('certifications');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigateToSection('flashcards');
                        break;
                    case '3':
                        e.preventDefault();
                        this.navigateToSection('practice');
                        break;
                }
            }
        });
    }

    initializeGamification() {
        this.updateUserLevel();
        this.checkDailyStreak();
        this.initializeAchievements();
        this.updateProgressBars();
    }

    updateUserLevel() {
        const level = Math.floor(this.currentUser.xp / 250) + 1;
        const xpInCurrentLevel = this.currentUser.xp % 250;
        const xpNeededForNext = 250 - xpInCurrentLevel;
        
        this.currentUser.level = level;
        
        // Update UI
        const levelElement = document.querySelector('.user-level');
        const xpBarFill = document.querySelector('.xp-bar-fill');
        const xpText = document.querySelector('.xp-text');
        
        if (levelElement) levelElement.textContent = level;
        if (xpBarFill) xpBarFill.style.width = `${(xpInCurrentLevel / 250) * 100}%`;
        if (xpText) xpText.textContent = `${xpInCurrentLevel}/${250} XP`;
    }

    awardXP(amount, reason) {
        this.currentUser.xp += amount;
        this.updateUserLevel();
        
        // Show XP notification
        this.showXPNotification(amount, reason);
        
        // Save to localStorage
        localStorage.setItem('userProgress', JSON.stringify(this.currentUser));
    }

    showXPNotification(amount, reason) {
        const notification = document.createElement('div');
        notification.className = 'xp-notification';
        notification.innerHTML = `+${amount} XP (${reason})`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 2000);
    }

    checkDailyStreak() {
        const today = new Date().toISOString().split('T')[0];
        const lastStudy = this.currentUser.lastStudyDate;
        
        if (lastStudy !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (lastStudy === yesterdayStr) {
                this.currentUser.streak++;
                this.showNotification(`🔥 ${this.currentUser.streak} day streak!`, 'success');
            } else if (lastStudy !== today) {
                this.currentUser.streak = 1;
            }
            
            this.currentUser.lastStudyDate = today;
            localStorage.setItem('userProgress', JSON.stringify(this.currentUser));
        }
    }

    renderCertifications() {
        const grid = document.getElementById('certifications-grid');
        if (!grid) return;

        grid.innerHTML = this.certifications.map(cert => `
            <div class="certification-card" data-provider="${cert.provider.toLowerCase().replace(/\s+/g, '-')}">
                <div class="cert-header">
                    <div class="cert-icon">
                        <i class="${this.getCertIcon(cert.provider)}"></i>
                    </div>
                    <div class="cert-badge">${cert.difficulty}</div>
                </div>
                <h3 class="cert-title">${cert.title}</h3>
                <p class="cert-description">${cert.description}</p>
                <div class="cert-meta">
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${cert.duration}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-question-circle"></i>
                        <span>${cert.questions} questions</span>
                    </div>
                </div>
                <div class="cert-domains">
                    ${cert.domains.slice(0, 2).map(domain => `
                        <span class="domain-tag">${domain.split('(')[0].trim()}</span>
                    `).join('')}
                </div>
                <div class="cert-actions">
                    <button class="btn btn-primary" onclick="app.startFlashcardSession('${cert.id}')">
                        <i class="fas fa-clone"></i> Flashcards
                    </button>
                    <button class="btn btn-outline" onclick="app.startQuickQuiz('${cert.id}')">
                        <i class="fas fa-play"></i> Quiz
                    </button>
                </div>
            </div>
        `).join('');
    }

    getCertIcon(provider) {
        const iconMap = {
            'Amazon Web Services': 'fab fa-aws',
            'Databricks': 'fas fa-database',
            'Microsoft Azure': 'fab fa-microsoft',
            'Google Cloud': 'fab fa-google',
            'Scrum.org': 'fas fa-sync-alt',
            'Astronomer': 'fas fa-wind'
        };
        return iconMap[provider] || 'fas fa-certificate';
    }

    filterCertifications(filter) {
        const cards = document.querySelectorAll('.certification-card');
        
        cards.forEach(card => {
            const provider = card.getAttribute('data-provider');
            const shouldShow = filter === 'all' || provider.includes(filter);
            
            card.style.display = shouldShow ? 'block' : 'none';
            
            if (shouldShow) {
                card.style.animation = 'fadeInUp 0.5s ease forwards';
            }
        });
    }

    navigateToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    updateStats() {
        // Update user stats in UI
        const statsElements = {
            'streak': this.currentUser.streak,
            'xp': this.currentUser.xp,
            'level': this.currentUser.level,
            'certifications': this.currentUser.completedCertifications.length
        };

        Object.entries(statsElements).forEach(([key, value]) => {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element) {
                this.animateCounter(element, value);
            }
        });
    }

    animateCounter(element, target) {
        const increment = target / 50;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = Math.floor(current);
            
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, 50);
    }

    startAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.certification-card, .stat-item, .practice-mode').forEach(el => {
            observer.observe(el);
        });
    }

    async startFlashcardSession(certId) {
        try {
            if (!window.flashcardManager) {
                window.flashcardManager = new FlashcardManager();
            }
            
            // Show flashcards section
            this.navigateToSection('flashcards');
            
            // Start session
            await window.flashcardManager.startSession(certId);
            
            // Award XP for starting
            this.awardXP(5, 'study_start');
            
        } catch (error) {
            console.error('Error starting flashcard session:', error);
            this.showNotification('Failed to start flashcard session', 'error');
        }
    }

    startQuickQuiz(certId) {
        this.showNotification('Quick quiz feature coming soon!', 'info');
        this.awardXP(2, 'quiz_attempt');
    }

    startTimedPractice() {
        this.showNotification('Timed practice mode coming soon!', 'info');
    }

    startMockExam() {
        this.showNotification('Mock exam mode coming soon!', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    initializeAchievements() {
        // Initialize achievement system
        this.achievements.set('first_study', {
            name: 'First Steps',
            description: 'Complete your first study session',
            unlocked: this.currentUser.studiedTopics.length > 0
        });
        
        this.achievements.set('streak_7', {
            name: 'Week Warrior',
            description: 'Maintain a 7-day study streak',
            unlocked: this.currentUser.streak >= 7
        });
        
        this.achievements.set('xp_1000', {
            name: 'Experience Master',
            description: 'Earn 1000+ XP',
            unlocked: this.currentUser.xp >= 1000
        });
    }

    updateProgressBars() {
        // Update various progress indicators
        const progressElements = document.querySelectorAll('.progress-bar');
        progressElements.forEach(bar => {
            const target = parseInt(bar.getAttribute('data-progress') || '0');
            const fill = bar.querySelector('.progress-fill');
            if (fill) {
                setTimeout(() => {
                    fill.style.width = `${target}%`;
                }, 500);
            }
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CertificationLearningPlatform();
});
