const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/LanguageContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const enInsert = `
    markAllAsRead: "Mark all as read",
    noNotifications: "No notifications.",
`;

const viInsert = `
    markAllAsRead: "Đã đọc tất cả",
    noNotifications: "Không có thông báo nào.",
`;

const zhInsert = `
    markAllAsRead: "全部标为已读",
    noNotifications: "暂无通知。",
`;

content = content.replace('noItemsFound: "No items found",', 'noItemsFound: "No items found",' + enInsert);
content = content.replace('noItemsFound: "Không tìm thấy vật phẩm nào",', 'noItemsFound: "Không tìm thấy vật phẩm nào",' + viInsert);
content = content.replace('noItemsFound: "未找到物品",', 'noItemsFound: "未找到物品",' + zhInsert);

fs.writeFileSync(filePath, content);
console.log("LanguageContext updated with notifications.");
