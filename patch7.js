const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/LanguageContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const enInsert = `
    items: "items",
    noItemsFound: "No items found",
`;

const viInsert = `
    items: "vật phẩm",
    noItemsFound: "Không tìm thấy vật phẩm nào",
`;

const zhInsert = `
    items: "物品",
    noItemsFound: "未找到物品",
`;

content = content.replace('uploadedImage: "Uploaded Image",', 'uploadedImage: "Uploaded Image",' + enInsert);
content = content.replace('uploadedImage: "Ảnh đã tải lên",', 'uploadedImage: "Ảnh đã tải lên",' + viInsert);
content = content.replace('uploadedImage: "已上传图片",', 'uploadedImage: "已上传图片",' + zhInsert);

fs.writeFileSync(filePath, content);
console.log("LanguageContext updated with items.");
