// Markdown to HTML Converter
class MarkdownConverter {
    constructor() {
        this.htmlCache = new Map();
    }

    // Convert markdown content to HTML
    convertToHtml(markdown) {
        if (!markdown) return '';

        let html = markdown;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.*?)_/g, '<em>$1</em>');

        // Code blocks
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'text';
            return `<pre><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>`;
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Images
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" class="markdown-image">');

        // Lists
        html = this.convertLists(html);

        // Tables
        html = this.convertTables(html);

        // Blockquotes
        html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

        // Horizontal rules
        html = html.replace(/^---$/gim, '<hr>');

        // Line breaks
        html = html.replace(/\n/g, '<br>');

        // Clean up multiple breaks
        html = html.replace(/(<br>){3,}/g, '<br><br>');

        return html;
    }

    convertLists(html) {
        // Unordered lists
        const ulRegex = /^[\s]*[-*+] (.+)$/gm;
        let matches = [];
        let match;

        while ((match = ulRegex.exec(html)) !== null) {
            matches.push(match);
        }

        if (matches.length > 0) {
            let listItems = matches.map(m => `<li>${m[1]}</li>`).join('\n');
            html = html.replace(ulRegex, '');
            html += `<ul>\n${listItems}\n</ul>`;
        }

        // Ordered lists
        const olRegex = /^[\s]*\d+\. (.+)$/gm;
        matches = [];

        while ((match = olRegex.exec(html)) !== null) {
            matches.push(match);
        }

        if (matches.length > 0) {
            let listItems = matches.map(m => `<li>${m[1]}</li>`).join('\n');
            html = html.replace(olRegex, '');
            html += `<ol>\n${listItems}\n</ol>`;
        }

        return html;
    }

    convertTables(html) {
        const tableRegex = /^(\|.+\|)\n(\|[-\s:]+\|)\n((?:\|.+\|\n?)+)/gm;
        
        return html.replace(tableRegex, (match, header, separator, rows) => {
            const headerCells = header.split('|').slice(1, -1).map(cell => 
                `<th>${cell.trim()}</th>`
            ).join('');
            
            const rowsHtml = rows.trim().split('\n').map(row => {
                const cells = row.split('|').slice(1, -1).map(cell => 
                    `<td>${cell.trim()}</td>`
                ).join('');
                return `<tr>${cells}</tr>`;
            }).join('\n');

            return `<table class="markdown-table">
                <thead><tr>${headerCells}</tr></thead>
                <tbody>${rowsHtml}</tbody>
            </table>`;
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Load and convert markdown file to HTML
    async loadMarkdownFile(filePath) {
        try {
            // Check cache first
            if (this.htmlCache.has(filePath)) {
                return this.htmlCache.get(filePath);
            }

            // Handle relative paths - convert to absolute URLs if needed
            let fullPath = filePath;
            if (filePath.startsWith('./')) {
                fullPath = filePath.substring(2);
            }

            const response = await fetch(fullPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const markdown = await response.text();
            
            // Check if we got actual markdown content (not a 404 page)
            if (markdown.includes('<!DOCTYPE html>') || markdown.includes('<html')) {
                throw new Error('File not found - received HTML instead of markdown');
            }
            
            const html = this.convertToHtml(markdown);
            
            // Cache the result
            this.htmlCache.set(filePath, html);
            
            return html;
        } catch (error) {
            console.error('Error loading markdown file:', error);
            
            // Return a helpful error message with suggestions
            return `<div class="error-message">
                <h3><i class="fas fa-exclamation-triangle"></i> Content Not Available</h3>
                <p><strong>File:</strong> ${filePath}</p>
                <p><strong>Error:</strong> ${error.message}</p>
                <div class="error-suggestions">
                    <h4>Possible Solutions:</h4>
                    <ul>
                        <li>Check if the file exists in your repository</li>
                        <li>Ensure the file path is correct</li>
                        <li>Verify the file has markdown content (.md extension)</li>
                        <li>Try refreshing the page</li>
                    </ul>
                </div>
                <div class="error-actions">
                    <button class="btn btn-outline btn-sm" onclick="location.reload()">
                        <i class="fas fa-refresh"></i> Refresh Page
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="window.markdownConverter.clearCache()">
                        <i class="fas fa-trash"></i> Clear Cache
                    </button>
                </div>
            </div>`;
        }
    }

    // Clear cache method
    clearCache() {
        this.htmlCache.clear();
        console.log('Markdown cache cleared');
    }

    // Extract table of contents from markdown
    extractTOC(markdown) {
        const headings = [];
        const lines = markdown.split('\n');
        
        lines.forEach((line, index) => {
            const match = line.match(/^(#{1,6})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const title = match[2];
                const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                
                headings.push({
                    level,
                    title,
                    id,
                    line: index
                });
            }
        });
        
        return headings;
    }

    // Generate navigation from TOC
    generateNavigation(toc) {
        if (toc.length === 0) return '';
        
        let nav = '<div class="content-navigation"><h4>Contents</h4><ul class="toc-list">';
        
        toc.forEach(heading => {
            const indent = 'margin-left: ' + ((heading.level - 1) * 1.5) + 'rem;';
            nav += `<li style="${indent}">
                <a href="#${heading.id}" class="toc-link" data-level="${heading.level}">
                    ${heading.title}
                </a>
            </li>`;
        });
        
        nav += '</ul></div>';
        return nav;
    }

    // Add IDs to headings for navigation
    addHeadingIds(html) {
        return html.replace(/<h([1-6])>([^<]+)<\/h[1-6]>/g, (match, level, title) => {
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            return `<h${level} id="${id}">${title}</h${level}>`;
        });
    }

    // Process markdown with navigation
    async processMarkdownWithNav(filePath) {
        try {
            // Handle relative paths
            let fullPath = filePath;
            if (filePath.startsWith('./')) {
                fullPath = filePath.substring(2);
            }

            const response = await fetch(fullPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const markdown = await response.text();
            
            // Check if we got actual markdown content
            if (markdown.includes('<!DOCTYPE html>') || markdown.includes('<html')) {
                throw new Error('File not found - received HTML instead of markdown');
            }

            const toc = this.extractTOC(markdown);
            let html = this.convertToHtml(markdown);
            html = this.addHeadingIds(html);
            
            const navigation = this.generateNavigation(toc);
            
            return {
                html,
                navigation,
                toc,
                title: this.extractTitle(markdown),
                success: true
            };
        } catch (error) {
            console.error('Error processing markdown:', error);
            return {
                html: `<div class="error-message">
                    <h3><i class="fas fa-exclamation-triangle"></i> Content Not Available</h3>
                    <p><strong>File:</strong> ${filePath}</p>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <div class="error-suggestions">
                        <h4>This might help:</h4>
                        <ul>
                            <li>Check if the study material exists in your repository</li>
                            <li>Ensure you're running the platform from the correct directory</li>
                            <li>Verify the file path is correct: <code>${filePath}</code></li>
                            <li>Try creating the missing study material</li>
                        </ul>
                    </div>
                    <div class="error-actions">
                        <button class="btn btn-primary btn-sm" onclick="app.createStudyMaterial('${filePath}')">
                            <i class="fas fa-plus"></i> Create Study Material
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="location.reload()">
                            <i class="fas fa-refresh"></i> Refresh
                        </button>
                    </div>
                </div>`,
                navigation: '',
                toc: [],
                title: 'Content Not Available',
                success: false
            };
        }
    }

    extractTitle(markdown) {
        const match = markdown.match(/^# (.+)$/m);
        return match ? match[1] : 'Study Material';
    }
}

// Global instance
window.markdownConverter = new MarkdownConverter();
