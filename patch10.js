const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/LanguageContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const enInsert = `
    logout: "Log Out",
    currentTier: "Current Tier",
    maxLevelReached: "Max Level Reached",
    totalPomodoros: "Total Pomodoros",
    currentStreak: "Current Streak",
    days: "days",
    pomodoroCompleted: "Pomodoro Completed",
    pomodoroFocusMessage: "You have focused for {sessions} sessions",
    taskCompleted: "Task Completed",
    taskCompletionMessage: "You have completed {tasks} tasks",
    xpToNextTier: "{pct}% to {nextTier}",
    
    bronzeMember: "Bronze Member",
    silverMember: "Silver Member",
    goldMember: "Gold Member",
    platinumMember: "Platinum Member",
    diamondMember: "Diamond Member",
    masterMember: "Master Member",
    
    silverTier: "Silver",
    goldTier: "Gold",
    platinumTier: "Platinum",
    diamondTier: "Diamond",
    masterTier: "Master",
    maxTier: "Max Tier",
`;

const viInsert = `
    logout: "Đăng xuất",
    currentTier: "Hạng Hiện Tại",
    maxLevelReached: "Đã đạt cấp tối đa",
    totalPomodoros: "Tổng Pomodoro",
    currentStreak: "Chuỗi ngày",
    days: "ngày",
    pomodoroCompleted: "Hoàn thành Pomodoro",
    pomodoroFocusMessage: "Bạn đã tập trung được {sessions} phiên",
    taskCompleted: "Hoàn thành nhiệm vụ",
    taskCompletionMessage: "Bạn đã hoàn thành {tasks} nhiệm vụ",
    xpToNextTier: "{pct}% nữa lên {nextTier}",
    
    bronzeMember: "Thành viên Đồng",
    silverMember: "Thành viên Bạc",
    goldMember: "Thành viên Vàng",
    platinumMember: "Thành viên Bạch Kim",
    diamondMember: "Thành viên Kim Cương",
    masterMember: "Thành viên Bậc Thầy",
    
    silverTier: "Bạc",
    goldTier: "Vàng",
    platinumTier: "Bạch Kim",
    diamondTier: "Kim Cương",
    masterTier: "Bậc Thầy",
    maxTier: "Tối đa",
`;

const zhInsert = `
    logout: "登出",
    currentTier: "当前等级",
    maxLevelReached: "已达最高等级",
    totalPomodoros: "番茄钟总数",
    currentStreak: "连续打卡",
    days: "天",
    pomodoroCompleted: "番茄钟完成",
    pomodoroFocusMessage: "您已专注了 {sessions} 个阶段",
    taskCompleted: "任务完成",
    taskCompletionMessage: "您已完成了 {tasks} 个任务",
    xpToNextTier: "距离 {nextTier} 还有 {pct}%",
    
    bronzeMember: "青铜会员",
    silverMember: "白银会员",
    goldMember: "黄金会员",
    platinumMember: "铂金会员",
    diamondMember: "钻石会员",
    masterMember: "大师会员",
    
    silverTier: "白银",
    goldTier: "黄金",
    platinumTier: "铂金",
    diamondTier: "钻石",
    masterTier: "大师",
    maxTier: "最高级别",
`;

content = content.replace('noNotifications: "No notifications.",', 'noNotifications: "No notifications.",' + enInsert);
content = content.replace('noNotifications: "Không có thông báo nào.",', 'noNotifications: "Không có thông báo nào.",' + viInsert);
content = content.replace('noNotifications: "暂无通知。",', 'noNotifications: "暂无通知。",' + zhInsert);

fs.writeFileSync(filePath, content);
console.log("LanguageContext updated with dashboard translations.");
