import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, CheckCircle2, ListTodo, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/LanguageContext";

export function MiniTaskWidget() {
  const [isVisible, setIsVisible] = useState(true);
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      fetch("/api/tasks")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setTasks(data.filter(t => !t.done).slice(0, 3));
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const toggleTask = async (id: string) => {
    // Optimistic UI update
    setTasks(prev => prev.filter(t => t.id !== id));
    
    // Server update
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: true }),
      });
      
      // Update Daily Mission for completing a task
      await fetch("/api/missions/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "complete_task", amount: 1 })
      });
      
      // Dispatch event so DailyMissionsWidget refreshes
      window.dispatchEvent(new Event("promodo_mission_progress"));
    } catch (error) {
      console.error(error);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 w-full shadow-2xl flex flex-col gap-3 relative group"
    >
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-4 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
      >
        <X className="w-3 h-3 text-white/70" />
      </button>

      <div className="flex items-center gap-2">
        <ListTodo className="w-4 h-4 text-emerald-400" />
        <h3 className="text-white text-sm font-semibold">{t('upNext')}</h3>
      </div>
      
      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="flex items-start gap-3 group">
              <button 
                onClick={() => toggleTask(task.id)}
                className="mt-0.5 w-5 h-5 rounded-full border border-white/30 flex items-center justify-center bg-black/20 group-hover:border-emerald-400/50 transition-colors shrink-0"
              >
                <Check className="w-3 h-3 text-emerald-400 opacity-0 group-hover:opacity-50 transition-opacity" />
              </button>
              <p className="text-white/80 text-sm leading-tight group-hover:text-white transition-colors">
                {task.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-8 h-8 text-white/20 mb-2" />
          <p className="text-white/50 text-xs">{t('allCaughtUp')}</p>
        </div>
      )}
    </motion.div>
  );
}
