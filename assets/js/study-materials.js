// Study Materials Management
class StudyMaterialsManager {
    constructor() {
        this.currentContent = null;
        this.studyTree = new Map();
        this.bookmarks = JSON.parse(localStorage.getItem('study-bookmarks') || '[]');
        this.readingMode = false;
        this.darkMode = JSON.parse(localStorage.getItem('study-dark-mode') || 'false');
        this.currentPath = [];
        this.contentHistory = [];
        this.historyIndex = -1;
        this.searchIndex = new Map();
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        await this.loadStudyMaterials();
        this.setupEventListeners();
        this.applyStoredPreferences();
        this.buildSearchIndex();
        this.isInitialized = true;
        
        console.log('Study Materials Manager initialized');
    }

    async loadStudyMaterials() {
        try {
            // Build study tree from certification configs and content
            for (const [certId, cert] of Object.entries(PLATFORM_CONFIG.certifications)) {
                const certNode = {
                    id: certId,
                    title: cert.name,
                    type: 'certification',
                    provider: cert.provider,
                    children: new Map(),
                    content: null
                };

                // Load content for each domain/topic
                if (cert.studyPath && cert.studyPath.length > 0) {
                    for (let i = 0; i < cert.studyPath.length; i++) {
                        const filePath = cert.studyPath[i];
                        const topicId = `${certId}-topic-${i + 1}`;
                        const topicName = this.extractTopicName(filePath);
                        
                        try {
                            const content = await this.loadMarkdownFile(filePath);
                            if (content) {
                                const topicNode = {
                                    id: topicId,
                                    title: topicName,
                                    type: 'topic',
                                    filePath: filePath,
                                    content: content,
                                    children: new Map(),
                                    parent: certId
                                };

                                // Parse subtopics from content
                                const subtopics = this.extractSubtopics(content);
                                subtopics.forEach((subtopic, index) => {
                                    const subtopicId = `${topicId}-subtopic-${index + 1}`;
                                    topicNode.children.set(subtopicId, {
                                        id: subtopicId,
                                        title: subtopic.title,
                                        type: 'subtopic',
                                        content: subtopic.content,
                                        parent: topicId
                                    });
                                });

                                certNode.children.set(topicId, topicNode);
                            }
                        } catch (error) {
                            console.warn(`Could not load ${filePath}:`, error.message);
                        }
                    }
                }

                // If no content loaded, create sample structure
                if (certNode.children.size === 0) {
                    this.createSampleContent(certNode, cert);
                }

                this.studyTree.set(certId, certNode);
            }

            this.renderStudyTree();
            this.populateFilters();
            this.renderBookmarks();
        } catch (error) {
            console.error('Error loading study materials:', error);
        }
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

    extractTopicName(filePath) {
        const fileName = filePath.split('/').pop().replace('.md', '');
        return fileName
            .replace(/^\d+[-\.]?\s*/, '') // Remove leading numbers
            .replace(/[-_]/g, ' ')       // Replace dashes/underscores with spaces
            .replace(/\b\w/g, l => l.toUpperCase()); // Title case
    }

    extractSubtopics(content) {
        const subtopics = [];
        const lines = content.split('\n');
        let currentSubtopic = null;
        let currentContent = '';

        for (const line of lines) {
            // Match headers (## or ###)
            const headerMatch = line.match(/^(#{2,3})\s+(.+)$/);
            if (headerMatch) {
                // Save previous subtopic
                if (currentSubtopic) {
                    subtopics.push({
                        title: currentSubtopic,
                        content: currentContent.trim()
                    });
                }
                
                currentSubtopic = headerMatch[2].trim();
                currentContent = '';
            } else if (currentSubtopic) {
                currentContent += line + '\n';
            }
        }

        // Add the last subtopic
        if (currentSubtopic) {
            subtopics.push({
                title: currentSubtopic,
                content: currentContent.trim()
            });
        }

        return subtopics;
    }

    createSampleContent(certNode, cert) {
        cert.domains.forEach((domain, index) => {
            const topicId = `${certNode.id}-topic-${index + 1}`;
            const topicNode = {
                id: topicId,
                title: domain.name,
                type: 'topic',
                content: this.generateSampleMarkdown(domain.name, cert.name),
                children: new Map(),
                parent: certNode.id
            };

            // Add sample subtopics
            const subtopics = [
                'Overview and Fundamentals',
                'Key Concepts and Terminology',
                'Best Practices',
                'Common Patterns and Solutions',
                'Troubleshooting and Debugging'
            ];

            subtopics.forEach((subtopic, subIndex) => {
                const subtopicId = `${topicId}-subtopic-${subIndex + 1}`;
                topicNode.children.set(subtopicId, {
                    id: subtopicId,
                    title: subtopic,
                    type: 'subtopic',
                    content: this.generateSampleSubtopicMarkdown(subtopic, domain.name),
                    parent: topicId
                });
            });

            certNode.children.set(topicId, topicNode);
        });
    }

    generateSampleMarkdown(topicName, certName) {
        return `# ${topicName}

## Overview
This section covers the essential concepts and practices for ${topicName} in the context of ${certName} certification.

## Key Learning Objectives
- Understand the fundamental principles of ${topicName}
- Learn industry best practices and standards
- Master practical implementation techniques
- Develop troubleshooting and optimization skills

## Prerequisites
Before diving into this topic, ensure you have:
- Basic understanding of cloud computing concepts
- Familiarity with relevant tools and platforms
- Hands-on experience with similar technologies

## Topics Covered
1. **Fundamentals and Core Concepts**
2. **Architecture and Design Patterns**
3. **Implementation and Configuration**
4. **Monitoring and Optimization**
5. **Security and Compliance**

## Getting Started
Begin your learning journey by reviewing the overview section and then proceeding through each subtopic systematically. Take notes and practice with hands-on exercises to reinforce your understanding.

---
*This is sample content. Please refer to the official certification guide and documentation for complete study materials.*`;
    }

    generateSampleSubtopicMarkdown(subtopicName, topicName) {
        return `# ${subtopicName} - ${topicName}

## Introduction
${subtopicName} is a crucial aspect of ${topicName} that requires thorough understanding for certification success.

## Key Concepts
- **Concept 1**: Detailed explanation of the first important concept
- **Concept 2**: Overview of the second critical element
- **Concept 3**: Understanding of the third essential component

## Practical Examples
Here are some practical scenarios where these concepts apply:

\`\`\`
// Sample code or configuration
example_configuration = {
    "setting1": "value1",
    "setting2": "value2",
    "best_practice": true
}
\`\`\`

## Best Practices
1. Always follow industry standards
2. Implement security measures from the start
3. Monitor and optimize performance regularly
4. Document your implementations thoroughly

## Common Pitfalls
- **Pitfall 1**: Description and how to avoid it
- **Pitfall 2**: Common mistake and prevention strategy
- **Pitfall 3**: Typical error and solution approach

## Summary
This subtopic covered the essential elements of ${subtopicName} within ${topicName}. Key takeaways include understanding the core concepts, implementing best practices, and avoiding common mistakes.

## Next Steps
- Review the key concepts
- Practice with hands-on exercises
- Move to the next subtopic
- Take notes for future reference

---
*Continue to the next section to build upon these foundational concepts.*`;
    }

    renderStudyTree() {
        const treeContainer = document.getElementById('study-tree');
        if (!treeContainer) return;

        treeContainer.innerHTML = '';

        for (const [certId, certNode] of this.studyTree) {
            const certElement = this.createTreeNode(certNode);
            treeContainer.appendChild(certElement);
        }
    }

    createTreeNode(node, level = 0) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'tree-item';

        const hasChildren = node.children && node.children.size > 0;
        const isExpanded = true; // Start expanded by default

        const nodeContent = document.createElement('div');
        nodeContent.className = `tree-node ${node.type}`;
        nodeContent.dataset.nodeId = node.id;
        nodeContent.dataset.nodeType = node.type;

        let icon = '';
        switch (node.type) {
            case 'certification':
                icon = 'fas fa-certificate';
                break;
            case 'topic':
                icon = 'fas fa-book';
                break;
            case 'subtopic':
                icon = 'fas fa-file-alt';
                break;
        }

        nodeContent.innerHTML = `
            ${hasChildren ? `<i class="fas fa-chevron-down tree-toggle ${isExpanded ? '' : 'collapsed'}"></i>` : '<span class="tree-spacer"></span>'}
            <i class="${icon}"></i>
            <span class="node-title">${node.title}</span>
        `;

        // Add click handler for content navigation
        nodeContent.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (e.target.classList.contains('tree-toggle')) {
                this.toggleTreeNode(nodeElement);
            } else {
                this.selectNode(node);
            }
        });

        nodeElement.appendChild(nodeContent);

        // Add children
        if (hasChildren) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = `tree-children ${isExpanded ? '' : 'collapsed'}`;
            
            for (const [childId, childNode] of node.children) {
                const childElement = this.createTreeNode(childNode, level + 1);
                childrenContainer.appendChild(childElement);
            }
            
            nodeElement.appendChild(childrenContainer);
        }

