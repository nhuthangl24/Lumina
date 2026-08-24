"use client";

import { useState } from "react";
import { Send, Bell, Users, Globe } from "lucide-react";
import { toast } from "sonner";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("SYSTEM");
  const [targetEmail, setTargetEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }
    if (type === "USER" && !targetEmail) {
      toast.error("Vui lòng nhập email người nhận.");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type, targetEmail }),
      });

      if (res.ok) {
        toast.success("Đã gửi thông báo thành công!");
        setTitle("");
        setContent("");
        setTargetEmail("");
      } else {
        toast.error("Lỗi khi gửi thông báo.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Đã có lỗi xảy ra.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Notifications
          </h1>
          <p className="text-white/50">Gửi thông báo hệ thống hoặc cho cá nhân</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <form onSubmit={handleSend} className="space-y-4">
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setType("SYSTEM")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                type === "SYSTEM"
                  ? "bg-primary text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              <Globe className="w-5 h-5" />
              Toàn Hệ Thống
            </button>
            <button
              type="button"
              onClick={() => setType("USER")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                type === "USER"
                  ? "bg-primary text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              <Users className="w-5 h-5" />
              Cá Nhân
            </button>
          </div>

          {type === "USER" && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Email người nhận</label>
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="vidu@email.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Nội dung</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              rows={4}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSending}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              {isSending ? "Đang gửi..." : "Gửi thông báo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
