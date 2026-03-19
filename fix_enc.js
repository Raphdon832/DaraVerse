const fs = require('fs');
const path = require('path');

function fixEncoding(filePath) {
    let buf = fs.readFileSync(filePath);
    let str;
    
    if (buf[0] === 0xFF && buf[1] === 0xFE) {
        str = buf.toString('utf16le');
    } else if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
        str = buf.toString('utf8');
    } else {
        str = buf.toString('utf8');
        // If it includes the bad mojibake characters, we already messed it up, but let's just make sure it's saved as utf8 NO BOM.
    }
    
    fs.writeFileSync(filePath, str, 'utf8');
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            fixEncoding(fullPath);
        }
    }
}

processDirectory('src');
console.log('Fixed encodings to utf8 NO BOM');
