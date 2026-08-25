const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/marketplace/MarketplaceModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
  // Static text replacements
  'Cá nhân hóa không gian học tập của bạn': '{t("marketplaceSubtitle")}',
  '>DANH MỤC<': '>{t("categories")}<',
  '>Tất cả<': '>{t("all")}<',
  '>Ảnh của tôi<': '>{t("myImages")}<',
  '>Thời tiết<': '>{t("weather")}<',
  '>Ánh sáng<': '>{t("lighting")}<',
  '>Âm thanh<': '>{t("sound")}<',
  '>Pet<': '>{t("pet")}<',
  '>Hiệu ứng<': '>{t("effects")}<',
  '>Con trỏ<': '>{t("cursor")}<',
  '>Huy hiệu<': '>{t("badge")}<',
  'placeholder="Tìm kiếm vật phẩm..."': 'placeholder={t("searchItems")}',
  'Nổi bật': '{t("sortFeatured")}',
  'Mới nhất': '{t("sortNewest")}',
  'Giá thấp - cao': '{t("sortPriceAsc")}',
  'Giá cao - thấp': '{t("sortPriceDesc")}',
  '>Daily Shop<': '>{t("dailyShop")}<',
  '>Vật phẩm giảm giá mỗi<br/>ngày<': '>{t("dailyShopDesc")}<',
  '>Xem ngay &rarr;<': '>{t("viewNow")}<',
  '>Tải ảnh mới<': '>{t("uploadNewImage")}<',
  '>Mở khóa tính năng tự tải ảnh nền từ thiết bị của bạn<': '>{t("uploadNewImageDesc")}<',
  '>Tải ảnh lên<': '>{t("uploadImageBtn")}<',
  '>Đang sử dụng<': '>{t("equippedStatus")}<',
  '>Sử dụng<': '>{t("equip")}<',
  '>Bỏ sử dụng<': '>{t("unequip")}<',
};

// Handle cases with inner quotes or specific tags
// Instead of simple global replace which could break JSX, let's be careful.
for (const [key, value] of Object.entries(replacements)) {
  content = content.split(key).join(value);
}

fs.writeFileSync(filePath, content);
console.log("MarketplaceModal updated.");
