const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/LanguageContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const enInsert = `
    roomTheme: "Room Theme",
    uploadedImage: "Uploaded Image",
`;

const viInsert = `
    roomTheme: "Theme Phòng",
    uploadedImage: "Ảnh đã tải lên",
`;

const zhInsert = `
    roomTheme: "房间主题",
    uploadedImage: "已上传图片",
`;

content = content.replace('marketplaceSubtitle: "Personalize your study space",', 'marketplaceSubtitle: "Personalize your study space",' + enInsert);
content = content.replace('marketplaceSubtitle: "Cá nhân hóa không gian học tập của bạn",', 'marketplaceSubtitle: "Cá nhân hóa không gian học tập của bạn",' + viInsert);
content = content.replace('marketplaceSubtitle: "个性化您的学习空间",', 'marketplaceSubtitle: "个性化您的学习空间",' + zhInsert);

fs.writeFileSync(filePath, content);
console.log("LanguageContext updated again.");
