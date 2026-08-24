"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export const translations = {
  en: {
    // General
    coins: "Coins",
    login: "Login / Sign Up",
    joinCommunity: "Join the Community",
    joinDesc: "Create an account to add friends, join study rooms, and chat in real-time.",
    signUpFree: "Sign Up Free",
    marketplaceLocked: "Marketplace Locked",
    marketplaceLockedDesc: "Log in to earn coins during your focus sessions and buy exclusive study rooms!",
    addTask: "Add Task",
    notesPlaceholder: "Write your quick notes here... Markdown is supported.",
    ambientSounds: "Ambient Sounds",
    timerSettings: "Timer Settings",
    autoStartBreaks: "Auto-start Breaks",
    autoStartPomodoros: "Auto-start Pomodoros",
    notifications: "Notifications",
    soundAlarms: "Sound Alarms",
    buy: "Buy",
    equip: "Equip",
    free: "Free",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    loading: "Loading...",
    // Timer
    focus: "Focus",
    break: "Break",
    session: "Session",
    startFocus: "Start",
    pauseTimer: "Pause",
    resetTimer: "Reset",
    completeTask: "Complete",
    // Widgets
    upNext: "Up Next",
    allCaughtUp: "All caught up!",
    widgetSettings: "Widget Settings",
    clockWeather: "Clock & Weather",
    statsLevel: "Level Stats",
    miniTasks: "Mini Tasks",
    musicPlayer: "Music Player",
    ambientMixer: "Ambient Mixer",
    // Settings
    focusLength: "Focus Length",
    breakLength: "Break Length",
    focusLengthDesc: "Focus time (Minutes)",
    breakLengthDesc: "Break time (Minutes)",
    automation: "Automation",
    displaySettings: "Display",
    // Tasks
    addTaskPlaceholder: "New task...",
    noTasks: "No tasks yet!",
    // Notes
    notes: "Notes",
    notesDesc: "Your quick notes (auto-saved)",
    // Music
    musicDesc: "Paste YouTube link or Video ID...",
    changeMusic: "Change",
    // Ambient
    rain: "Rain",
    cafe: "Cafe",
    fire: "Fireplace",
    keyboard: "Keyboard",
    ocean: "Ocean",
    // Profile
    editProfile: "Edit Profile",
    yourProfile: "Your Profile",
    newName: "New name",
    newPassword: "New password (leave blank to keep)",
    saveChanges: "Save",
    // Misc
    disableAllEffects: "Disable all effects",
    logout: "Logout",
    dailyMissions: "Daily Missions",
    achievements: "Achievements",
    analytics: "Analytics",
  },
  vi: {
    coins: "Xu",
    login: "Đăng nhập / Đăng ký",
    joinCommunity: "Tham gia Cộng đồng",
    joinDesc: "Tạo tài khoản để kết bạn, học nhóm và chat thời gian thực.",
    signUpFree: "Đăng ký Miễn phí",
    marketplaceLocked: "Cửa hàng đã khóa",
    marketplaceLockedDesc: "Đăng nhập để kiếm xu trong lúc học và mua các không gian xịn xò!",
    addTask: "Thêm công việc",
    notesPlaceholder: "Viết ghi chú nhanh ở đây... Hỗ trợ Markdown.",
    ambientSounds: "Âm thanh môi trường",
    timerSettings: "Cài đặt Đồng hồ",
    autoStartBreaks: "Tự động bắt đầu Nghỉ ngơi",
    autoStartPomodoros: "Tự động bắt đầu Học",
    notifications: "Thông báo",
    soundAlarms: "Âm thanh báo thức",
    buy: "Mua",
    equip: "Sử dụng",
    free: "Miễn phí",
    save: "Lưu",
    cancel: "Hủy",
    edit: "Chỉnh sửa",
    delete: "Xóa",
    loading: "Đang tải...",
    focus: "Tập trung",
    break: "Nghỉ ngơi",
    session: "Phiên",
    startFocus: "Bắt đầu",
    pauseTimer: "Tạm dừng",
    resetTimer: "Đặt lại",
    completeTask: "Hoàn thành",
    upNext: "Tiếp theo",
    allCaughtUp: "Không có gì mới!",
    widgetSettings: "Cài đặt Widget",
    clockWeather: "Đồng hồ & Thời tiết",
    statsLevel: "Chỉ số cấp độ",
    miniTasks: "Nhiệm vụ nhỏ",
    musicPlayer: "Trình phát nhạc",
    ambientMixer: "Mix âm thanh",
    focusLength: "Thời gian Tập trung",
    breakLength: "Thời gian Nghỉ",
    focusLengthDesc: "Thời gian học (Phút)",
    breakLengthDesc: "Thời gian nghỉ (Phút)",
    automation: "Tự động hóa",
    displaySettings: "Hiển thị",
    addTaskPlaceholder: "Công việc mới...",
    noTasks: "Chưa có việc gì!",
    notes: "Ghi chú",
    notesDesc: "Ghi chú nhanh của bạn (tự lưu)",
    musicDesc: "Dán link YouTube hoặc Video ID vào đây...",
    changeMusic: "Đổi",
    rain: "Mưa",
    cafe: "Quán Café",
    fire: "Lửa trại",
    keyboard: "Bàn phím",
    ocean: "Sóng biển",
    editProfile: "Chỉnh sửa hồ sơ",
    yourProfile: "Hồ sơ của bạn",
    newName: "Tên mới",
    newPassword: "Mật khẩu mới (bỏ trống nếu không đổi)",
    saveChanges: "Lưu",
    disableAllEffects: "Tắt tất cả hiệu ứng",
    logout: "Đăng xuất",
    dailyMissions: "Nhiệm vụ hàng ngày",
    achievements: "Thành tích",
    analytics: "Phân tích",
  },
  zh: {
    coins: "硬币",
    login: "登录 / 注册",
    joinCommunity: "加入社区",
    joinDesc: "创建帐户以添加朋友，加入自习室并实时聊天。",
    signUpFree: "免费注册",
    marketplaceLocked: "市场已锁定",
    marketplaceLockedDesc: "登录以在专注期间赚取金币并购买专属自习室！",
    addTask: "添加任务",
    notesPlaceholder: "在这里写下您的快速笔记... 支持Markdown。",
    ambientSounds: "环境声音",
    timerSettings: "计时器设置",
    autoStartBreaks: "自动开始休息",
    autoStartPomodoros: "自动开始番茄钟",
    notifications: "通知",
    soundAlarms: "声音警报",
    buy: "购买",
    equip: "装备",
    free: "免费",
    save: "保存",
    cancel: "取消",
    edit: "编辑",
    delete: "删除",
    loading: "加载中...",
    focus: "专注",
    break: "休息",
    session: "阶段",
    startFocus: "开始",
    pauseTimer: "暂停",
    resetTimer: "重置",
    completeTask: "完成",
    upNext: "接下来",
    allCaughtUp: "全部完成！",
    widgetSettings: "小组件设置",
    clockWeather: "时钟与天气",
    statsLevel: "等级状态",
    miniTasks: "小任务",
    musicPlayer: "音乐播放器",
    ambientMixer: "氛围混音器",
    focusLength: "专注时长",
    breakLength: "休息时长",
    focusLengthDesc: "专注时间（分钟）",
    breakLengthDesc: "休息时间（分钟）",
    automation: "自动化",
    displaySettings: "显示",
    addTaskPlaceholder: "新任务...",
    noTasks: "还没有任务！",
    notes: "笔记",
    notesDesc: "您的快速笔记（自动保存）",
    musicDesc: "粘贴YouTube链接或视频ID...",
    changeMusic: "更换",
    rain: "雨声",
    cafe: "咖啡馆",
    fire: "壁炉",
    keyboard: "键盘声",
    ocean: "海浪",
    editProfile: "编辑个人资料",
    yourProfile: "您的个人资料",
    newName: "新名字",
    newPassword: "新密码（不更改请留空）",
    saveChanges: "保存",
    disableAllEffects: "禁用所有效果",
    logout: "退出登录",
    dailyMissions: "每日任务",
    achievements: "成就",
    analytics: "分析",
  }
};

export type Language = "en" | "vi" | "zh";
export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "vi",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("vi");

  useEffect(() => {
    const saved = localStorage.getItem("promodo_lang") as Language;
    if (saved && ["en", "vi", "zh"].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("promodo_lang", newLang);
  };

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
