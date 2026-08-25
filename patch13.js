const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/LanguageContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const enInsert = `
    leaveRoom: "Leave Room",
    personalSettings: "Personal Settings",
    youAreHost: "You are the Host",
    hostClockDesc: "Your clock is the standard reference time for everyone in the room.",
    syncPomodoro: "Sync Pomodoro",
    timeSyncsWithRoom: "Time syncs with room",
`;

const viInsert = `
    leaveRoom: "Rời phòng",
    personalSettings: "Cài đặt cá nhân",
    youAreHost: "Bạn là Chủ phòng",
    hostClockDesc: "Đồng hồ của bạn là mốc thời gian chuẩn cho toàn bộ thành viên trong phòng.",
    syncPomodoro: "Đồng bộ Pomodoro",
    timeSyncsWithRoom: "Thời gian chạy theo phòng",
`;

const zhInsert = `
    leaveRoom: "离开房间",
    personalSettings: "个人设置",
    youAreHost: "您是房主",
    hostClockDesc: "您的时钟是房间内所有人的标准参考时间。",
    syncPomodoro: "同步番茄钟",
    timeSyncsWithRoom: "时间与房间同步",
`;

content = content.replace('maxTier: "Max Tier",', 'maxTier: "Max Tier",\n' + enInsert);
content = content.replace('maxTier: "Tối đa",', 'maxTier: "Tối đa",\n' + viInsert);
content = content.replace('maxTier: "最高级别",', 'maxTier: "最高级别",\n' + zhInsert);

fs.writeFileSync(filePath, content);
console.log("LanguageContext updated with room settings translations.");
