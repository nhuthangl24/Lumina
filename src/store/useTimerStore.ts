import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerState {
  roomId: string | null;
  isHost: boolean;
  timeLeft: number;
  initialTime: number;
  isRunning: boolean;
  mode: "focus" | "break";
  currentTask: string | null;
  timerStyle: string;
  
  // Actions
  setRoomId: (id: string | null, isHost?: boolean) => void;
  setTimeLeft: (time: number) => void;
  setInitialTime: (time: number) => void;
  setIsRunning: (running: boolean) => void;
  setMode: (mode: "focus" | "break") => void;
  setCurrentTask: (task: string | null) => void;
  setTimerStyle: (style: string) => void;
  resetTimer: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      roomId: null,
      isHost: false,
      timeLeft: 25 * 60,
      initialTime: 25 * 60,
      isRunning: false,
      mode: "focus",
      currentTask: null,
      timerStyle: "default",

      setRoomId: (id, isHost = false) => set({ roomId: id, isHost }),
      setTimeLeft: (time) => set({ timeLeft: time }),
      setInitialTime: (time) => set({ initialTime: time }),
      setIsRunning: (running) => set({ isRunning: running }),
      setMode: (mode) => set({ mode }),
      setCurrentTask: (task) => set({ currentTask: task }),
      setTimerStyle: (style) => set({ timerStyle: style }),
      resetTimer: () => set({ 
        roomId: null, 
        isHost: false, 
        timeLeft: 25 * 60, 
        initialTime: 25 * 60, 
        isRunning: false,
        mode: "focus" 
      }),
    }),
    {
      name: 'promodo-timer-storage',
    }
  )
);
