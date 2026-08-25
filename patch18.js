const fs = require('fs');
const path = require('path');

const langPath = path.join(__dirname, 'src/lib/LanguageContext.tsx');
let langContent = fs.readFileSync(langPath, 'utf8');

langContent = langContent.replace('chat: "Nhắn tin",', "");

fs.writeFileSync(langPath, langContent);
console.log("LanguageContext duplicate chat removed.");

