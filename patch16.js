const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/room/VirtualRoomWidget.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'placeholder="Hôm nay tôi sẽ làm..."',
  'placeholder={t("todayWillDo")}'
);

content = content.replace(
  '<button onClick={handleAddTask} className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-xl text-xs font-semibold transition-colors">\n                  Thêm\n                </button>',
  '<button onClick={handleAddTask} className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-xl text-xs font-semibold transition-colors">\n                  {t("add")}\n                </button>'
);

content = content.replace(
  '<p className="text-white/30 text-sm text-center py-4">Chưa có nhiệm vụ nào. Hãy thêm mục tiêu cho hôm nay!</p>',
  '<p className="text-white/30 text-sm text-center py-4">{t("noTasksYet")}</p>'
);

content = content.replace(
  '<h4 className="text-white/80 text-sm font-semibold">Báo cáo cá nhân</h4>',
  '<h4 className="text-white/80 text-sm font-semibold">{t("personalReport")}</h4>'
);

content = content.replace(
  '<Download className="w-3 h-3" /> Thẻ tổng kết',
  '<Download className="w-3 h-3" /> {t("summaryCard")}'
);

content = content.replace(
  '<h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Đang phát</h4>',
  '<h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">{t("nowPlaying")}</h4>'
);

content = content.replace(
  '<p className="text-white/40 text-xs">Phát đồng bộ cho cả phòng</p>',
  '<p className="text-white/40 text-xs">{t("syncPlayingForRoom")}</p>'
);

content = content.replace(
  '<h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Đề cử nhạc</h4>',
  '<h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">{t("nominateMusic")}</h4>'
);

content = content.replace(
  'placeholder="Nhập YouTube Video ID..."',
  'placeholder={t("enterYoutubeId")}'
);

content = content.replace(
  '{isHost ? "Đổi nhạc" : "Đề cử"}',
  '{isHost ? t("changeMusic") : t("nominate")}'
);

content = content.replace(
  '<p className="text-white/40 text-[10px] uppercase">Danh sách bình chọn (Quá 50% sẽ tự đổi)</p>',
  '<p className="text-white/40 text-[10px] uppercase">{t("voteList")}</p>'
);

content = content.replace(
  '<h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3"> Hôm nay</h4>',
  '<h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3"> {t("today")}</h4>'
);

content = content.replace(
  '<p className="text-white/40 text-[10px]">Tổng Focus</p>',
  '<p className="text-white/40 text-[10px]">{t("totalFocus")}</p>'
);

content = content.replace(
  '<h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3"> Bảng xếp hạng</h4>',
  '<h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3"> {t("leaderboard")}</h4>'
);


fs.writeFileSync(filePath, content);
console.log("VirtualRoomWidget updated with all remaining translations.");
