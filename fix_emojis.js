const fs = require('fs');
const path = require('path');

const replacements = {
    'ðŸ’œ': '',
    'ðŸš': '',
    'ðŸ': '',
    'âšï ': '',
    'ðŸ': '',
    'ðŸï ': '',
    'ðŸŸ': '',
    'ðŸ': '',
    'ðŸŠ': '',
    'ðŸ': '',
    'ðŸ': '',
    'âœ': '',
    'âš': '',
    'ðŸŽ': '',
    'ðŸ': '',
    'ðŸ ': '',
    'ðŸ': '',
    'â': '',
    'â': '',
    'â': '',
    'â': '',
    'ââ': ''
};

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;
    
    for (const [k, v] of Object.entries(replacements)) {
        newContent = newContent.split(k).join(v);
    }

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log('Fixed ' + filePath);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

processDirectory('src');
console.log('Done');
