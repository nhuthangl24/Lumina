const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/LanguageContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const enInsert = `
    todayWillDo: "Today I will do...",
    add: "Add",
    noTasksYet: "No tasks yet. Add a goal for today!",
    personalReport: "Personal Report",
    summaryCard: "Summary Card",
    nowPlaying: "Now Playing",
    syncPlayingForRoom: "Playing synced for room",
    nominateMusic: "Nominate Music",
    enterYoutubeId: "Enter YouTube Video ID...",
    changeMusic: "Change Music",
    nominate: "Nominate",
    voteList: "Vote List (Auto-change over 50%)",
    today: "Today",
    totalFocus: "Total Focus",
    leaderboard: "Leaderboard",
`;

const viInsert = `
    todayWillDo: "Hôm nay tôi sẽ làm...",
    add: "Thêm",
    noTasksYet: "Chưa có nhiệm vụ nào. Hãy thêm mục tiêu cho hôm nay!",
    personalReport: "Báo cáo cá nhân",
    summaryCard: "Thẻ tổng kết",
    nowPlaying: "Đang phát",
    syncPlayingForRoom: "Phát đồng bộ cho cả phòng",
    nominateMusic: "Đề cử nhạc",
    enterYoutubeId: "Nhập YouTube Video ID...",
    changeMusic: "Đổi nhạc",
    nominate: "Đề cử",
    voteList: "Danh sách bình chọn (Quá 50% sẽ tự đổi)",
    today: "Hôm nay",
    totalFocus: "Tổng Focus",
    leaderboard: "Bảng xếp hạng",
`;

const zhInsert = `
    todayWillDo: "今天我将做...",
    add: "添加",
    noTasksYet: "暂无任务。为今天添加一个目标吧！",
    personalReport: "个人报告",
    summaryCard: "总结卡片",
    nowPlaying: "正在播放",
    syncPlayingForRoom: "全房间同步播放",
    nominateMusic: "提名音乐",
    enterYoutubeId: "输入 YouTube 视频 ID...",
    changeMusic: "更换音乐",
    nominate: "提名",
    voteList: "投票列表（超过 50% 将自动更换）",
    today: "今天",
    totalFocus: "总专注时间",
    leaderboard: "排行榜",
`;

content = content.replace('timeSyncsWithRoom: "Time syncs with room",', 'timeSyncsWithRoom: "Time syncs with room",\n' + enInsert);
content = content.replace('timeSyncsWithRoom: "Thời gian chạy theo phòng",', 'timeSyncsWithRoom: "Thời gian chạy theo phòng",\n' + viInsert);
content = content.replace('timeSyncsWithRoom: "时间与房间同步",', 'timeSyncsWithRoom: "时间与房间同步",\n' + zhInsert);

fs.writeFileSync(filePath, content);
console.log("LanguageContext updated with more room translations.");
