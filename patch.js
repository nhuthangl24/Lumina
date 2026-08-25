const fs = require('fs');
const path = require('path');

const replacements = {
  // VirtualRoomWidget.tsx
  'toast.success("Phòng đã được tạo!");': 'toast.success(t("roomCreated"));',
  'toast.error("Lỗi tạo phòng, vui lòng thử lại!");': 'toast.error(t("roomCreateError"));',
  'toast.error("Lỗi hệ thống!");': 'toast.error(t("systemError"));',
  'toast.success("Đã vào phòng!");': 'toast.success(t("roomJoined"));',
  'toast.error("Lỗi tham gia phòng!");': 'toast.error(t("roomJoinError"));',
  'toast.error("Không tìm thấy phòng!");': 'toast.error(t("roomNotFound"));',
  'toast.error("Lỗi tải danh sách phòng!");': 'toast.error(t("roomListError"));',
  'toast.success(`Đã vào phòng "${room.name}"!`);': 'toast.success(t("roomJoined"));',
  'toast(`👋 ${data.userName} đã vào phòng!`);': 'toast(`👋 ${data.userName} ${t("roomJoined")}`);',
  'toast.error("Bạn đã bị chủ phòng mời ra ngoài.");': 'toast.error(t("userKicked"));',
  'toast("🎵 Nhạc phòng đã được đổi!");': 'toast(t("musicChanged"));',
  'toast.success("✅ Xác nhận thành công!");': 'toast.success(t("confirmSuccess"));',
  'toast.error("Phòng đã bị đóng hoặc bị lỗi (500)!");': 'toast.error(t("roomClosed"));',
  'toast.error("Lỗi kết nối phòng!");': 'toast.error(t("roomConnectError"));',
  'toast.success(next ? "Đã BẬT đồng bộ với phòng" : "Đã TẮT đồng bộ với phòng");': 'toast.success(next ? t("syncOn") : t("syncOff"));',
  'toast.success("Đã đuổi người dùng.");': 'toast.success(t("userKicked"));',
  'toast.error("Không thể đuổi người dùng.");': 'toast.error(t("userKickError"));',
  'toast.error("Tính năng Mute đang được phát triển!");': 'toast.error(t("muteDev"));',
  'toast.error("Đã cấm người dùng này vào phòng!");': 'toast.error(t("userBanned"));',
  
  // MarketplaceModal.tsx
  'toast.error("Không thể tải Marketplace");': 'toast.error(t("loadMarketplaceError"));',
  'toast.error("Vui lòng đăng nhập!");': 'toast.error(t("pleaseLogin"));',
  'toast.error(data.error || "Mua thất bại");': 'toast.error(data.error || t("purchaseFailed"));',
  'toast.success(`🎉 Mua thành công "${item.name}"!`);': 'toast.success(`🎉 ${t("purchaseSuccess")} "${item.name}"!`);',
  'toast.error("Lỗi kết nối, thử lại nhé!");': 'toast.error(t("systemError"));',
  'toast.success(`🖼️ Đã trang bị "${item.name}"`);': 'toast.success(`🖼️ ${t("equipSuccess")} "${item.name}"`);',
  'toast.success(`🐱 Pet "${item.name}" đã xuất hiện!`);': 'toast.success(`🐱 ${item.name} ${t("petSpawned")}`);',
  'toast.success(`🌤️ Thời tiết "${item.name}" đã bật`);': 'toast.success(`🌤️ ${item.name} ${t("effectOn")}`);',
  'toast.success(`💡 Ánh sáng "${item.name}" đã bật`);': 'toast.success(`💡 ${item.name} ${t("effectOn")}`);',
  'toast.success(`✨ Hiệu ứng "${item.name}" đã bật`);': 'toast.success(`✨ ${item.name} ${t("effectOn")}`);',
  'toast.success(`🖱️ Con trỏ "${item.name}" đã đổi`);': 'toast.success(`🖱️ ${item.name} ${t("cursorChanged")}`);',
  'toast.success(`🎵 Âm thanh "${item.name}" đang phát`);': 'toast.success(`🎵 ${item.name} ${t("soundPlaying")}`);',
  'toast.success(`🏅 Huy hiệu "${item.name}" đã trang bị`);': 'toast.success(`🏅 ${item.name} ${t("badgeEquipped")}`);',
  'toast.success(`✅ Đã trang bị "${item.name}"`);': 'toast.success(`✅ ${t("equipSuccess")} "${item.name}"`);',
  'toast.success("🧹 Đã gỡ toàn bộ trang bị & hiệu ứng!");': 'toast.success(t("unequipAllSuccess"));',
  'toast.success("✅ Đã đổi hình nền thành công!");': 'toast.success(t("bgChangeSuccess"));',
  'toast.error("❌ Tải lên thất bại.");': 'toast.error(t("uploadFailed"));',
  'toast.error("❌ Lỗi tải ảnh lên.");': 'toast.error(t("uploadError"));',
  
  // DashboardOverlay.tsx
  'toast.success("Cập nhật thành công!");': 'toast.success(t("updateSuccess"));',
  'toast.error("Lỗi khi cập nhật.");': 'toast.error(t("updateError"));',
  'toast.success("Đã cập nhật Avatar!");': 'toast.success(t("avatarUpdated"));',
  'toast.error("Lỗi khi upload avatar.");': 'toast.error(t("avatarUpdateError"));',
  
  // FriendsPanel.tsx
  'toast.error("Nhập ít nhất 3 ký tự")': 'toast.error(t("min3Chars"))',
  'toast.success("Đã gửi lời mời kết bạn")': 'toast.success(t("friendRequestSent"))',
  'toast.error("Gửi thất bại hoặc đã là bạn bè")': 'toast.error(t("sendFailed"))',
  'toast.success("Đã chấp nhận kết bạn")': 'toast.success(t("friendAccepted"))',
  'toast.success("Đã xóa")': 'toast.success(t("deleted"))'
};

const files = [
  'src/components/room/VirtualRoomWidget.tsx',
  'src/components/marketplace/MarketplaceModal.tsx',
  'src/components/focus/DashboardOverlay.tsx',
  'src/components/friends/FriendsPanel.tsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add useLanguage import if not exists
    if (!content.includes('useLanguage')) {
      content = content.replace('import { toast } from "sonner";', 'import { toast } from "sonner";\nimport { useLanguage } from "@/lib/LanguageContext";');
    }
    
    // Add const { t } = useLanguage(); inside the component if not exists
    if (!content.includes('const { t } = useLanguage();') && !content.includes('const { t } = props;')) {
      // Very naive approach: find the first component definition and insert it there.
      // Easiest is to search for 'export function' or 'export default function'
      content = content.replace(/(export (default )?function [a-zA-Z0-9_]+\([^{]*\) {)/, '$1\n  const { t } = useLanguage();\n');
    }

    for (const [key, value] of Object.entries(replacements)) {
      content = content.split(key).join(value);
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