        return nodeElement;
    }

    toggleTreeNode(nodeElement) {
        const toggle = nodeElement.querySelector('.tree-toggle');
        const children = nodeElement.querySelector('.tree-children');
        
        if (!toggle || !children) return;

        const isCollapsed = toggle.classList.contains('collapsed');
        
        if (isCollapsed) {
            toggle.classList.remove('collapsed');
            children.classList.remove('collapsed');
        } else {
            toggle.classList.add('collapsed');
            children.classList.add('collapsed');
        }
    }

    selectNode(node) {
        // Update active state
        document.querySelectorAll('.tree-node').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-node-id="${node.id}"]`).classList.add('active');

        // Load content
        this.loadNodeContent(node);
        
        // Update breadcrumb
        this.updateBreadcrumb(node);
        
        // Add to history
        this.addToHistory(node);
    }

    loadNodeContent(node) {
        const contentBody = document.getElementById('study-content-body');
        if (!contentBody) return;

        this.currentContent = node;

        if (node.content) {
            const htmlContent = this.markdownToHtml(node.content);
            const readingTime = this.estimateReadingTime(node.content);
            const toc = this.generateTableOfContents(node.content);
            
            let contentHtml = `
                <div class="content-meta">
                    <div class="reading-time">
                        <i class="fas fa-clock"></i>
                        <span>${readingTime} min read</span>
                    </div>
                    <div class="last-updated">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Last updated: Today</span>
                    </div>
                </div>
            `;
            
            if (toc.length > 2) {
                contentHtml += `
                    <div class="table-of-contents">
                        <h4><i class="fas fa-list"></i> Table of Contents</h4>
                        <ul class="toc-list">
                            ${toc.map(item => `
                                <li class="toc-item toc-level-${item.level}">
                                    <a href="#${item.anchor}" onclick="scrollToHeading('${item.anchor}')">${item.text}</a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }
            
            contentHtml += `<div class="study-material">${htmlContent}</div>`;
            contentBody.innerHTML = contentHtml;
        } else {
            contentBody.innerHTML = `
                <div class="content-placeholder">
                    <div class="placeholder-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <h3>${node.title}</h3>
                    <p>Content for this topic is being prepared. Please check back later or select a different topic.</p>
                </div>
            `;
        }

        // Enable/disable navigation buttons
        this.updateNavigationButtons(node);
        
        // Update progress
        this.updateProgress(node);
        
        // Update bookmark button status
        this.updateBookmarkButton(node);
        
        // Scroll to top
        contentBody.scrollTop = 0;
    }

    markdownToHtml(markdown) {
        // Basic markdown to HTML conversion
        let html = markdown;
        let headingCounter = 0;

        // Headers with anchors
        html = html.replace(/^# (.*$)/gm, (match, text) => {
            return `<h1 id="heading-${++headingCounter}">${text}</h1>`;
        });
        html = html.replace(/^## (.*$)/gm, (match, text) => {
            return `<h2 id="heading-${++headingCounter}">${text}</h2>`;
        });
        html = html.replace(/^### (.*$)/gm, (match, text) => {
            return `<h3 id="heading-${++headingCounter}">${text}</h3>`;
        });
        html = html.replace(/^#### (.*$)/gm, (match, text) => {
            return `<h4 id="heading-${++headingCounter}">${text}</h4>`;
        });

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Inline code
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Lists
        html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
        html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
        
        // Wrap consecutive list items in ul/ol
        html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
            if (match.includes('1. ')) {
                return '<ol>' + match + '</ol>';
            } else {
                return '<ul>' + match + '</ul>';
            }
        });
        
        // Paragraphs
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre>)/g, '$1');
        html = html.replace(/(<\/pre>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>|<ol>)/g, '$1');
        html = html.replace(/(<\/ul>|<\/ol>)<\/p>/g, '$1');

        return html;
    }

    estimateReadingTime(content) {
        const wordsPerMinute = 200;
        const words = content.split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return minutes;
    }

    generateTableOfContents(content) {
        const lines = content.split('\n');
        const toc = [];
        let headingCounter = 0;

        for (const line of lines) {
            const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headerMatch) {
                const level = headerMatch[1].length;
                const text = headerMatch[2].trim();
                const anchor = `heading-${++headingCounter}`;
                
                toc.push({
                    level,
                    text,
                    anchor
                });
            }
        }

        return toc;
    }

    updateBreadcrumb(node) {
        const breadcrumb = document.getElementById('study-breadcrumb');
        if (!breadcrumb) return;

        const path = this.getNodePath(node);
        breadcrumb.innerHTML = path.map((item, index) => 
            `<span class="breadcrumb-item ${index === path.length - 1 ? 'active' : ''}">${item.title}</span>`
        ).join('');
    }

    getNodePath(node) {
        const path = [node];
        let current = node;

        while (current.parent) {
            const parent = this.findNodeById(current.parent);
            if (parent) {
                path.unshift(parent);
                current = parent;
            } else {
                break;
            }
        }

        return path;
    }

    findNodeById(nodeId) {
        for (const [certId, certNode] of this.studyTree) {
            if (certNode.id === nodeId) return certNode;
            
            for (const [topicId, topicNode] of certNode.children) {
                if (topicNode.id === nodeId) return topicNode;
                
                for (const [subtopicId, subtopicNode] of topicNode.children) {
                    if (subtopicNode.id === nodeId) return subtopicNode;
                }
            }
        }
        return null;
    }

    addToHistory(node) {
        // Remove any history after current position
        this.contentHistory = this.contentHistory.slice(0, this.historyIndex + 1);
        
        // Add new node
        this.contentHistory.push(node);
        this.historyIndex = this.contentHistory.length - 1;
        
        // Limit history size
        if (this.contentHistory.length > 50) {
            this.contentHistory.shift();
            this.historyIndex--;
        }
    }

    updateNavigationButtons(node) {
        const prevBtn = document.getElementById('prev-content-btn');
        const nextBtn = document.getElementById('next-content-btn');
        
        if (!prevBtn || !nextBtn) return;

        const siblings = this.getNodeSiblings(node);
        const currentIndex = siblings.findIndex(sibling => sibling.id === node.id);
        
        prevBtn.disabled = currentIndex <= 0;
        nextBtn.disabled = currentIndex >= siblings.length - 1;
    }

    getNodeSiblings(node) {
        if (!node.parent) {
            return Array.from(this.studyTree.values());
        }

        const parent = this.findNodeById(node.parent);
        if (!parent || !parent.children) {
            return [node];
        }

        return Array.from(parent.children.values());
    }

    updateProgress(node) {
        const progressFill = document.getElementById('content-progress');
        const progressText = document.getElementById('content-progress-text');
        
        if (!progressFill || !progressText) return;

        const siblings = this.getNodeSiblings(node);
        const currentIndex = siblings.findIndex(sibling => sibling.id === node.id);
        const progress = siblings.length > 0 ? ((currentIndex + 1) / siblings.length) * 100 : 0;
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}% Complete`;
    }

    updateBookmarkButton(node) {
        const btn = document.getElementById('bookmark-btn');
        if (!btn) return;

        const isBookmarked = this.bookmarks.some(b => b.id === node.id);
        btn.innerHTML = isBookmarked ? 
            '<i class="fas fa-bookmark" style="color: gold;"></i> Bookmarked' : 
            '<i class="fas fa-bookmark"></i> Bookmark';
    }

    populateFilters() {
        const certFilter = document.getElementById('study-cert-filter');
        const topicFilter = document.getElementById('study-topic-filter');
        
        if (!certFilter || !topicFilter) return;

        // Clear existing options (except the first one)
        certFilter.innerHTML = '<option value="">All Certifications</option>';
        topicFilter.innerHTML = '<option value="">All Topics</option>';

        // Add certification options
        for (const [certId, certNode] of this.studyTree) {
            const option = document.createElement('option');
            option.value = certId;
            option.textContent = certNode.title;
            certFilter.appendChild(option);
        }

        // Add topic options
        for (const [certId, certNode] of this.studyTree) {
            for (const [topicId, topicNode] of certNode.children) {
                const option = document.createElement('option');
                option.value = topicId;
                option.textContent = `${certNode.title} - ${topicNode.title}`;
                topicFilter.appendChild(option);
            }
        }
    }

    buildSearchIndex() {
        this.searchIndex.clear();
        
        for (const [certId, certNode] of this.studyTree) {
            this.indexNode(certNode);
            
            for (const [topicId, topicNode] of certNode.children) {
                this.indexNode(topicNode);
                
                for (const [subtopicId, subtopicNode] of topicNode.children) {
                    this.indexNode(subtopicNode);
                }
            }
        }
    }

    indexNode(node) {
        const searchText = `${node.title} ${node.content || ''}`.toLowerCase();
        const words = searchText.match(/\b\w+\b/g) || [];
        
        words.forEach(word => {
            if (word.length > 2) { // Only index words longer than 2 characters
                if (!this.searchIndex.has(word)) {
                    this.searchIndex.set(word, []);
                }
                this.searchIndex.get(word).push(node);
            }
        });
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('study-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Filter handlers
        const certFilter = document.getElementById('study-cert-filter');
        const topicFilter = document.getElementById('study-topic-filter');
        
        if (certFilter) {
            certFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (topicFilter) {
            topicFilter.addEventListener('change', () => this.applyFilters());
        }

        // Navigation buttons
        const prevBtn = document.getElementById('prev-content-btn');
        const nextBtn = document.getElementById('next-content-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigatePrevious());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateNext());
        }
    }

    handleSearch(query) {
        if (!query || query.length < 3) {
            this.renderStudyTree();
            return;
        }

        const results = this.searchContent(query);
        this.renderSearchResults(results);
    }

    searchContent(query) {
        const words = query.toLowerCase().match(/\b\w+\b/g) || [];
        const results = new Set();
        
        words.forEach(word => {
            if (this.searchIndex.has(word)) {
                this.searchIndex.get(word).forEach(node => results.add(node));
            }
        });
        
        return Array.from(results);
    }

    renderSearchResults(results) {
        const treeContainer = document.getElementById('study-tree');
        if (!treeContainer) return;

        treeContainer.innerHTML = '';

        if (results.length === 0) {
            treeContainer.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found</p>
                </div>
            `;
            return;
        }

        results.forEach(node => {
            const nodeElement = this.createTreeNode(node);
            treeContainer.appendChild(nodeElement);
        });
    }

    applyFilters() {
        const certFilter = document.getElementById('study-cert-filter');
        const topicFilter = document.getElementById('study-topic-filter');
        
        if (!certFilter || !topicFilter) return;

        const selectedCert = certFilter.value;
        const selectedTopic = topicFilter.value;

        // Clear search when applying filters
        const searchInput = document.getElementById('study-search');
        if (searchInput) searchInput.value = '';

        if (!selectedCert && !selectedTopic) {
            this.renderStudyTree();
            return;
        }

        const filteredNodes = [];
        
        if (selectedTopic) {
            const node = this.findNodeById(selectedTopic);
            if (node) filteredNodes.push(node);
        } else if (selectedCert) {
            const certNode = this.studyTree.get(selectedCert);
            if (certNode) {
                filteredNodes.push(certNode);
            }
        }

        this.renderFilteredTree(filteredNodes);
    }

    renderFilteredTree(nodes) {
        const treeContainer = document.getElementById('study-tree');
        if (!treeContainer) return;

        treeContainer.innerHTML = '';

        nodes.forEach(node => {
            const nodeElement = this.createTreeNode(node);
            treeContainer.appendChild(nodeElement);
        });
    }

    renderBookmarks() {
        const bookmarksList = document.getElementById('bookmarks-list');
        if (!bookmarksList) return;

        if (this.bookmarks.length === 0) {
            bookmarksList.innerHTML = `
                <div class="no-bookmarks">
                    <i class="fas fa-bookmark"></i>
                    <p>No bookmarks yet</p>
                </div>
            `;
            return;
        }

        bookmarksList.innerHTML = this.bookmarks.map(bookmark => `
            <div class="bookmark-item" onclick="studyManager.navigateToBookmark('${bookmark.id}')">
                <i class="fas fa-bookmark"></i>
                <span class="bookmark-title" title="${bookmark.path}">${bookmark.title}</span>
                <i class="fas fa-times bookmark-remove" onclick="event.stopPropagation(); studyManager.removeBookmark('${bookmark.id}')"></i>
            </div>
        `).join('');
    }

    navigateToBookmark(nodeId) {
        const node = this.findNodeById(nodeId);
        if (node) {
            this.selectNode(node);
        }
    }

    removeBookmark(nodeId) {
        const index = this.bookmarks.findIndex(b => b.id === nodeId);
        if (index >= 0) {
            this.bookmarks.splice(index, 1);
            localStorage.setItem('study-bookmarks', JSON.stringify(this.bookmarks));
            this.renderBookmarks();
            
            // Update bookmark button if this content is currently selected
            if (this.currentContent && this.currentContent.id === nodeId) {
                const btn = document.getElementById('bookmark-btn');
                if (btn) {
                    btn.innerHTML = '<i class="fas fa-bookmark"></i> Bookmark';
                }
            }
            
            showNotification('Bookmark removed', 'info');
        }
    }

    navigatePrevious() {
        if (!this.currentContent) return;

        const siblings = this.getNodeSiblings(this.currentContent);
        const currentIndex = siblings.findIndex(sibling => sibling.id === this.currentContent.id);
        
        if (currentIndex > 0) {
            this.selectNode(siblings[currentIndex - 1]);
        }
    }

    navigateNext() {
        if (!this.currentContent) return;

        const siblings = this.getNodeSiblings(this.currentContent);
        const currentIndex = siblings.findIndex(sibling => sibling.id === this.currentContent.id);
        
        if (currentIndex < siblings.length - 1) {
            this.selectNode(siblings[currentIndex + 1]);
        }
    }

    applyStoredPreferences() {
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
            const darkModeBtn = document.getElementById('dark-mode-btn');
            if (darkModeBtn) {
                darkModeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            }
        }
    }
}

// Global functions for UI interactions
function toggleSidebar() {
    const sidebar = document.querySelector('.study-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('active');
        
        if (!overlay) {
            const newOverlay = document.createElement('div');
            newOverlay.className = 'sidebar-overlay';
            newOverlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                newOverlay.remove();
            });
            document.body.appendChild(newOverlay);
            setTimeout(() => newOverlay.classList.add('active'), 10);
        }
    }
}

function toggleReadingMode() {
    const studySection = document.querySelector('.study-section');
    const btn = document.getElementById('reading-mode-btn');
    
    if (!studySection || !btn) return;
    
    studySection.classList.toggle('reading-mode');
    
    if (studySection.classList.contains('reading-mode')) {
        btn.innerHTML = '<i class="fas fa-columns"></i> Normal Mode';
    } else {
        btn.innerHTML = '<i class="fas fa-book-open"></i> Reading Mode';
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('dark-mode-btn');
    
    if (!btn) return;
    
    const isDark = document.body.classList.contains('dark-mode');
    btn.innerHTML = isDark ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';
    
    // Store preference
    localStorage.setItem('study-dark-mode', JSON.stringify(isDark));
}

function printContent() {
    const content = document.getElementById('study-content-body');
    if (!content) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Study Materials - Print</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                    h1, h2, h3, h4, h5, h6 { color: #333; margin-top: 24px; margin-bottom: 16px; }
                    p { margin-bottom: 16px; }
                    code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
                    pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
                    blockquote { border-left: 4px solid #ddd; padding-left: 16px; color: #666; }
                    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>${content.innerHTML}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function bookmarkContent() {
    const studyManager = window.studyManager;
    if (!studyManager || !studyManager.currentContent) return;
    
    const content = studyManager.currentContent;
    const bookmarkData = {
        id: content.id,
        title: content.title,
        path: studyManager.getNodePath(content).map(n => n.title).join(' > '),
        timestamp: new Date().toISOString()
    };
    
    const existingIndex = studyManager.bookmarks.findIndex(b => b.id === content.id);
    
    if (existingIndex >= 0) {
        studyManager.bookmarks.splice(existingIndex, 1);
        showNotification('Bookmark removed', 'info');
    } else {
        studyManager.bookmarks.push(bookmarkData);
        showNotification('Content bookmarked', 'success');
    }
    
    localStorage.setItem('study-bookmarks', JSON.stringify(studyManager.bookmarks));
    studyManager.renderBookmarks();
    
    // Update bookmark button
    const btn = document.getElementById('bookmark-btn');
    if (btn) {
        const isBookmarked = studyManager.bookmarks.some(b => b.id === content.id);
        btn.innerHTML = isBookmarked ? 
            '<i class="fas fa-bookmark" style="color: gold;"></i> Bookmarked' : 
            '<i class="fas fa-bookmark"></i> Bookmark';
    }
}

function previousContent() {
    if (window.studyManager) {
        window.studyManager.navigatePrevious();
    }
}

function nextContent() {
    if (window.studyManager) {
        window.studyManager.navigateNext();
    }
}

// Scroll to heading function for table of contents
function scrollToHeading(anchorId) {
    const element = document.getElementById(anchorId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
        });
        
        // Highlight the heading briefly
        element.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 2000);
    }
}

// Initialize study materials when the section becomes visible
function initializeStudyMaterials() {
    if (!window.studyManager) {
        window.studyManager = new StudyMaterialsManager();
    }
    return window.studyManager.init();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize when study section is first shown
        const studySection = document.getElementById('study');
        if (studySection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        initializeStudyMaterials();
                        observer.unobserve(entry.target);
                    }
                });
            });
            observer.observe(studySection);
        }
    });
} else {
    // DOM already loaded
    initializeStudyMaterials();
}
