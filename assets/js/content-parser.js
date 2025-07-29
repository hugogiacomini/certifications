// Content Parser for Markdown Files
class ContentParser {
    constructor() {
        this.contentCache = new Map();
        this.flashcards = new Map();
        this.quizQuestions = new Map();
        this.searchIndex = new Map();
    }

    async loadAllContent() {
        console.log('Loading all content...');
        
        // Load content for each certification
        for (const [certId, cert] of Object.entries(PLATFORM_CONFIG.certifications)) {
            try {
                console.log(`Loading content for ${certId}...`);
                await this.loadCertificationContent(certId, cert);
            } catch (error) {
                console.error(`Error loading ${certId}:`, error);
            }
        }
        
        console.log('Content loading complete');
        this.buildSearchIndex();
    }

    async loadCertificationContent(certId, certConfig) {
        const contentData = {
            flashcards: [],
            quizQuestions: [],
            studyMaterial: '',
            domains: certConfig.domains || []
        };

        // Load from markdown files based on study path
        if (certConfig.studyPath && certConfig.studyPath.length > 0) {
            for (const filePath of certConfig.studyPath) {
                try {
                    const content = await this.loadMarkdownFile(filePath);
                    if (content) {
                        const parsed = this.parseMarkdownContent(content, filePath);
                        contentData.flashcards.push(...parsed.flashcards);
                        contentData.quizQuestions.push(...parsed.quizQuestions);
                        contentData.studyMaterial += parsed.studyMaterial + '\n\n';
                    }
                } catch (error) {
                    console.warn(`Could not load ${filePath}:`, error.message);
                }
            }
        }

        // If no content from study path, generate sample content
        if (contentData.flashcards.length === 0) {
            contentData.flashcards = this.generateSampleFlashcards(certId, certConfig);
            contentData.quizQuestions = this.generateSampleQuizQuestions(certId, certConfig);
        }

        this.contentCache.set(certId, contentData);
        this.flashcards.set(certId, contentData.flashcards);
        this.quizQuestions.set(certId, contentData.quizQuestions);
    }

