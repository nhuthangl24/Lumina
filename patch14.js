const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/room/VirtualRoomWidget.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  '<ArrowLeft className="w-3 h-3" /> Rời phòng',
  '<ArrowLeft className="w-3 h-3" /> {t("leaveRoom")}'
);

content = content.replace(
  '<h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Cài đặt cá nhân</h4>',
  '<h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">{t("personalSettings")}</h4>'
);

content = content.replace(
  '<p className="text-white text-sm font-semibold">Bạn là Chủ phòng</p>',
  '<p className="text-white text-sm font-semibold">{t("youAreHost")}</p>'
);

content = content.replace(
  '<p className="text-white/40 text-xs mt-1">Đồng hồ của bạn là mốc thời gian chuẩn cho toàn bộ thành viên trong phòng.</p>',
  '<p className="text-white/40 text-xs mt-1">{t("hostClockDesc")}</p>'
);

content = content.replace(
  '<span className="text-white text-sm font-semibold">Đồng bộ Pomodoro</span>',
  '<span className="text-white text-sm font-semibold">{t("syncPomodoro")}</span>'
);

content = content.replace(
  '<p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Thời gian chạy theo phòng</p>',
  '<p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">{t("timeSyncsWithRoom")}</p>'
);

fs.writeFileSync(filePath, content);
console.log("VirtualRoomWidget updated with room settings translations.");
