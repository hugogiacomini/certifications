// Progress Manager
class ProgressManager {
    constructor() {
        this.chart = null;
        this.init();
    }

    init() {
        this.setupProgressChart();
        this.updateProgressDisplay();
        this.setupStudyPlan();
    }

    setupProgressChart() {
        const canvas = document.getElementById('progressChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Get quiz history for chart
        const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        const last30Days = this.getLast30DaysData(quizHistory);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last30Days.map(d => d.date),
                datasets: [
                    {
                        label: 'Quiz Scores',
                        data: last30Days.map(d => d.averageScore),
                        borderColor: 'rgb(99, 102, 241)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: 'rgb(99, 102, 241)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                    },
                    {
                        label: 'Study Sessions',
                        data: last30Days.map(d => d.sessionCount * 10), // Scale for visibility
                        borderColor: 'rgb(6, 182, 212)',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: 'rgb(6, 182, 212)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Learning Progress (Last 30 Days)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Quiz Score (%)'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Study Sessions'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        max: 50
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        });
    }

    getLast30DaysData(quizHistory) {
        const last30Days = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Get quiz data for this day
            const dayQuizzes = quizHistory.filter(quiz => 
                quiz.date.split('T')[0] === dateStr
            );
            
            const averageScore = dayQuizzes.length > 0 
                ? dayQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / dayQuizzes.length
                : null;
            
            last30Days.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                averageScore,
                sessionCount: dayQuizzes.length
            });
        }
        
        return last30Days;
    }

    updateProgressDisplay() {
        this.updateStats();
        this.updateBadges();
        this.updateStreak();
        this.updateCertificationProgress();
    }

    updateStats() {
        const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        const completedFlashcards = parseInt(localStorage.getItem('completedFlashcards') || '0');
        
        // Update stat counters with actual data
        const stats = {
            quizzes: quizHistory.length,
            averageScore: quizHistory.length > 0 
                ? Math.round(quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / quizHistory.length)
                : 0,
            flashcards: completedFlashcards,
            streak: parseInt(localStorage.getItem('studyStreak') || '0')
        };

        // Animate counters if elements exist
        this.animateCounter('total-quizzes', stats.quizzes);
        this.animateCounter('average-score', stats.averageScore);
        this.animateCounter('total-flashcards', stats.flashcards);
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 1000;
        const increment = targetValue / (duration / 16);
        let current = startValue;

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                element.textContent = targetValue;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    updateBadges() {
        const badgesContainer = document.getElementById('badges-grid');
        if (!badgesContainer) return;

        const badges = this.calculateBadges();
        
        badgesContainer.innerHTML = badges.map(badge => `
            <div class="badge ${badge.type}" title="${badge.description}">
                <i class="fas ${badge.icon}"></i>
            </div>
        `).join('');
    }

    calculateBadges() {
        const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        const streak = parseInt(localStorage.getItem('studyStreak') || '0');
        const completedFlashcards = parseInt(localStorage.getItem('completedFlashcards') || '0');
        
        const badges = [];

        // Streak badges
        if (streak >= 30) {
            badges.push({ type: 'streak', icon: 'fa-fire', description: '30+ day study streak!' });
        } else if (streak >= 7) {
            badges.push({ type: 'streak', icon: 'fa-fire', description: '7+ day study streak!' });
        } else if (streak >= 3) {
            badges.push({ type: 'streak', icon: 'fa-fire', description: '3+ day study streak!' });
        }

        // Quiz badges
        if (quizHistory.length >= 100) {
            badges.push({ type: 'aws', icon: 'fa-trophy', description: '100+ quizzes completed!' });
        } else if (quizHistory.length >= 50) {
            badges.push({ type: 'databricks', icon: 'fa-medal', description: '50+ quizzes completed!' });
        } else if (quizHistory.length >= 10) {
            badges.push({ type: 'azure', icon: 'fa-star', description: '10+ quizzes completed!' });
        }

        // Performance badges
        const recentQuizzes = quizHistory.slice(-10);
        const averageScore = recentQuizzes.length > 0 
            ? recentQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / recentQuizzes.length
            : 0;
        
        if (averageScore >= 90) {
            badges.push({ type: 'aws', icon: 'fa-crown', description: '90%+ average score!' });
        } else if (averageScore >= 80) {
            badges.push({ type: 'databricks', icon: 'fa-gem', description: '80%+ average score!' });
        }

        // Flashcard badges
        if (completedFlashcards >= 500) {
            badges.push({ type: 'azure', icon: 'fa-cards-blank', description: '500+ flashcards studied!' });
        } else if (completedFlashcards >= 100) {
            badges.push({ type: 'agile', icon: 'fa-cards-blank', description: '100+ flashcards studied!' });
        }

        return badges.slice(0, 6); // Limit to 6 badges
    }

    updateStreak() {
        const streak = parseInt(localStorage.getItem('studyStreak') || '0');
        const streakElement = document.getElementById('streak-days');
        if (streakElement) {
            streakElement.textContent = streak;
        }
    }

    updateCertificationProgress() {
        // This would track progress per certification
        const certProgress = this.calculateCertificationProgress();
        this.displayCertificationProgress(certProgress);
    }

    calculateCertificationProgress() {
        const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        const certifications = [
            { id: 'aws-saa', name: 'AWS Solutions Architect' },
            { id: 'aws-dea', name: 'AWS Data Engineer' },
            { id: 'databricks-dea', name: 'Databricks Data Engineer' },
            { id: 'psm-1', name: 'Scrum Master I' }
        ];

        return certifications.map(cert => {
            const certQuizzes = quizHistory.filter(quiz => quiz.certification === cert.id);
            const averageScore = certQuizzes.length > 0 
                ? Math.round(certQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / certQuizzes.length)
                : 0;
            
            return {
                ...cert,
                quizzesTaken: certQuizzes.length,
                averageScore,
                progress: Math.min(averageScore, 100),
                readiness: this.calculateReadiness(averageScore, certQuizzes.length)
            };
        });
    }

    calculateReadiness(averageScore, quizCount) {
        if (quizCount < 5) return 'Start studying';
        if (averageScore >= 85) return 'Exam ready!';
        if (averageScore >= 75) return 'Almost ready';
        if (averageScore >= 65) return 'Keep practicing';
        return 'More study needed';
    }

    displayCertificationProgress(certProgress) {
        // This could be displayed in a dedicated section
        // For now, we'll log it for debugging
        console.log('Certification Progress:', certProgress);
    }

    setupStudyPlan() {
        // Initialize study plan functionality
        this.loadStudyPlanOptions();
    }

    loadStudyPlanOptions() {
        const certSelect = document.getElementById('study-cert-select');
        if (!certSelect) return;

        const certifications = [
            { value: 'aws-saa', text: 'AWS Solutions Architect Associate' },
            { value: 'aws-dea', text: 'AWS Data Engineer Associate' },
            { value: 'databricks-dea', text: 'Databricks Data Engineer Associate' },
            { value: 'databricks-dep', text: 'Databricks Data Engineer Professional' },
            { value: 'psm-1', text: 'Professional Scrum Master I' },
            { value: 'psm-2', text: 'Professional Scrum Master II' }
        ];

        certSelect.innerHTML = '<option value="">Select certification...</option>' +
            certifications.map(cert => `<option value="${cert.value}">${cert.text}</option>`).join('');
    }

    generateStudyPlan() {
        const certId = document.getElementById('study-cert-select').value;
        const duration = parseInt(document.getElementById('study-duration').value);
        const dailyHours = parseInt(document.getElementById('study-hours').value);

        if (!certId) {
            alert('Please select a certification');
            return;
        }

        const plan = this.createStudyPlan(certId, duration, dailyHours);
        this.displayStudyPlan(plan);
    }

    createStudyPlan(certId, weeks, dailyHours) {
        const certInfo = {
            'aws-saa': {
                name: 'AWS Solutions Architect Associate',
                domains: [
                    'Design Secure Architectures (30%)',
                    'Design Resilient Architectures (26%)',
                    'Design High-Performing Architectures (24%)',
                    'Design Cost-Optimized Architectures (20%)'
                ]
            },
            'databricks-dea': {
                name: 'Databricks Data Engineer Associate',
                domains: [
                    'Databricks Fundamentals (25%)',
                    'SQL and Data Manipulation (20%)',
                    'Data Ingestion and ETL (25%)',
                    'Delta Lake Basics (20%)',
                    'Data Governance (10%)'
                ]
            }
        };

        const cert = certInfo[certId] || { name: 'Selected Certification', domains: ['General Study'] };
        const totalHours = weeks * 7 * dailyHours;
        const hoursPerDomain = totalHours / cert.domains.length;

        return {
            certification: cert.name,
            duration: weeks,
            dailyHours,
            totalHours,
            domains: cert.domains.map(domain => ({
                name: domain,
                allocatedHours: Math.round(hoursPerDomain),
                activities: this.generateActivitiesForDomain(domain, hoursPerDomain)
            })),
            weeklyPlan: this.generateWeeklyPlan(weeks, cert.domains, dailyHours)
        };
    }

    generateActivitiesForDomain(domain, hours) {
        const activities = [
            'Read study materials and documentation',
            'Complete hands-on labs and exercises',
            'Practice with flashcards',
            'Take domain-specific quizzes',
            'Review practice questions and explanations'
        ];

        return activities.map(activity => ({
            activity,
            estimatedHours: Math.round(hours / activities.length * 10) / 10
        }));
    }

    generateWeeklyPlan(weeks, domains, dailyHours) {
        const plan = [];
        const domainsPerWeek = Math.ceil(domains.length / weeks);

        for (let week = 1; week <= weeks; week++) {
            const startDomain = (week - 1) * domainsPerWeek;
            const endDomain = Math.min(week * domainsPerWeek, domains.length);
            const weekDomains = domains.slice(startDomain, endDomain);

            plan.push({
                week,
                focus: weekDomains,
                goals: this.generateWeeklyGoals(week, weeks, weekDomains),
                dailySchedule: this.generateDailySchedule(dailyHours)
            });
        }

        return plan;
    }

    generateWeeklyGoals(week, totalWeeks, domains) {
        if (week === 1) {
            return ['Set up study environment', 'Complete initial assessment', 'Begin foundational learning'];
        } else if (week === totalWeeks) {
            return ['Complete practice exams', 'Review weak areas', 'Final exam preparation'];
        } else {
            return [`Master ${domains.join(', ')}`, 'Complete practice questions', 'Hands-on lab exercises'];
        }
    }

    generateDailySchedule(dailyHours) {
        const schedule = [];
        const activities = ['Study theory', 'Hands-on practice', 'Quiz/Review'];
        const hoursPerActivity = dailyHours / activities.length;

        activities.forEach(activity => {
            schedule.push({
                activity,
                duration: `${Math.round(hoursPerActivity * 60)} minutes`
            });
        });

        return schedule;
    }

    displayStudyPlan(plan) {
        const resultDiv = document.getElementById('study-plan-result');
        if (!resultDiv) return;

        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="border: 1px solid var(--gray-300); border-radius: var(--border-radius-lg); padding: 2rem; background: var(--gray-100);">
                <h3 style="margin-bottom: 1.5rem; color: var(--primary-color);">
                    <i class="fas fa-calendar-alt"></i> Study Plan: ${plan.certification}
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div style="text-align: center; padding: 1rem; background: white; border-radius: var(--border-radius);">
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${plan.duration}</div>
                        <div>Weeks</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: white; border-radius: var(--border-radius);">
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--success-color);">${plan.dailyHours}</div>
                        <div>Hours/Day</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: white; border-radius: var(--border-radius);">
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--secondary-color);">${plan.totalHours}</div>
                        <div>Total Hours</div>
                    </div>
                </div>

                <h4 style="margin-bottom: 1rem;">Domain Focus Areas:</h4>
                <div style="margin-bottom: 2rem;">
                    ${plan.domains.map(domain => `
                        <div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: var(--border-radius);">
                            <strong>${domain.name}</strong>
                            <div style="font-size: 0.9rem; color: var(--gray-600);">${domain.allocatedHours} hours allocated</div>
                        </div>
                    `).join('')}
                </div>

                <h4 style="margin-bottom: 1rem;">Weekly Schedule:</h4>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${plan.weeklyPlan.map(week => `
                        <div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: var(--border-radius);">
                            <strong>Week ${week.week}</strong>
                            <div style="margin: 0.5rem 0;">
                                <strong>Focus:</strong> ${week.focus.map(f => f.split('(')[0].trim()).join(', ')}
                            </div>
                            <div style="margin: 0.5rem 0;">
                                <strong>Goals:</strong>
                                <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                                    ${week.goals.map(goal => `<li>${goal}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="text-align: center; margin-top: 2rem;">
                    <button class="btn btn-primary" onclick="progressManager.saveStudyPlan(${JSON.stringify(plan).replace(/"/g, '&quot;')})">
                        <i class="fas fa-save"></i> Save Study Plan
                    </button>
                </div>
            </div>
        `;
    }

    saveStudyPlan(plan) {
        localStorage.setItem('currentStudyPlan', JSON.stringify(plan));
        alert('Study plan saved! You can access it anytime from your progress dashboard.');
        
        // Close modal
        document.getElementById('study-plan-modal').style.display = 'none';
    }

    // Method to update progress chart with new data
    updateChart() {
        if (!this.chart) return;

        const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        const last30Days = this.getLast30DaysData(quizHistory);

        this.chart.data.labels = last30Days.map(d => d.date);
        this.chart.data.datasets[0].data = last30Days.map(d => d.averageScore);
        this.chart.data.datasets[1].data = last30Days.map(d => d.sessionCount * 10);
        
        this.chart.update();
    }
}

// Global functions
window.generateStudyPlan = function() {
    window.progressManager.generateStudyPlan();
};

window.closeStudyPlanModal = function() {
    document.getElementById('study-plan-modal').style.display = 'none';
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.progressManager = new ProgressManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressManager;
}
