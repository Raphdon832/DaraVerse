const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Fix remaining Mojibake from powershell stripping
    newContent = newContent.replace(/€”/g, '—');
    newContent = newContent.replace(/€¦/g, '…');
    newContent = newContent.replace(/€¢/g, '•');
    newContent = newContent.replace(/˜Ÿ/g, '😟');
    newContent = newContent.replace(/˜„/g, '😄');
    newContent = newContent.replace(/˜Š/g, '😊');
    newContent = newContent.replace(/˜¨/g, '😨');
    newContent = newContent.replace(/¤”/g, '🤔');
    newContent = newContent.replace(/Ž®/g, '🎮');
    newContent = newContent.replace(/§©/g, '🧩');
    newContent = newContent.replace(/ †/g, '🏆');
    newContent = newContent.replace(/”“/g, '🔓');

    if (filePath.includes('CyberQuestPlayerScreen.tsx')) {
        newContent = newContent.replace(/n\.isCorrect \? "…" : "¡"/g, 'n.isCorrect ? "✅" : "⚡"');
    }

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Fixed:', filePath);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

processDirectory('src');
console.log('Done.');