    async loadMarkdownFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.warn(`Failed to load ${filePath}:`, error.message);
            return null;
        }
    }

    parseMarkdownContent(content, filePath) {
        const result = {
            flashcards: [],
            quizQuestions: [],
            studyMaterial: ''
        };

        // Split content into sections
        const sections = content.split(/#{1,6}\s+/);
        let currentSection = '';
        
        for (let i = 1; i < sections.length; i++) {
            const section = sections[i];
            const lines = section.trim().split('\n');
            const title = lines[0] || '';
            const sectionContent = lines.slice(1).join('\n').trim();
            
            currentSection = title;
            result.studyMaterial += `## ${title}\n${sectionContent}\n\n`;

            // Extract flashcards from bullet points and definitions
            const flashcards = this.extractFlashcardsFromSection(title, sectionContent, filePath);
            result.flashcards.push(...flashcards);

            // Extract quiz questions from numbered lists or Q&A patterns
            const quizQuestions = this.extractQuizQuestionsFromSection(title, sectionContent, filePath);
            result.quizQuestions.push(...quizQuestions);
        }

        return result;
    }

    extractFlashcardsFromSection(title, content, filePath) {
        const flashcards = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Pattern 1: Definition lists (term: definition)
            if (line.includes(':') && !line.startsWith('http') && line.length > 10) {
                const [term, ...defParts] = line.split(':');
                const definition = defParts.join(':').trim();
                
                if (term.trim() && definition && definition.length > 10) {
                    flashcards.push({
                        id: this.generateId(),
                        question: `What is ${term.trim()}?`,
                        answer: definition,
                        category: title,
                        source: filePath,
                        difficulty: 'medium',
                        tags: this.extractTags(term + ' ' + definition)
                    });
                }
            }
            
            // Pattern 2: Bold terms followed by explanations
            const boldMatch = line.match(/\*\*(.*?)\*\*(.+)/);
            if (boldMatch) {
                const term = boldMatch[1].trim();
                const explanation = boldMatch[2].trim();
                
                if (term && explanation && explanation.length > 15) {
                    flashcards.push({
                        id: this.generateId(),
                        question: `Explain: ${term}`,
                        answer: explanation.replace(/^[:\-\s]+/, ''),
                        category: title,
                        source: filePath,
                        difficulty: 'medium',
                        tags: this.extractTags(term + ' ' + explanation)
                    });
                }
            }

            // Pattern 3: Key concepts from bullet points
            if (line.startsWith('-') || line.startsWith('*')) {
                const concept = line.replace(/^[\-\*]\s*/, '').trim();
                if (concept.length > 20 && concept.includes(' ')) {
                    // Look for the next few lines for additional context
                    let context = concept;
                    let j = i + 1;
                    while (j < lines.length && j < i + 3) {
                        const nextLine = lines[j].trim();
                        if (nextLine.startsWith('-') || nextLine.startsWith('*') || nextLine.startsWith('#')) {
                            break;
                        }
                        if (nextLine.length > 0) {
                            context += ' ' + nextLine;
                        }
                        j++;
                    }
                    
                    if (context.length > concept.length) {
                        flashcards.push({
                            id: this.generateId(),
                            question: `What should you know about: ${concept.split('.')[0]}?`,
                            answer: context,
                            category: title,
                            source: filePath,
                            difficulty: 'easy',
                            tags: this.extractTags(context)
                        });
                    }
                }
            }
        }

        return flashcards;
    }

    extractQuizQuestionsFromSection(title, content, filePath) {
        const questions = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Pattern 1: Questions ending with ?
            if (line.endsWith('?') && line.length > 20) {
                // Look for answer in next few lines
                let answer = '';
                let j = i + 1;
                while (j < lines.length && j < i + 5) {
                    const nextLine = lines[j].trim();
                    if (nextLine.endsWith('?') || nextLine.startsWith('#')) {
                        break;
                    }
                    if (nextLine.length > 0) {
                        answer += (answer ? ' ' : '') + nextLine;
                    }
                    j++;
                }
                
                if (answer.length > 10) {
                    questions.push({
                        id: this.generateId(),
                        question: line,
                        answer: answer,
                        options: this.generateMultipleChoiceOptions(answer),
                        correctAnswer: 0, // First option is always correct
                        category: title,
                        source: filePath,
                        difficulty: 'medium',
                        type: 'multiple-choice'
                    });
                }
            }
        }

        return questions;
    }

    generateMultipleChoiceOptions(correctAnswer) {
        // Generate 3 plausible wrong answers based on the correct answer
        const options = [correctAnswer];
        
        // Simple strategy: create variations
        const variations = [
            'This is not the correct answer',
            'Another incorrect option',
            'This option is also wrong'
        ];
        
        options.push(...variations);
        return options;
    }

    extractTags(text) {
        // Extract key terms as tags
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3);
        
        // Return unique words as tags
        return [...new Set(words)].slice(0, 5);
    }

    generateSampleFlashcards(certId, certConfig) {
        const sampleData = {
            'aws-data-engineer': [
                {
                    question: 'What is Amazon Kinesis?',
                    answer: 'A platform for streaming data on AWS, offering powerful services to load and analyze streaming data.',
                    category: 'Data Streaming'
                },
                {
                    question: 'What is AWS Glue?',
                    answer: 'A fully managed extract, transform, and load (ETL) service that makes it easy to prepare and load data for analytics.',
                    category: 'Data Processing'
                }
            ],
            'aws-solutions-architect': [
                {
                    question: 'What is AWS VPC?',
                    answer: 'Virtual Private Cloud - a logically isolated virtual network within the AWS cloud.',
                    category: 'Networking'
                },
                {
                    question: 'What is Auto Scaling?',
                    answer: 'A service that automatically adjusts the number of EC2 instances in response to demand.',
                    category: 'Compute'
                }
            ],
            'databricks-data-engineer': [
                {
                    question: 'What is Delta Lake?',
                    answer: 'An open-source storage layer that brings ACID transactions to Apache Spark and big data workloads.',
                    category: 'Data Storage'
                },
                {
                    question: 'What is Unity Catalog?',
                    answer: 'A unified governance solution for data and AI assets across clouds and platforms.',
                    category: 'Data Governance'
                }
            ]
        };

        const baseSamples = sampleData[certId] || sampleData['aws-data-engineer'];
        
        return baseSamples.map((sample, index) => ({
            id: this.generateId(),
            question: sample.question,
            answer: sample.answer,
            category: sample.category,
            source: 'generated',
            difficulty: 'medium',
            tags: this.extractTags(sample.question + ' ' + sample.answer)
        }));
    }

    generateSampleQuizQuestions(certId, certConfig) {
        // Generate basic quiz questions based on certification domains
        const questions = [];
        
        if (certConfig.domains) {
            certConfig.domains.forEach((domain, index) => {
                questions.push({
                    id: this.generateId(),
                    question: `Which of the following is a key concept in ${domain.name}?`,
                    options: [
                        'Correct implementation of best practices',
                        'Random configuration settings',
                        'Ignoring security requirements',
                        'Bypassing standard procedures'
                    ],
                    correctAnswer: 0,
                    category: domain.name,
                    source: 'generated',
                    difficulty: 'medium',
                    type: 'multiple-choice'
                });
            });
        }

        return questions;
    }

    buildSearchIndex() {
        // Build search index from all content
        this.searchIndex.clear();
        
        for (const [certId, content] of this.contentCache.entries()) {
            // Index flashcards
            content.flashcards.forEach(flashcard => {
                this.addToSearchIndex(flashcard.question + ' ' + flashcard.answer, {
                    type: 'flashcard',
                    id: certId,
                    title: flashcard.question,
                    preview: flashcard.answer.substring(0, 100) + '...',
                    category: flashcard.category
                });
            });

            // Index quiz questions
            content.quizQuestions.forEach(question => {
                this.addToSearchIndex(question.question + ' ' + question.answer, {
                    type: 'quiz',
                    id: certId,
                    title: question.question,
                    preview: question.answer.substring(0, 100) + '...',
                    category: question.category
                });
            });
        }
    }

    addToSearchIndex(text, item) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);

        words.forEach(word => {
            if (!this.searchIndex.has(word)) {
                this.searchIndex.set(word, []);
            }
            this.searchIndex.get(word).push(item);
        });
    }

    async searchContent(query) {
        const searchTerms = query.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(term => term.length > 2);

        if (searchTerms.length === 0) {
            return [];
        }

        const results = new Map();
        
        searchTerms.forEach(term => {
            if (this.searchIndex.has(term)) {
                this.searchIndex.get(term).forEach(item => {
                    const key = `${item.type}-${item.id}-${item.title}`;
                    if (results.has(key)) {
                        results.get(key).score++;
                    } else {
                        results.set(key, { ...item, score: 1 });
                    }
                });
            }
        });

        // Sort by relevance score and return top results
        return Array.from(results.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    getFlashcards(certId) {
        return this.flashcards.get(certId) || [];
    }

    getQuizQuestions(certId) {
        return this.quizQuestions.get(certId) || [];
    }

    getCertificationContent(certId) {
        return this.contentCache.get(certId) || null;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // Get flashcards by difficulty
    getFlashcardsByDifficulty(certId, difficulty) {
        const flashcards = this.getFlashcards(certId);
        return flashcards.filter(card => card.difficulty === difficulty);
    }

    // Get flashcards by category
    getFlashcardsByCategory(certId, category) {
        const flashcards = this.getFlashcards(certId);
        return flashcards.filter(card => card.category === category);
    }

    // Update flashcard difficulty based on user performance
    updateFlashcardDifficulty(flashcardId, wasCorrect) {
        for (const [certId, flashcards] of this.flashcards.entries()) {
            const flashcard = flashcards.find(card => card.id === flashcardId);
            if (flashcard) {
                if (wasCorrect) {
                    // Make it easier if user got it right
                    if (flashcard.difficulty === 'hard') flashcard.difficulty = 'medium';
                    else if (flashcard.difficulty === 'medium') flashcard.difficulty = 'easy';
                } else {
                    // Make it harder if user got it wrong
                    if (flashcard.difficulty === 'easy') flashcard.difficulty = 'medium';
                    else if (flashcard.difficulty === 'medium') flashcard.difficulty = 'hard';
                }
                break;
            }
        }
    }
}
