const fs = require('fs');
const path = require('path');

// Function to recursively find all HTML files
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'includes') {
            findHtmlFiles(filePath, fileList);
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Function to calculate relative path to assets directory
function getRelativeAssetsPath(filePath) {
    const depth = filePath.split(path.sep).length - 1;
    return depth === 0 ? 'assets/' : '../'.repeat(depth) + 'assets/';
}

// Function to update HTML file with new include system
function updateHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const assetsPath = getRelativeAssetsPath(filePath);
    let updated = false;
    
    // Replace object tag header includes with div data-include
    const objectHeaderPattern = /<object data="[^"]*header\.html"[^>]*>[\s\S]*?<\/object>/g;
    if (objectHeaderPattern.test(content)) {
        content = content.replace(objectHeaderPattern, (match) => {
            // Extract the fallback content
            const fallbackMatch = match.match(/<!-- Fallback[^>]*-->([\s\S]*?)(?=<\/object>)/);
            const fallbackContent = fallbackMatch ? fallbackMatch[1].trim() : `
        <header class="header">
            <nav class="nav">
                <a href="index.html" class="logo">Lachlan Allison</a>
                <ul class="nav-links">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="blogs/index.html">Blogs</a></li>
                    <li><a href="photos/index.html">Photos</a></li>
                    <li><a href="projects/index.html">Projects</a></li>
                    <li><a href="now/index.html">Now</a></li>
                    <li><a href="contact/index.html">Contact</a></li>
                </ul>
            </nav>
        </header>`;
            
            return `<div data-include="header">
        <!-- Fallback content if JavaScript fails -->${fallbackContent}
    </div>`;
        });
        updated = true;
        console.log(`Updated header in: ${filePath}`);
    }
    
    // Replace object tag footer includes with div data-include
    const objectFooterPattern = /<object data="[^"]*footer\.html"[^>]*>[\s\S]*?<\/object>/g;
    if (objectFooterPattern.test(content)) {
        content = content.replace(objectFooterPattern, (match) => {
            // Extract the fallback content
            const fallbackMatch = match.match(/<!-- Fallback[^>]*-->([\s\S]*?)(?=<\/object>)/);
            const fallbackContent = fallbackMatch ? fallbackMatch[1].trim() : `
        <footer class="footer">
            <div class="footer-links">
                <a href="mailto:hello@lachlanallison.com">Email</a>
                <a href="https://github.com/lachlanallison" target="_blank" rel="noopener">GitHub</a>
                <a href="https://linkedin.com/in/lachlanallison" target="_blank" rel="noopener">LinkedIn</a>
                <a href="https://twitter.com/lachlanallison" target="_blank" rel="noopener">Twitter</a>
            </div>
            <p>&copy; 2025 Lachlan Allison. All rights reserved.</p>
        </footer>`;
            
            return `<div data-include="footer">
        <!-- Fallback content if JavaScript fails -->${fallbackContent}
    </div>`;
        });
        updated = true;
        console.log(`Updated footer in: ${filePath}`);
    }
    
    // Add includes.js script if not present and we made updates
    if (updated && !content.includes('includes.js')) {
        const scriptPattern = /(<script src="[^"]*main\.js"><\/script>)/;
        if (scriptPattern.test(content)) {
            content = content.replace(scriptPattern, `$1
    <script src="${assetsPath}js/includes.js"></script>`);
            console.log(`Added includes.js script to: ${filePath}`);
        }
    }
    
    if (updated) {
        fs.writeFileSync(filePath, content);
    }
}

// Main execution
console.log('Finding HTML files...');
const htmlFiles = findHtmlFiles('.');

// Filter out include files themselves
const filesToUpdate = htmlFiles.filter(file => !file.includes('includes/'));

console.log(`Found ${filesToUpdate.length} files to check:`);
filesToUpdate.forEach(file => console.log(`  ${file}`));

console.log('\nUpdating files...');
let updatedCount = 0;
filesToUpdate.forEach(file => {
    const beforeContent = fs.readFileSync(file, 'utf8');
    updateHtmlFile(file);
    const afterContent = fs.readFileSync(file, 'utf8');
    if (beforeContent !== afterContent) {
        updatedCount++;
    }
});

console.log(`\nDone! Updated ${updatedCount} files to use the new JavaScript include system.`); 