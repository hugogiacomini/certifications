// Quiz Manager
class QuizManager {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.selectedAnswers = [];
        this.quizType = 'quick'; // quick, timed, mock
        this.startTime = null;
        this.timeLimit = null; // in minutes
        this.timer = null;
        this.init();
    }

    init() {
        this.loadQuestionBank();
        this.setupQuizEventListeners();
    }

    loadQuestionBank() {
        // Comprehensive question bank for all certifications
        this.questionBank = {
            'aws-saa': [
                {
                    question: 'A company needs to store files that are accessed frequently for the first 30 days, then occasionally for the next 90 days, and rarely after that. Which S3 storage strategy would be most cost-effective?',
                    options: [
                        'Use S3 Standard for all files',
                        'Use S3 Standard, then transition to S3 IA after 30 days, then to Glacier after 120 days',
                        'Use S3 One Zone-IA for all files',
                        'Use S3 Glacier for all files'
                    ],
                    correct: 1,
                    explanation: 'S3 Intelligent Tiering or lifecycle policies to transition from Standard → IA → Glacier provides the most cost-effective solution for this access pattern.'
                },
                {
                    question: 'Which AWS service would you use to implement a serverless data processing pipeline that triggers when files are uploaded to S3?',
                    options: [
                        'AWS Glue',
                        'Amazon EMR',
                        'AWS Lambda with S3 event notifications',
                        'Amazon Kinesis Data Firehose'
                    ],
                    correct: 2,
                    explanation: 'AWS Lambda with S3 event notifications provides a serverless, event-driven approach that scales automatically and only charges for actual execution time.'
                },
                {
                    question: 'A web application needs to scale to handle traffic spikes. Which combination provides the best auto-scaling solution?',
                    options: [
                        'Application Load Balancer + Auto Scaling Groups + CloudWatch metrics',
                        'Classic Load Balancer + Manual scaling',
                        'Network Load Balancer + Fixed instances',
                        'CloudFront + Single EC2 instance'
                    ],
                    correct: 0,
                    explanation: 'ALB distributes traffic, Auto Scaling Groups adjust capacity based on demand, and CloudWatch provides metrics for scaling decisions.'
                },
                {
                    question: 'What is the primary difference between Security Groups and Network ACLs?',
                    options: [
                        'Security Groups are stateless, NACLs are stateful',
                        'Security Groups are stateful, NACLs are stateless',
                        'Both are stateful',
                        'Both are stateless'
                    ],
                    correct: 1,
                    explanation: 'Security Groups are stateful (return traffic automatically allowed), while NACLs are stateless (explicit rules needed for both directions).'
                },
                {
                    question: 'Which database option is best for a read-heavy workload requiring sub-millisecond latency?',
                    options: [
                        'Amazon RDS MySQL',
                        'Amazon DynamoDB with DAX',
                        'Amazon Redshift',
                        'Amazon Aurora'
                    ],
                    correct: 1,
                    explanation: 'DynamoDB with DAX (DynamoDB Accelerator) provides microsecond latency for read-heavy workloads through in-memory caching.'
                }
            ],
            'aws-dea': [
                {
                    question: 'Which AWS service is most appropriate for real-time streaming data ingestion and processing?',
                    options: [
                        'Amazon S3',
                        'Amazon Kinesis Data Streams',
                        'AWS Glue',
                        'Amazon Athena'
                    ],
                    correct: 1,
                    explanation: 'Amazon Kinesis Data Streams is designed for real-time streaming data ingestion with low latency and high throughput.'
                },
                {
                    question: 'What is the most cost-effective way to run SQL queries on data stored in Amazon S3?',
                    options: [
                        'Load data into Amazon RDS and query',
                        'Use Amazon Athena with partitioned data',
                        'Launch EMR cluster for each query',
                        'Use Amazon Redshift for all queries'
                    ],
                    correct: 1,
                    explanation: 'Amazon Athena is serverless and charges only for data scanned. Partitioning reduces the amount of data scanned, making it very cost-effective.'
                },
                {
                    question: 'Which AWS Glue component is responsible for discovering and cataloging data?',
                    options: [
                        'Glue Jobs',
                        'Glue Crawlers',
                        'Glue Development Endpoints',
                        'Glue Triggers'
                    ],
                    correct: 1,
                    explanation: 'Glue Crawlers automatically discover data schema and populate the Glue Data Catalog with metadata about data sources.'
                },
                {
                    question: 'For a data lake architecture, what is the recommended approach for organizing data?',
                    options: [
                        'Store all data in a single S3 bucket',
                        'Use separate buckets for each data source',
                        'Implement a medallion architecture (Bronze/Silver/Gold)',
                        'Store only processed data'
                    ],
                    correct: 2,
                    explanation: 'Medallion architecture organizes data into Bronze (raw), Silver (cleaned), and Gold (aggregated) layers for progressive data refinement.'
                },
                {
                    question: 'Which service provides the most efficient way to migrate large datasets to AWS?',
                    options: [
                        'Direct Connect',
                        'AWS DataSync',
                        'AWS Snowball family',
                        'AWS Transfer Family'
                    ],
                    correct: 2,
                    explanation: 'AWS Snowball family (Snowball, Snowball Edge, Snowmobile) is designed for large-scale data migration when network transfer is impractical.'
                }
            ],
            'databricks-dea': [
                {
                    question: 'What is the correct hierarchy in Unity Catalog?',
                    options: [
                        'Workspace → Catalog → Schema → Table',
                        'Metastore → Catalog → Schema → Table',
                        'Catalog → Metastore → Schema → Table',
                        'Schema → Catalog → Metastore → Table'
                    ],
                    correct: 1,
                    explanation: 'Unity Catalog hierarchy: Metastore (top) → Catalog → Schema → Table/View (bottom). This provides multi-level organization and governance.'
                },
                {
                    question: 'Which statement about Delta Lake ACID transactions is correct?',
                    options: [
                        'Delta Lake only supports read operations',
                        'Delta Lake provides ACID guarantees for both batch and streaming operations',
                        'ACID transactions are only available in Databricks SQL',
                        'Delta Lake requires additional configuration for ACID support'
                    ],
                    correct: 1,
                    explanation: 'Delta Lake provides ACID (Atomicity, Consistency, Isolation, Durability) guarantees for both batch and streaming operations out of the box.'
                },
                {
                    question: 'What is Auto Loader primarily used for?',
                    options: [
                        'Automatically starting clusters',
                        'Incrementally processing new files in cloud storage',
                        'Automatically optimizing Delta tables',
                        'Loading data into memory'
                    ],
                    correct: 1,
                    explanation: 'Auto Loader incrementally and efficiently processes new data files as they arrive in cloud storage, perfect for streaming ETL pipelines.'
                },
                {
                    question: 'In the medallion architecture, what type of data is stored in the Bronze layer?',
                    options: [
                        'Highly aggregated business metrics',
                        'Cleaned and validated data',
                        'Raw, unprocessed data in its original format',
                        'Machine learning features'
                    ],
                    correct: 2,
                    explanation: 'Bronze layer contains raw, unprocessed data in its original format. Silver has cleaned data, Gold has business-ready aggregated data.'
                },
                {
                    question: 'Which optimization technique should be used for Delta tables with frequent queries on specific columns?',
                    options: [
                        'VACUUM',
                        'Z-ORDER BY',
                        'OPTIMIZE',
                        'DESCRIBE DETAIL'
                    ],
                    correct: 1,
                    explanation: 'Z-ORDER BY co-locates related information in the same files, improving query performance for frequently queried columns.'
                }
            ],
            'psm-1': [
                {
                    question: 'What is the maximum duration for a Sprint in Scrum?',
                    options: [
                        '2 weeks',
                        '1 month',
                        '6 weeks',
                        'As long as needed to complete all planned work'
                    ],
                    correct: 1,
                    explanation: 'The Sprint length is fixed at one month or less. This creates a regular rhythm and ensures frequent inspection and adaptation.'
                },
                {
                    question: 'Who is responsible for managing the Product Backlog?',
                    options: [
                        'Scrum Master',
                        'Development Team',
                        'Product Owner',
                        'Project Manager'
                    ],
                    correct: 2,
                    explanation: 'The Product Owner is solely responsible for managing the Product Backlog, including ordering items and ensuring it is visible and understood.'
                },
                {
                    question: 'What happens if the Development Team cannot complete all Sprint Backlog items?',
                    options: [
                        'The Sprint is extended',
                        'Incomplete items return to the Product Backlog',
                        'The team works overtime to finish',
                        'The Scrum Master completes the work'
                    ],
                    correct: 1,
                    explanation: 'Incomplete Sprint Backlog items return to the Product Backlog for the Product Owner to re-prioritize in future Sprints.'
                },
                {
                    question: 'What is the primary purpose of the Daily Scrum?',
                    options: [
                        'Status reporting to management',
                        'Planning the next day\'s work',
                        'Inspecting progress toward the Sprint Goal',
                        'Resolving impediments'
                    ],
                    correct: 2,
                    explanation: 'The Daily Scrum is for the Development Team to inspect progress toward the Sprint Goal and adapt the plan for the next 24 hours.'
                },
                {
                    question: 'When does the next Sprint begin?',
                    options: [
                        'After Sprint Planning is completed',
                        'Immediately after the previous Sprint ends',
                        'After the Sprint Retrospective',
                        'One week after the previous Sprint'
                    ],
                    correct: 1,
                    explanation: 'Sprints are consecutive with no gaps. The next Sprint begins immediately after the previous Sprint ends.'
                }
            ]
        };
    }

    setupQuizEventListeners() {
        // Close modal event
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close')) {
                this.closeQuizModal();
            }
        });
    }

    showCertificationSelector(quizType) {
        this.quizType = quizType;
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'quiz-selector-modal';
        modal.style.display = 'block';
        
        const typeLabels = {
            'quick': 'Quick Quiz (10 questions)',
            'timed': 'Timed Practice (25 questions, 30 minutes)',
            'mock': 'Mock Exam (Full exam simulation)'
        };

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-question-circle"></i> ${typeLabels[quizType]}</h2>
                    <span class="close" onclick="quizManager.closeQuizModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <p>Select a certification to practice:</p>
                    </div>
                    <div class="cert-selector-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                        ${this.getCertificationButtons()}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    getCertificationButtons() {
        const certifications = [
            { id: 'aws-saa', name: 'AWS Solutions Architect', icon: 'fa-aws', color: 'aws' },
            { id: 'aws-dea', name: 'AWS Data Engineer', icon: 'fa-aws', color: 'aws' },
            { id: 'databricks-dea', name: 'Databricks Data Engineer Associate', icon: 'fa-database', color: 'databricks' },
            { id: 'psm-1', name: 'Professional Scrum Master I', icon: 'fa-sync-alt', color: 'agile' }
        ];

        return certifications.map(cert => `
            <button class="cert-select-btn" onclick="quizManager.startQuiz('${cert.id}', '${this.quizType}')" 
                    style="padding: 1.5rem; border: 2px solid var(--gray-300); border-radius: var(--border-radius-lg); 
                           background: white; cursor: pointer; transition: var(--transition-fast); text-align: center;">
                <i class="fas ${cert.icon} cert-${cert.color}" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                <strong>${cert.name}</strong>
                <div style="font-size: 0.9rem; color: var(--gray-600); margin-top: 0.5rem;">
                    ${this.questionBank[cert.id]?.length || 0} questions available
                </div>
            </button>
        `).join('');
    }

    startQuiz(certId, quizType, customQuestionCount = null) {
        const questions = this.questionBank[certId];
        if (!questions || questions.length === 0) {
            alert('No questions available for this certification yet.');
            return;
        }

        this.quizType = quizType;
        
        // Determine question count and time limit
        let questionCount, timeLimit;
        switch (quizType) {
            case 'quick':
                questionCount = customQuestionCount || Math.min(10, questions.length);
                timeLimit = null;
                break;
            case 'timed':
                questionCount = customQuestionCount || Math.min(25, questions.length);
                timeLimit = 30; // 30 minutes
                break;
            case 'mock':
                questionCount = customQuestionCount || questions.length;
                timeLimit = this.getMockExamDuration(certId);
                break;
        }

        // Shuffle and select questions
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        this.questions = shuffled.slice(0, questionCount);
        
        // Initialize quiz state
        this.currentQuestionIndex = 0;
        this.selectedAnswers = new Array(this.questions.length).fill(null);
        this.startTime = new Date();
        this.timeLimit = timeLimit;
        
        // Close selector modal and show quiz modal
        this.closeQuizModal();
        this.showQuizModal();
        this.loadQuestion();
        
        if (timeLimit) {
            this.startTimer();
        }
    }

    getMockExamDuration(certId) {
        const durations = {
            'aws-saa': 130,
            'aws-dea': 130,
            'databricks-dea': 90,
            'databricks-dep': 120,
            'psm-1': 60,
            'psm-2': 90
        };
        return durations[certId] || 90;
    }

    showQuizModal() {
        const modal = document.getElementById('quiz-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeQuizModal() {
        // Close any quiz-related modals
        const modals = ['quiz-modal', 'quiz-selector-modal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.remove();
            }
        });
        
        // Clear timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    loadQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.finishQuiz();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        
        // Update question display
        document.getElementById('quiz-question').textContent = question.question;
        document.getElementById('quiz-question-count').textContent = 
            `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;

        // Update progress bar
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        document.getElementById('quiz-progress').style.width = `${progress}%`;

        // Load options
        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = question.options.map((option, index) => `
            <div class="option" onclick="quizManager.selectOption(${index})" data-index="${index}">
                ${String.fromCharCode(65 + index)}. ${option}
            </div>
        `).join('');

        // Restore previous selection if any
        if (this.selectedAnswers[this.currentQuestionIndex] !== null) {
            this.selectOption(this.selectedAnswers[this.currentQuestionIndex], false);
        }

        // Update navigation buttons
        document.getElementById('quiz-prev').disabled = this.currentQuestionIndex === 0;
        document.getElementById('quiz-next').disabled = this.selectedAnswers[this.currentQuestionIndex] === null;
        
        // Show/hide submit button
        const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;
        document.getElementById('quiz-next').style.display = isLastQuestion ? 'none' : 'inline-flex';
        document.getElementById('quiz-submit').style.display = isLastQuestion ? 'inline-flex' : 'none';
        document.getElementById('quiz-submit').disabled = this.selectedAnswers[this.currentQuestionIndex] === null;
    }

    selectOption(index, updateAnswer = true) {
        // Clear previous selection
        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        
        // Select new option
        const selectedOption = document.querySelector(`[data-index="${index}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }

        if (updateAnswer) {
            this.selectedAnswers[this.currentQuestionIndex] = index;
        }

        // Enable navigation
        document.getElementById('quiz-next').disabled = false;
        document.getElementById('quiz-submit').disabled = false;
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.loadQuestion();
        }
    }

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.loadQuestion();
        }
    }

    startTimer() {
        if (!this.timeLimit) return;

        let remainingTime = this.timeLimit * 60; // Convert to seconds
        
        this.timer = setInterval(() => {
            remainingTime--;
            
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            
            document.getElementById('quiz-timer').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;

            // Change color when time is running low
            const timerElement = document.getElementById('quiz-timer');
            if (remainingTime < 300) { // Less than 5 minutes
                timerElement.style.color = 'var(--danger-color)';
            } else if (remainingTime < 600) { // Less than 10 minutes
                timerElement.style.color = 'var(--warning-color)';
            }

            if (remainingTime <= 0) {
                clearInterval(this.timer);
                this.finishQuiz(true); // true indicates time expired
            }
        }, 1000);
    }

    submitQuiz() {
        // Check if all questions are answered
        const unanswered = this.selectedAnswers.indexOf(null);
        if (unanswered !== -1) {
            const proceed = confirm(`You have ${this.selectedAnswers.filter(a => a === null).length} unanswered questions. Submit anyway?`);
            if (!proceed) return;
        }

        this.finishQuiz();
    }

    finishQuiz(timeExpired = false) {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Calculate results
        const results = this.calculateResults();
        
        // Show results modal
        this.showResultsModal(results, timeExpired);
        
        // Update user progress
        this.updateUserProgress(results);
    }

    calculateResults() {
        let correct = 0;
        let answered = 0;
        const detailedResults = [];

        this.questions.forEach((question, index) => {
            const userAnswer = this.selectedAnswers[index];
            const isCorrect = userAnswer === question.correct;
            const wasAnswered = userAnswer !== null;
            
            if (wasAnswered) {
                answered++;
                if (isCorrect) correct++;
            }

            detailedResults.push({
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.correct,
                isCorrect,
                wasAnswered,
                explanation: question.explanation,
                options: question.options
            });
        });

        const score = answered > 0 ? Math.round((correct / answered) * 100) : 0;
        const totalScore = Math.round((correct / this.questions.length) * 100);

        return {
            correct,
            answered,
            total: this.questions.length,
            score,
            totalScore,
            detailedResults,
            timeTaken: this.startTime ? Math.round((new Date() - this.startTime) / 1000 / 60) : 0
        };
    }

    showResultsModal(results, timeExpired = false) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const getScoreColor = (score) => {
            if (score >= 80) return 'var(--success-color)';
            if (score >= 70) return 'var(--warning-color)';
            return 'var(--danger-color)';
        };

        const getScoreMessage = (score) => {
            if (score >= 90) return 'Outstanding! 🏆';
            if (score >= 80) return 'Great job! 🎉';
            if (score >= 70) return 'Good work! 👍';
            return 'Keep studying! 📚';
        };

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-line"></i> Quiz Results ${timeExpired ? '(Time Expired)' : ''}</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="font-size: 4rem; color: ${getScoreColor(results.totalScore)}; margin-bottom: 1rem;">
                            ${results.totalScore}%
                        </div>
                        <h3 style="margin-bottom: 1rem;">${getScoreMessage(results.totalScore)}</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin: 2rem 0;">
                            <div style="padding: 1rem; background: var(--success-color); color: white; border-radius: var(--border-radius);">
                                <div style="font-size: 1.5rem; font-weight: bold;">${results.correct}</div>
                                <div>Correct</div>
                            </div>
                            <div style="padding: 1rem; background: var(--danger-color); color: white; border-radius: var(--border-radius);">
                                <div style="font-size: 1.5rem; font-weight: bold;">${results.total - results.correct}</div>
                                <div>Incorrect</div>
                            </div>
                            <div style="padding: 1rem; background: var(--primary-color); color: white; border-radius: var(--border-radius);">
                                <div style="font-size: 1.5rem; font-weight: bold;">${results.timeTaken}m</div>
                                <div>Time Taken</div>
                            </div>
                            <div style="padding: 1rem; background: var(--secondary-color); color: white; border-radius: var(--border-radius);">
                                <div style="font-size: 1.5rem; font-weight: bold;">${this.quizType}</div>
                                <div>Quiz Type</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <h4>Review Questions:</h4>
                        <div style="max-height: 400px; overflow-y: auto; margin-top: 1rem;">
                            ${this.generateQuestionReview(results.detailedResults)}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="this.closest('.modal').remove();">
                            <i class="fas fa-check"></i> Done
                        </button>
                        <button class="btn btn-outline" onclick="location.reload();">
                            <i class="fas fa-redo"></i> Take Another Quiz
                        </button>
                        <button class="btn btn-secondary" onclick="document.getElementById('flashcards').scrollIntoView({behavior: 'smooth'}); this.closest('.modal').remove();">
                            <i class="fas fa-cards-blank"></i> Study Flashcards
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    generateQuestionReview(detailedResults) {
        return detailedResults.map((result, index) => {
            const userAnswerText = result.wasAnswered ? result.options[result.userAnswer] : 'Not answered';
            const correctAnswerText = result.options[result.correctAnswer];
            
            return `
                <div style="border: 1px solid var(--gray-300); border-radius: var(--border-radius); padding: 1rem; margin-bottom: 1rem; ${result.isCorrect ? 'border-color: var(--success-color);' : 'border-color: var(--danger-color);'}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <strong>Question ${index + 1}</strong>
                        <span style="color: ${result.isCorrect ? 'var(--success-color)' : 'var(--danger-color)'};">
                            <i class="fas fa-${result.isCorrect ? 'check' : 'times'}"></i>
                            ${result.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                    </div>
                    <p style="margin-bottom: 1rem;">${result.question}</p>
                    <div style="margin-bottom: 1rem;">
                        <div><strong>Your answer:</strong> <span style="color: ${result.isCorrect ? 'var(--success-color)' : 'var(--danger-color)'};">${userAnswerText}</span></div>
                        ${!result.isCorrect ? `<div><strong>Correct answer:</strong> <span style="color: var(--success-color);">${correctAnswerText}</span></div>` : ''}
                    </div>
                    <div style="background: var(--gray-100); padding: 1rem; border-radius: var(--border-radius-sm);">
                        <strong>Explanation:</strong> ${result.explanation}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateUserProgress(results) {
        // Update local storage with quiz results
        const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        quizHistory.push({
            date: new Date().toISOString(),
            type: this.quizType,
            score: results.totalScore,
            correct: results.correct,
            total: results.total,
            timeTaken: results.timeTaken
        });
        
        // Keep only last 50 quiz results
        if (quizHistory.length > 50) {
            quizHistory.splice(0, quizHistory.length - 50);
        }
        
        localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
        
        // Update streak if score is good
        if (results.totalScore >= 70) {
            this.updateStudyStreak();
        }
    }

    updateStudyStreak() {
        const today = new Date().toDateString();
        const lastStudy = localStorage.getItem('lastStudyDate');
        
        if (lastStudy !== today) {
            let currentStreak = parseInt(localStorage.getItem('studyStreak') || '0');
            if (lastStudy === new Date(Date.now() - 86400000).toDateString()) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
            
            localStorage.setItem('studyStreak', currentStreak);
            localStorage.setItem('lastStudyDate', today);
            
            // Update UI
            const streakElement = document.getElementById('streak-days');
            if (streakElement) {
                streakElement.textContent = currentStreak;
            }
        }
    }
}

// Global functions
window.selectOption = function(index) {
    window.quizManager.selectOption(index);
};

window.nextQuestion = function() {
    window.quizManager.nextQuestion();
};

window.prevQuestion = function() {
    window.quizManager.prevQuestion();
};

window.submitQuiz = function() {
    window.quizManager.submitQuiz();
};

window.closeQuizModal = function() {
    window.quizManager.closeQuizModal();
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quizManager = new QuizManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizManager;
}
