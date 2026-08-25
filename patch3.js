const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/LanguageContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const enInsert = `
    marketplaceSubtitle: "Personalize your study space",
    categories: "CATEGORIES",
    all: "All",
    myImages: "My Images",
    lighting: "Lighting",
    sound: "Sound",
    pet: "Pet",
    effects: "Effects",
    cursor: "Cursor",
    badge: "Badge",
    searchItems: "Search items...",
    sortFeatured: "Featured",
    sortNewest: "Newest",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    dailyShop: "Daily Shop",
    dailyShopDesc: "Discounted items every day",
    viewNow: "View now →",
    uploadNewImage: "Upload New Image",
    uploadNewImageDesc: "Unlock the ability to upload your own background image",
    uploadImageBtn: "Upload Image",
    equippedStatus: "Equipped",
    unequip: "Unequip",
`;

const viInsert = `
    marketplaceSubtitle: "Cá nhân hóa không gian học tập của bạn",
    categories: "DANH MỤC",
    all: "Tất cả",
    myImages: "Ảnh của tôi",
    lighting: "Ánh sáng",
    sound: "Âm thanh",
    pet: "Pet",
    effects: "Hiệu ứng",
    cursor: "Con trỏ",
    badge: "Huy hiệu",
    searchItems: "Tìm kiếm vật phẩm...",
    sortFeatured: "Nổi bật",
    sortNewest: "Mới nhất",
    sortPriceAsc: "Giá thấp - cao",
    sortPriceDesc: "Giá cao - thấp",
    dailyShop: "Daily Shop",
    dailyShopDesc: "Vật phẩm giảm giá mỗi ngày",
    viewNow: "Xem ngay →",
    uploadNewImage: "Tải ảnh mới",
    uploadNewImageDesc: "Mở khóa tính năng tự tải ảnh nền từ thiết bị của bạn",
    uploadImageBtn: "Tải ảnh lên",
    equippedStatus: "Đang sử dụng",
    unequip: "Bỏ sử dụng",
`;

const zhInsert = `
    marketplaceSubtitle: "个性化您的学习空间",
    categories: "分类",
    all: "全部",
    myImages: "我的图片",
    lighting: "灯光",
    sound: "声音",
    pet: "宠物",
    effects: "效果",
    cursor: "光标",
    badge: "徽章",
    searchItems: "搜索物品...",
    sortFeatured: "推荐",
    sortNewest: "最新",
    sortPriceAsc: "价格: 从低到高",
    sortPriceDesc: "价格: 从高到低",
    dailyShop: "每日商店",
    dailyShopDesc: "每天都有打折商品",
    viewNow: "立即查看 →",
    uploadNewImage: "上传新图片",
    uploadNewImageDesc: "解锁从设备上传自定义背景图片的功能",
    uploadImageBtn: "上传图片",
    equippedStatus: "已装备",
    unequip: "取消装备",
`;

content = content.replace('saveSettings: "Save Settings",', 'saveSettings: "Save Settings",' + enInsert);
content = content.replace('saveSettings: "Lưu Cài Đặt",', 'saveSettings: "Lưu Cài Đặt",' + viInsert);
content = content.replace('saveSettings: "保存设置",', 'saveSettings: "保存设置",' + zhInsert);

fs.writeFileSync(filePath, content);
console.log("LanguageContext updated.");
