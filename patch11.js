const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/focus/DashboardOverlay.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace tierName assignments
content = content.replace('let tierName = "Bronze Member";', 'let tierName = t("bronzeMember");');
content = content.replace('let nextTierName = "Silver";', 'let nextTierName = t("silverTier");');

content = content.replace(/tierName = "Master Member"/g, 'tierName = t("masterMember")');
content = content.replace(/nextTierName = "Max Tier"/g, 'nextTierName = t("maxTier")');

content = content.replace(/tierName = "Diamond Member"/g, 'tierName = t("diamondMember")');
content = content.replace(/nextTierName = "Master"/g, 'nextTierName = t("masterTier")');

content = content.replace(/tierName = "Platinum Member"/g, 'tierName = t("platinumMember")');
content = content.replace(/nextTierName = "Diamond"/g, 'nextTierName = t("diamondTier")');

content = content.replace(/tierName = "Gold Member"/g, 'tierName = t("goldMember")');
content = content.replace(/nextTierName = "Platinum"/g, 'nextTierName = t("platinumTier")');

content = content.replace(/tierName = "Silver Member"/g, 'tierName = t("silverMember")');
content = content.replace(/nextTierName = "Gold"/g, 'nextTierName = t("goldTier")');

// Replace JSX text
content = content.replace(
  '<h3 className={`${tierColor} font-semibold text-sm uppercase tracking-wider mb-1`}>Current Tier</h3>',
  '<h3 className={`${tierColor} font-semibold text-sm uppercase tracking-wider mb-1`}>{t("currentTier")}</h3>'
);

content = content.replace(
  '<p className="text-xs text-white/50 text-right">{level < 50 ? `${Math.round(xpProgressPct)}% to ${nextTierName}` : "Max Level Reached"}</p>',
  '<p className="text-xs text-white/50 text-right">{level < 50 ? t("xpToNextTier").replace("{pct}", Math.round(xpProgressPct).toString()).replace("{nextTier}", nextTierName) : t("maxLevelReached")}</p>'
);

content = content.replace(
  '<p className="text-white/50 text-sm font-medium mb-1">Total Pomodoros</p>',
  '<p className="text-white/50 text-sm font-medium mb-1">{t("totalPomodoros")}</p>'
);

content = content.replace(
  '<p className="text-white/50 text-sm font-medium mb-1">Current Streak</p>',
  '<p className="text-white/50 text-sm font-medium mb-1">{t("currentStreak")}</p>'
);

content = content.replace(
  '<span className="text-white/50 pb-1">days</span>',
  '<span className="text-white/50 pb-1">{t("days")}</span>'
);

content = content.replace(
  '<p className="text-white font-medium">Hoàn thành Pomodoro</p>',
  '<p className="text-white font-medium">{t("pomodoroCompleted")}</p>'
);

content = content.replace(
  '<p className="text-white/40 text-xs">Bạn đã tập trung được {profile.totalPomodoros} phiên</p>',
  '<p className="text-white/40 text-xs">{t("pomodoroFocusMessage").replace("{sessions}", profile.totalPomodoros.toString())}</p>'
);

content = content.replace(
  '<p className="text-white font-medium">Hoàn thành nhiệm vụ</p>',
  '<p className="text-white font-medium">{t("taskCompleted")}</p>'
);

content = content.replace(
  '<p className="text-white/40 text-xs">Bạn đã hoàn thành {completedTasksCount} nhiệm vụ</p>',
  '<p className="text-white/40 text-xs">{t("taskCompletionMessage").replace("{tasks}", completedTasksCount.toString())}</p>'
);

fs.writeFileSync(filePath, content);
console.log("DashboardOverlay translations updated.");
