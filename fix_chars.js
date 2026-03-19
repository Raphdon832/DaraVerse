const fs = require('fs');

const targetFile = 'src/screens/CyberQuestPlayerScreen.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

const regex = /const CHARACTER_COLORS: Record<string, \{ bg: string; text: string; icon: string \}> = \{[\s\S]*?\};/;

const replacement = `const CHARACTER_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
    dara: { bg: "#6C5CE7", text: "#fff", icon: "💜" },
    amina: { bg: "#00B894", text: "#fff", icon: "💚" },
    teacher: { bg: "#0984E3", text: "#fff", icon: "📘" },
    system: { bg: "#D63031", text: "#fff", icon: "⚠️" },
    narrator: { bg: "#636E72", text: "#fff", icon: "📖" },
    student: { bg: "#FDCB6E", text: "#2D3436", icon: "🗣️" },
};`;

let newContent = content.replace(regex, replacement);

fs.writeFileSync(targetFile, newContent, 'utf8');
console.log('Fixed characters in ' + targetFile);
