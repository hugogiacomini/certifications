// Enhanced Flashcard Manager with Gestures and Study Modes
class FlashcardManager {
    constructor() {
        this.currentSession = null;
        this.currentCardIndex = 0;
        this.sessionStats = {
            correct: 0,
            incorrect: 0,
            timeSpent: 0,
            startTime: null
        };
        this.studyMode = 'sequential'; // sequential, random, difficult
        this.autoPlayInterval = null;
        this.autoPlaySpeed = 5000; // 5 seconds
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isFlipped = false;
        this.userAnswers = new Map();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Touch events for swipe gestures
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeypress(e));
    }

    async startSession(certId) {
        try {
            if (!window.app.contentParser) {
                throw new Error('Content parser not available');
            }

            const flashcards = window.app.contentParser.getFlashcards(certId);
            if (!flashcards || flashcards.length === 0) {
                throw new Error('No flashcards available for this certification');
            }

            this.currentSession = {
                certId,
                flashcards: this.prepareFlashcards(flashcards),
                totalCards: flashcards.length
            };

            this.resetSessionStats();
            this.showFlashcardInterface();
            this.showCurrentCard();
            this.showInstructions();

        } catch (error) {
            console.error('Error starting flashcard session:', error);
            throw error;
        }
    }

    prepareFlashcards(flashcards) {
        let prepared = [...flashcards];
        
        switch (this.studyMode) {
            case 'random':
                prepared = this.shuffleArray(prepared);
                break;
            case 'difficult':
                prepared = prepared.filter(card => card.difficulty === 'hard' || card.difficulty === 'medium')
                    .concat(prepared.filter(card => card.difficulty === 'easy'));
                break;
            case 'sequential':
            default:
                // Keep original order
                break;
        }
        
        return prepared;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    resetSessionStats() {
        this.currentCardIndex = 0;
        this.sessionStats = {
            correct: 0,
            incorrect: 0,
            timeSpent: 0,
            startTime: Date.now()
        };
        this.isFlipped = false;
        this.userAnswers.clear();
    }

    showFlashcardInterface() {
        const container = document.getElementById('flashcard-container');
        if (!container) {
            console.error('Flashcard container not found');
            return;
        }

        container.innerHTML = `
            <div class="flashcard-session">
                <div class="session-header">
                    <div class="session-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <span class="progress-text">1 / ${this.currentSession.totalCards}</span>
                    </div>
                    <div class="session-controls">
                        <div class="study-mode-selector">
                            <div class="modern-dropdown" id="study-mode-dropdown">
                                <div class="dropdown-trigger" id="study-mode-trigger">
                                    <i class="fas fa-sort-amount-down"></i>
                                    <span id="study-mode-text">Sequential</span>
                                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                                </div>
                                <div class="dropdown-menu" id="study-mode-menu">
                                    <div class="dropdown-item" data-value="sequential">
                                        <i class="fas fa-list-ol"></i>
                                        <div class="item-content">
                                            <span class="item-title">Sequential</span>
                                            <span class="item-description">Study cards in order</span>
                                        </div>
                                    </div>
                                    <div class="dropdown-item" data-value="random">
                                        <i class="fas fa-random"></i>
                                        <div class="item-content">
                                            <span class="item-title">Random</span>
                                            <span class="item-description">Shuffle cards randomly</span>
                                        </div>
                                    </div>
                                    <div class="dropdown-item" data-value="difficult">
                                        <i class="fas fa-brain"></i>
                                        <div class="item-content">
                                            <span class="item-title">Difficult First</span>
                                            <span class="item-description">Start with harder cards</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="control-buttons">
                            <button class="modern-control-btn" id="auto-play-btn" title="Auto-play">
                                <i class="fas fa-play"></i>
                                <span>Auto-play</span>
                            </button>
                            <button class="modern-control-btn danger" id="close-session-btn" title="End Session">
                                <i class="fas fa-times"></i>
                                <span>End Session</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="flashcard-area">
                    <div class="flashcard" id="current-flashcard">
                        <div class="flashcard-inner">
                            <div class="flashcard-front">
                                <div class="card-content">
                                    <div class="card-question" id="card-question"></div>
                                    <div class="card-hint">Tap to reveal answer</div>
                                </div>
                            </div>
                            <div class="flashcard-back">
                                <div class="card-content">
                                    <div class="card-answer" id="card-answer"></div>
                                    <div class="card-actions">
                                        <button class="action-btn correct" id="mark-correct">
                                            <i class="fas fa-check"></i>
                                            <span>Correct</span>
                                        </button>
                                        <button class="action-btn incorrect" id="mark-incorrect">
                                            <i class="fas fa-times"></i>
                                            <span>Incorrect</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="session-navigation">
                    <button class="nav-btn" id="prev-card" disabled>
                        <i class="fas fa-chevron-left"></i>
                        Previous
                    </button>
                    <button class="nav-btn flip-btn" id="flip-card">
                        <i class="fas fa-sync-alt"></i>
                        Flip Card
                    </button>
                    <button class="nav-btn" id="next-card">
                        Next
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <div class="session-stats">
                    <div class="stat-item">
                        <span class="stat-label">Correct</span>
                        <span class="stat-value correct" id="correct-count">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Incorrect</span>
                        <span class="stat-value incorrect" id="incorrect-count">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Accuracy</span>
                        <span class="stat-value" id="accuracy">0%</span>
                    </div>
                </div>
            </div>
        `;

        this.setupSessionEventListeners();
        container.style.display = 'block';
    }

    setupSessionEventListeners() {
        // Card flip
        const flipBtn = document.getElementById('flip-card');
        const flashcard = document.getElementById('current-flashcard');
        
        if (flipBtn && flashcard) {
            flipBtn.addEventListener('click', () => this.flipCard());
            flashcard.addEventListener('click', () => this.flipCard());
        }

        // Navigation
        const prevBtn = document.getElementById('prev-card');
        const nextBtn = document.getElementById('next-card');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousCard());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextCard());

        // Answer buttons
        const correctBtn = document.getElementById('mark-correct');
        const incorrectBtn = document.getElementById('mark-incorrect');
        
        if (correctBtn) correctBtn.addEventListener('click', () => this.markAnswer(true));
        if (incorrectBtn) incorrectBtn.addEventListener('click', () => this.markAnswer(false));

        // Study mode selector (modern dropdown)
        const studyModeDropdown = document.getElementById('study-mode-dropdown');
        const studyModeTrigger = document.getElementById('study-mode-trigger');
        const studyModeMenu = document.getElementById('study-mode-menu');
        
        if (studyModeDropdown && studyModeTrigger && studyModeMenu) {
            // Toggle dropdown
            studyModeTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                studyModeDropdown.classList.toggle('open');
            });

            // Handle dropdown items
            studyModeMenu.addEventListener('click', (e) => {
                const item = e.target.closest('.dropdown-item');
                if (item) {
                    const value = item.dataset.value;
                    const title = item.querySelector('.item-title').textContent;
                    
                    // Update dropdown display
                    document.getElementById('study-mode-text').textContent = title;
                    studyModeDropdown.classList.remove('open');
                    
                    // Update all items' active state
                    studyModeMenu.querySelectorAll('.dropdown-item').forEach(el => {
                        el.classList.remove('active');
                    });
                    item.classList.add('active');
                    
                    // Change study mode
                    this.changeStudyMode(value);
                }
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!studyModeDropdown.contains(e.target)) {
                    studyModeDropdown.classList.remove('open');
                }
            });

            // Set initial active item
            const initialItem = studyModeMenu.querySelector(`[data-value="${this.studyMode}"]`);
            if (initialItem) {
                initialItem.classList.add('active');
                document.getElementById('study-mode-text').textContent = initialItem.querySelector('.item-title').textContent;
            }
        }

        // Auto-play button
        const autoPlayBtn = document.getElementById('auto-play-btn');
        if (autoPlayBtn) {
            autoPlayBtn.addEventListener('click', () => this.toggleAutoPlay());
        }

        // Close session
        const closeBtn = document.getElementById('close-session-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.endSession());
        }
    }

    showCurrentCard() {
        if (!this.currentSession || this.currentCardIndex >= this.currentSession.flashcards.length) {
            this.endSession();
            return;
        }

        const card = this.currentSession.flashcards[this.currentCardIndex];
        const questionEl = document.getElementById('card-question');
        const answerEl = document.getElementById('card-answer');

        if (questionEl) questionEl.textContent = card.question;
        if (answerEl) answerEl.textContent = card.answer;

        // Reset card state
        this.isFlipped = false;
        const flashcard = document.getElementById('current-flashcard');
        if (flashcard) {
            flashcard.classList.remove('flipped');
        }

        this.updateProgress();
        this.updateNavigationButtons();
    }

    flipCard() {
        const flashcard = document.getElementById('current-flashcard');
        if (flashcard) {
            this.isFlipped = !this.isFlipped;
            flashcard.classList.toggle('flipped');
        }
    }

    markAnswer(isCorrect) {
        const currentCard = this.currentSession.flashcards[this.currentCardIndex];
        this.userAnswers.set(currentCard.id, isCorrect);

        if (isCorrect) {
            this.sessionStats.correct++;
            if (window.app.contentParser) {
                window.app.contentParser.updateFlashcardDifficulty(currentCard.id, true);
            }
        } else {
            this.sessionStats.incorrect++;
            if (window.app.contentParser) {
                window.app.contentParser.updateFlashcardDifficulty(currentCard.id, false);
            }
        }

        this.updateSessionStats();
        
        // Award XP
        if (window.app) {
            window.app.awardXP(isCorrect ? 3 : 1, 'flashcard_answer');
        }

        // Auto-advance to next card after a short delay
        setTimeout(() => {
            this.nextCard();
        }, 1000);
    }

    nextCard() {
        if (this.currentCardIndex < this.currentSession.flashcards.length - 1) {
            this.currentCardIndex++;
            this.showCurrentCard();
        } else {
            this.endSession();
        }
    }

    previousCard() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.showCurrentCard();
        }
    }

    updateProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        const progress = ((this.currentCardIndex + 1) / this.currentSession.totalCards) * 100;
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${this.currentCardIndex + 1} / ${this.currentSession.totalCards}`;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-card');
        const nextBtn = document.getElementById('next-card');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentCardIndex === 0;
        }
        
        if (nextBtn) {
            const isLastCard = this.currentCardIndex === this.currentSession.flashcards.length - 1;
            nextBtn.textContent = isLastCard ? 'Finish' : 'Next';
        }
    }

    updateSessionStats() {
        const correctEl = document.getElementById('correct-count');
        const incorrectEl = document.getElementById('incorrect-count');
        const accuracyEl = document.getElementById('accuracy');
        
        if (correctEl) correctEl.textContent = this.sessionStats.correct;
        if (incorrectEl) incorrectEl.textContent = this.sessionStats.incorrect;
        
        const total = this.sessionStats.correct + this.sessionStats.incorrect;
        const accuracy = total > 0 ? Math.round((this.sessionStats.correct / total) * 100) : 0;
        
        if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
    }

    changeStudyMode(newMode) {
        this.studyMode = newMode;
        // Restart session with new mode
        if (this.currentSession) {
            const certId = this.currentSession.certId;
            this.startSession(certId);
        }
    }

    toggleAutoPlay() {
        const autoPlayBtn = document.getElementById('auto-play-btn');
        
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
            if (autoPlayBtn) {
                autoPlayBtn.innerHTML = '<i class="fas fa-play"></i><span>Auto-play</span>';
                autoPlayBtn.classList.remove('playing');
            }
        } else {
            this.autoPlayInterval = setInterval(() => {
                if (!this.isFlipped) {
                    this.flipCard();
                } else {
                    this.nextCard();
                }
            }, this.autoPlaySpeed);
            
            if (autoPlayBtn) {
                autoPlayBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
                autoPlayBtn.classList.add('playing');
            }
        }
    }

    endSession() {
        // Clear auto-play
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }

        // Calculate final stats
        this.sessionStats.timeSpent = Date.now() - this.sessionStats.startTime;
        
        this.showSessionSummary();
        
        // Award completion XP
        if (window.app) {
            window.app.awardXP(10, 'session_complete');
        }
    }

    showSessionSummary() {
        const total = this.sessionStats.correct + this.sessionStats.incorrect;
        const accuracy = total > 0 ? Math.round((this.sessionStats.correct / total) * 100) : 0;
        const timeInMinutes = Math.round(this.sessionStats.timeSpent / 60000);

        const summaryModal = document.createElement('div');
        summaryModal.className = 'modal session-summary-modal';
        summaryModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Session Complete! 🎉</h2>
                </div>
                <div class="modal-body">
                    <div class="summary-stats">
                        <div class="summary-stat">
                            <div class="stat-number">${this.sessionStats.correct}</div>
                            <div class="stat-label">Correct Answers</div>
                        </div>
                        <div class="summary-stat">
                            <div class="stat-number">${accuracy}%</div>
                            <div class="stat-label">Accuracy</div>
                        </div>
                        <div class="summary-stat">
                            <div class="stat-number">${timeInMinutes}</div>
                            <div class="stat-label">Minutes Studied</div>
                        </div>
                    </div>
                    <div class="summary-message">
                        ${this.getEncouragementMessage(accuracy)}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Continue</button>
                    <button class="btn btn-outline" onclick="flashcardManager.startSession('${this.currentSession.certId}')">Study Again</button>
                </div>
            </div>
        `;

        document.body.appendChild(summaryModal);
        summaryModal.style.display = 'flex';

        // Hide flashcard interface
        const container = document.getElementById('flashcard-container');
        if (container) container.style.display = 'none';
    }

    getEncouragementMessage(accuracy) {
        if (accuracy >= 90) return "Excellent! You're mastering this material! 🌟";
        if (accuracy >= 75) return "Great job! You're making solid progress! 👍";
        if (accuracy >= 60) return "Good work! Keep practicing to improve! 📚";
        return "Keep studying! Every attempt helps you learn! 💪";
    }

    showInstructions() {
        const instructions = document.createElement('div');
        instructions.className = 'instruction-overlay';
        instructions.innerHTML = `
            <div class="instruction-content">
                <h3>How to use Flashcards</h3>
                <div class="instruction-list">
                    <div class="instruction-item">
                        <i class="fas fa-mouse-pointer"></i>
                        <span>Click card or "Flip" to see answer</span>
                    </div>
                    <div class="instruction-item">
                        <i class="fas fa-mobile-alt"></i>
                        <span>Swipe left (❌) or right (✅) to answer</span>
                    </div>
                    <div class="instruction-item">
                        <i class="fas fa-keyboard"></i>
                        <span>Use Space to flip, Arrow keys to navigate</span>
                    </div>
                    <div class="instruction-item">
                        <i class="fas fa-play"></i>
                        <span>Use auto-play for hands-free study</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.remove()">Got it!</button>
            </div>
        `;
        
        document.body.appendChild(instructions);
        
        setTimeout(() => {
            if (instructions.parentElement) {
                instructions.remove();
            }
        }, 8000);
    }

    // Touch/Swipe gesture handlers
    handleTouchStart(e) {
        if (!this.currentSession) return;
        
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        // Prevent default scrolling during swipe
        if (Math.abs(e.touches[0].clientX - this.touchStartX) > 50) {
            e.preventDefault();
        }
    }

    handleTouchEnd(e) {
        if (!this.currentSession) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;
        
        // Only process horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
            if (this.isFlipped) {
                // Answer the card based on swipe direction
                if (deltaX > 0) {
                    this.markAnswer(true); // Swipe right = correct
                } else {
                    this.markAnswer(false); // Swipe left = incorrect
                }
            } else {
                // Flip the card on any significant horizontal swipe
                this.flipCard();
            }
        }
    }

    // Keyboard navigation
    handleKeypress(e) {
        if (!this.currentSession) return;
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.flipCard();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (this.isFlipped) {
                    this.markAnswer(false);
                } else {
                    this.previousCard();
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (this.isFlipped) {
                    this.markAnswer(true);
                } else {
                    this.nextCard();
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.endSession();
                break;
        }
    }
}

// Initialize flashcard manager
window.flashcardManager = new FlashcardManager();
