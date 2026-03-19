const fs = require('fs');
let c = fs.readFileSync('src/screens/STEMTriviaPlayerScreen.tsx', 'utf8');
c = c.replace(/\{isLastQuestion \? "[^"]*Finish Quiz" : "Next Question"\}/g, '{isLastQuestion ? "🏆  Finish Quiz" : "Next Question"}');
fs.writeFileSync('src/screens/STEMTriviaPlayerScreen.tsx', c, 'utf8');
console.log('Fixed STEM!');
