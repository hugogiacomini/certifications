// Configuration for the Learning Platform
const PLATFORM_CONFIG = {
    // Platform Settings
    platform: {
        name: "HuGoLearn",
        version: "1.0.0",
        description: "Interactive Certification Learning Platform",
        author: "Your Certification Journey"
    },

    // Feature Flags
    features: {
        flashcards: true,
        practiceTests: true,
        mockExams: true,
        progressTracking: true,
        studyPlans: true,
        achievements: true,
        analytics: true,
        contentParser: true
    },

    // Study Settings
    study: {
        defaultSessionLength: 30, // minutes
        flashcardBatchSize: 20,
        quickQuizLength: 10,
        practiceTestLength: 25,
        streakRequiredScore: 70, // percentage
        masteryThreshold: 85, // percentage
        reminderInterval: 24 // hours
    },

    // Certification Mapping
    certifications: {
        "aws-saa": {
            name: "AWS Solutions Architect Associate",
            code: "SAA-C03",
            provider: "Amazon Web Services",
            icon: "fab fa-aws",
            color: "#ff9900",
            duration: 130,
            questions: 65,
            passingScore: 720,
            maxScore: 1000,
            domains: [
                { name: "Design Secure Architectures", weight: 30 },
                { name: "Design Resilient Architectures", weight: 26 },
                { name: "Design High-Performing Architectures", weight: 24 },
                { name: "Design Cost-Optimized Architectures", weight: 20 }
            ],
            studyPath: "./aws/solutions-architect-associate/"
        },
        "aws-dea": {
            name: "AWS Data Engineer Associate",
            code: "DEA-C01",
            provider: "Amazon Web Services",
            icon: "fab fa-aws",
            color: "#ff9900",
            duration: 130,
            questions: 65,
            passingScore: 720,
            maxScore: 1000,
            domains: [
                { name: "Data Ingestion and Transformation", weight: 34 },
                { name: "Data Store Management", weight: 26 },
                { name: "Data Operations and Support", weight: 22 },
                { name: "Data Security and Governance", weight: 18 }
            ],
            studyPath: "./aws/data-engineer-associate/"
        },
        "databricks-dea": {
            name: "Databricks Data Engineer Associate",
            code: "DATA-ENGINEER-ASSOCIATE",
            provider: "Databricks",
            icon: "fas fa-database",
            color: "#ff3621",
            duration: 90,
            questions: 45,
            passingScore: 70,
            maxScore: 100,
            domains: [
                { name: "Databricks Fundamentals", weight: 25 },
                { name: "SQL and Data Manipulation", weight: 20 },
                { name: "Data Ingestion and ETL", weight: 25 },
                { name: "Delta Lake Basics", weight: 20 },
                { name: "Data Governance and Unity Catalog", weight: 10 }
            ],
            studyPath: "./databricks/databricks-certified-data-engineer-associate/"
        },
        "databricks-dep": {
            name: "Databricks Data Engineer Professional",
            code: "DATA-ENGINEER-PROFESSIONAL",
            provider: "Databricks",
            icon: "fas fa-database",
            color: "#ff3621",
            duration: 120,
            questions: 60,
            passingScore: 70,
            maxScore: 100,
            domains: [
                { name: "Data Modeling and Design", weight: 20 },
                { name: "Data Processing and Engineering", weight: 25 },
                { name: "Data Storage and Management", weight: 20 },
                { name: "Data Security and Governance", weight: 20 },
                { name: "Monitoring, Logging, and Troubleshooting", weight: 15 }
            ],
            studyPath: "./databricks/databricks-data-engineer-professional/"
        },
        "databricks-gai": {
            name: "Databricks Generative AI Engineer Associate",
            code: "GENERATIVE-AI-ENGINEER-ASSOCIATE",
            provider: "Databricks",
            icon: "fas fa-brain",
            color: "#ff3621",
            duration: 90,
            questions: 45,
            passingScore: 70,
            maxScore: 100,
            domains: [
                { name: "Generative AI Fundamentals", weight: 20 },
                { name: "Databricks for AI", weight: 20 },
                { name: "Prompt Engineering and Design", weight: 20 },
                { name: "RAG Application Development", weight: 20 },
                { name: "Model Selection and Optimization", weight: 20 }
            ],
            studyPath: "./databricks/databricks-generative-ai-engineer-associate/"
        },
        "azure-900": {
            name: "Azure Fundamentals",
            code: "AZ-900",
            provider: "Microsoft Azure",
            icon: "fab fa-microsoft",
            color: "#0078d4",
            duration: 85,
            questions: "40-60",
            passingScore: 700,
            maxScore: 1000,
            domains: [
                { name: "Cloud Concepts", weight: 25 },
                { name: "Core Azure Services", weight: 20 },
                { name: "Core Solutions and Management Tools", weight: 15 },
                { name: "General Security and Network Security", weight: 15 },
                { name: "Identity, Governance, Privacy, and Compliance", weight: 15 },
                { name: "Azure Cost Management and SLAs", weight: 10 }
            ],
            studyPath: "./azure/az-900/"
        },
        "gcp-pde": {
            name: "Google Cloud Professional Data Engineer",
            code: "PROFESSIONAL-DATA-ENGINEER",
            provider: "Google Cloud",
            icon: "fab fa-google",
            color: "#4285f4",
            duration: 120,
            questions: "50-60",
            passingScore: "Pass/Fail",
            maxScore: "Pass/Fail",
            domains: [
                { name: "Designing Data Processing Systems", weight: 25 },
                { name: "Building and Operationalizing Data Processing Systems", weight: 25 },
                { name: "Operationalizing Machine Learning Models", weight: 25 },
                { name: "Ensuring Solution Quality", weight: 25 }
            ],
            studyPath: "./gcp/professional-data-engineer/"
        },
        "psm-1": {
            name: "Professional Scrum Master I",
            code: "PSM I",
            provider: "Scrum.org",
            icon: "fas fa-sync-alt",
            color: "#10b981",
            duration: 60,
            questions: 80,
            passingScore: 85,
            maxScore: 100,
            domains: [
                { name: "Scrum Theory and Principles", weight: 25 },
                { name: "Scrum Framework", weight: 25 },
                { name: "Scrum Master Role", weight: 25 },
                { name: "Coaching and Facilitation", weight: 25 }
            ],
            studyPath: "./agile/scrum/scrum-master/professional-scrum-master-i/"
        },
        "psm-2": {
            name: "Professional Scrum Master II",
            code: "PSM II",
            provider: "Scrum.org",
            icon: "fas fa-sync-alt",
            color: "#10b981",
            duration: 90,
            questions: 30,
            passingScore: 85,
            maxScore: 100,
            domains: [
                { name: "Advanced Scrum Master Practices", weight: 25 },
                { name: "Facilitation and Coaching", weight: 25 },
                { name: "Scaling Scrum", weight: 25 },
                { name: "Organizational Change", weight: 25 }
            ],
            studyPath: "./agile/scrum/scrum-master/professional-scrum-master-ii/"
        },
        "airflow-fundamentals": {
            name: "Apache Airflow Fundamentals",
            code: "AIRFLOW-FUNDAMENTALS",
            provider: "Astronomer",
            icon: "fas fa-wind",
            color: "#017cee",
            duration: 60,
            questions: 40,
            passingScore: 80,
            maxScore: 100,
            domains: [
                { name: "Airflow Concepts", weight: 25 },
                { name: "DAG Creation", weight: 25 },
                { name: "Task Management", weight: 25 },
                { name: "Best Practices", weight: 25 }
            ],
            studyPath: "./airflow/astronomer/apache-airflow-fundamentals/"
        },
        "dag-authoring": {
            name: "DAG Authoring",
            code: "DAG-AUTHORING",
            provider: "Astronomer",
            icon: "fas fa-wind",
            color: "#017cee",
            duration: 90,
            questions: 50,
            passingScore: 80,
            maxScore: 100,
            domains: [
                { name: "Advanced DAG Patterns", weight: 30 },
                { name: "Task Dependencies", weight: 25 },
                { name: "Dynamic DAGs", weight: 25 },
                { name: "Testing and Debugging", weight: 20 }
            ],
            studyPath: "./airflow/astronomer/dag-authoring/"
        }
    },

    // Content Sources - Map to your existing study materials
    contentSources: {
        studyGuides: {
            "aws-saa": [
                "./aws/solutions-architect-associate/README.md",
                "./aws/solutions-architect-associate/domain-1-secure-architectures.md",
                "./aws/solutions-architect-associate/domain-2-resilient-architectures.md",
                "./aws/solutions-architect-associate/domain-3-high-performing-architectures.md",
                "./aws/solutions-architect-associate/domain-4-cost-optimized-architectures.md"
            ],
            "aws-dea": [
                "./aws/data-engineer-associate/README.md",
                "./aws/data-engineer-associate/domain-1-data-ingestion-transformation.md",
                "./aws/data-engineer-associate/domain-2-data-store-management.md",
                "./aws/data-engineer-associate/domain-3-data-operations-support.md",
                "./aws/data-engineer-associate/domain-4-data-security-governance.md"
            ],
            "databricks-dea": [
                "./databricks/databricks-certified-data-engineer-associate/README.md",
                "./databricks/databricks-certified-data-engineer-associate/01-databricks-fundamentals.md",
                "./databricks/databricks-certified-data-engineer-associate/02-sql-and-data-manipulation.md",
                "./databricks/databricks-certified-data-engineer-associate/03-data-ingestion-and-etl.md",
                "./databricks/databricks-certified-data-engineer-associate/04-delta-lake-basics.md",
                "./databricks/databricks-certified-data-engineer-associate/05-data-governance-and-unity-catalog.md"
            ],
            "databricks-dep": [
                "./databricks/databricks-data-engineer-professional/README.md",
                "./databricks/databricks-data-engineer-professional/01-data-modeling-and-design.md",
                "./databricks/databricks-data-engineer-professional/02-data-processing-and-engineering.md",
                "./databricks/databricks-data-engineer-professional/03-data-storage-and-management.md",
                "./databricks/databricks-data-engineer-professional/04-data-security-and-governance.md",
                "./databricks/databricks-data-engineer-professional/05-monitoring-logging-troubleshooting.md"
            ],
            "databricks-gai": [
                "./databricks/databricks-generative-ai-engineer-associate/01-generative-ai-fundamentals.md",
                "./databricks/databricks-generative-ai-engineer-associate/02-databricks-for-ai.md",
                "./databricks/databricks-generative-ai-engineer-associate/03-prompt-engineering-and-design.md",
                "./databricks/databricks-generative-ai-engineer-associate/06-document-chunking-strategies.md",
                "./databricks/databricks-generative-ai-engineer-associate/10-model-selection-optimization.md",
                "./databricks/databricks-generative-ai-engineer-associate/12-rag-application-assembly.md",
                "./databricks/databricks-generative-ai-engineer-associate/study-guide.md"
            ],
            "azure-900": [
                "./azure/az-900/README.md"
            ],
            "gcp-pde": [
                "./gcp/professional-data-engineer/gcp-professional-data-engineer-summary.md"
            ],
            "airflow-fundamentals": [
                "./airflow/astronomer/apache-airflow-fundamentals/README.md"
            ],
            "dag-authoring": [
                "./airflow/astronomer/dag-authoring/README.md"
            ]
        }
    },

    // UI Customization
    ui: {
        theme: {
            primary: "#6366f1",
            secondary: "#06b6d4",
            success: "#10b981",
            warning: "#f59e0b",
            danger: "#ef4444",
            dark: "#1f2937",
            light: "#f8fafc"
        },
        animations: {
            duration: "0.3s",
            easing: "ease-in-out",
            cardFlip: "0.6s",
            pageTransition: "0.5s"
        },
        breakpoints: {
            mobile: "768px",
            tablet: "1024px",
            desktop: "1200px"
        }
    },

    // Analytics & Tracking
    analytics: {
        trackingEnabled: true,
        sessionTimeout: 30, // minutes
        autoSave: true,
        autoSaveInterval: 60, // seconds
        retentionDays: 365
    },

    // Content Parser Settings
    contentParser: {
        flashcardPatterns: {
            definition: /##\s+(.+?)\n\n([\s\S]*?)(?=\n##|\n```|\n---|\n\*|\n\d+\.|\n-|$)/g,
            qAndA: /\*\*Q:\*\*\s*(.*?)\n\*\*A:\*\*\s*([\s\S]*?)(?=\n\*\*Q:|\n##|$)/g,
            keyTerm: /\*\*(.+?)\*\*:\s*(.*?)(?=\n\*\*|\n##|\n\n|$)/g
        },
        questionPatterns: {
            numbered: /###\s+Question\s+\d+[\s\S]*?(?=###\s+Question|\n##|$)/g,
            practice: /##\s+Practice\s+Questions[\s\S]*?(?=\n##|$)/g,
            scenario: /###\s+Scenario\s+\d+[\s\S]*?(?=###\s+Scenario|\n##|$)/g
        },
        excludePatterns: [
            "Table of Contents",
            "Introduction",
            "Prerequisites",
            "Resources",
            "Links"
        ]
    },

    // Performance Settings
    performance: {
        lazyLoad: true,
        imageOptimization: true,
        cacheStrategy: "localStorage",
        maxCacheSize: "50MB",
        compressionEnabled: true
    }
};

// Export configuration
if (typeof window !== 'undefined') {
    window.PLATFORM_CONFIG = PLATFORM_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PLATFORM_CONFIG;
}
