const fs = require('fs');
const path = require('path');

const files = [
  'src/components/marketplace/MarketplaceModal.tsx',
  'src/components/focus/DashboardOverlay.tsx',
  'src/components/friends/FriendsPanel.tsx',
  'src/components/room/VirtualRoomWidget.tsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // For DashboardOverlay.tsx
    if (file.includes('DashboardOverlay.tsx') && !content.includes('const { t } = useLanguage();')) {
      content = content.replace('export function DashboardOverlay', 'export function DashboardOverlay'); // reset
      content = content.replace('export function DashboardOverlay({ onClose }: { onClose: () => void }) {\n', 'export function DashboardOverlay({ onClose }: { onClose: () => void }) {\n  const { t } = useLanguage();\n');
    }
    
    // For FriendsPanel.tsx
    if (file.includes('FriendsPanel.tsx') && !content.includes('const { t } = useLanguage();')) {
      content = content.replace('export function FriendsPanel() {\n', 'export function FriendsPanel() {\n  const { t } = useLanguage();\n');
    }

    // For MarketplaceModal.tsx
    if (file.includes('MarketplaceModal.tsx') && !content.includes('const { t } = useLanguage();')) {
      content = content.replace('export function MarketplaceModal({\n', 'export function MarketplaceModal({\n');
      content = content.replace('  onClose\n}: {\n  onClose: () => void;\n}) {\n', '  onClose\n}: {\n  onClose: () => void;\n}) {\n  const { t } = useLanguage();\n');
      // Also inject into ItemCard if used
      content = content.replace('function ItemCard({', 'function ItemCard({');
      content = content.replace('  onBuy\n}: {\n', '  onBuy\n}: {\n');
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Patched ${file}`);
  }
}
