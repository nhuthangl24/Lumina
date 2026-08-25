const fs = require('fs');
const path = require('path');

const roomPath = path.join(__dirname, 'src/components/room/VirtualRoomWidget.tsx');
let roomContent = fs.readFileSync(roomPath, 'utf8');

roomContent = roomContent.replace(
  'function RoomLobby({ onJoinRoom }: { onJoinRoom: (room: RoomData) => void }) {\n  const { data: session } = useSession();',
  'function RoomLobby({ onJoinRoom }: { onJoinRoom: (room: RoomData) => void }) {\n  const { t } = useLanguage();\n  const { data: session } = useSession();'
);
fs.writeFileSync(roomPath, roomContent);
console.log("VirtualRoomWidget patched to add t to RoomLobby");

// Fix LanguageContext duplicates
const langPath = path.join(__dirname, 'src/lib/LanguageContext.tsx');
let langContent = fs.readFileSync(langPath, 'utf8');

const keysToFix = [
  'loading: "Loading...",', 'loading: "Đang tải...",', 'loading: "加载中...",',
  'chat: "Chat",', 'chat: "Trò chuyện",', 'chat: "聊天",',
  'logout: "Log Out",', 'logout: "Đăng xuất",', 'logout: "登出",',
  'totalPomodoros: "Total Pomodoros",', 'totalPomodoros: "Tổng Pomodoro",', 'totalPomodoros: "番茄钟总数",',
  'silverTier: "Silver",', 'silverTier: "Bạc",', 'silverTier: "白银",',
  'goldTier: "Gold",', 'goldTier: "Vàng",', 'goldTier: "黄金",',
  'platinumTier: "Platinum",', 'platinumTier: "Bạch Kim",', 'platinumTier: "铂金",',
  'diamondTier: "Diamond",', 'diamondTier: "Kim Cương",', 'diamondTier: "钻石",',
  'masterTier: "Master",', 'masterTier: "Bậc Thầy",', 'masterTier: "大师",',
  'nowPlaying: "Now Playing",', 'nowPlaying: "Đang phát",', 'nowPlaying: "正在播放",',
  'changeMusic: "Change Music",', 'changeMusic: "Đổi nhạc",', 'changeMusic: "更换音乐",',
  'leaderboard: "Leaderboard",', 'leaderboard: "Bảng xếp hạng",', 'leaderboard: "排行榜",'
];

keysToFix.forEach(k => {
  langContent = langContent.replace(k, ""); 
});

fs.writeFileSync(langPath, langContent);
console.log("LanguageContext duplicates removed.");

