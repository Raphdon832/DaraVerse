const fs = require('fs');
let code = fs.readFileSync('src/screens/HomeHubScreen.tsx', 'utf8');

let t1 = code.indexOf('<View style={styles.sectionHeader}>\n            <Text style={[styles.sectionTitle, { color: adaptiveTextColor }]}>Today');
let t2 = code.indexOf('<View style={styles.sectionHeader}>\n            <Text style={[styles.sectionTitle, { color: adaptiveTextColor }]}>Mentor Live</Text>');

// Looking closer, I injected "\n\n          <View style={styles.sectionHeader}>\n            <Text style={[styles.sectionTitle, { color: adaptiveTextColor }]}>Today's Plan</Text>" previously
t1 = code.indexOf('\n\n\n\n          <View style={styles.sectionHeader}>\n            <Text style={[styles.sectionTitle, { color: adaptiveTextColor }]}>Today');
if (t1 === -1) {
    t1 = code.indexOf('          <View style={styles.sectionHeader}>\n            <Text style={[styles.sectionTitle, { color: adaptiveTextColor }]}>Today');
}

console.log('t1:', t1, 't2:', t2);

if (t1 !== -1 && t2 !== -1) {
    const repl = fs.readFileSync('fix_block.part', 'utf8');
    code = code.substring(0, t1) + repl + code.substring(t2);
    fs.writeFileSync('src/screens/HomeHubScreen.tsx', code, 'utf8');
    console.log('Fixed block');
}
