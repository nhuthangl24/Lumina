import { useState } from "react";
import { motion } from "framer-motion";
import { CloudRain, Coffee, Flame, Keyboard, Waves, X } from "lucide-react";
import { useAmbientStore } from "@/store/useAmbientStore";

export function AmbientMixerWidget() {
  const [isVisible, setIsVisible] = useState(true);
  const { rainVolume, cafeVolume, fireVolume, officeVolume, oceanVolume, setVolume } = useAmbientStore();

  if (!isVisible) return null;

  return (
    <motion.div 
      className="pointer-events-auto bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-3 w-full shadow-2xl flex flex-col gap-3 relative group"
    >
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-4 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
      >
        <X className="w-3 h-3 text-white/70" />
      </button>

      <h3 className="text-white text-sm font-semibold mb-2">Âm Thanh Môi Trường</h3>
      
      {/* Rain */}
      <div className="flex items-center gap-3 group">
        <button 
          onClick={() => setVolume("rain", rainVolume === 0 ? 50 : 0)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${rainVolume > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
        >
          <CloudRain className="w-4 h-4" />
        </button>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <input 
            type="range" min="0" max="100" 
            value={rainVolume}
            onChange={(e) => setVolume("rain", Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rainVolume}%` }} />
        </div>
      </div>

      {/* Cafe */}
      <div className="flex items-center gap-3 group">
        <button 
          onClick={() => setVolume("cafe", cafeVolume === 0 ? 50 : 0)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${cafeVolume > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
        >
          <Coffee className="w-4 h-4" />
        </button>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <input 
            type="range" min="0" max="100" 
            value={cafeVolume}
            onChange={(e) => setVolume("cafe", Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${cafeVolume}%` }} />
        </div>
      </div>

      {/* Fire */}
      <div className="flex items-center gap-3 group">
        <button 
          onClick={() => setVolume("fire", fireVolume === 0 ? 50 : 0)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${fireVolume > 0 ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
        >
          <Flame className="w-4 h-4" />
        </button>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <input 
            type="range" min="0" max="100" 
            value={fireVolume}
            onChange={(e) => setVolume("fire", Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="h-full bg-red-500 rounded-full" style={{ width: `${fireVolume}%` }} />
        </div>
      </div>

      {/* Keyboard */}
      <div className="flex items-center gap-3 group">
        <button 
          onClick={() => setVolume("office", officeVolume === 0 ? 50 : 0)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${officeVolume > 0 ? 'bg-gray-500/20 text-gray-400' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
        >
          <Keyboard className="w-4 h-4" />
        </button>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <input 
            type="range" min="0" max="100" 
            value={officeVolume}
            onChange={(e) => setVolume("office", Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="h-full bg-gray-400 rounded-full" style={{ width: `${officeVolume}%` }} />
        </div>
      </div>

      {/* Ocean */}
      <div className="flex items-center gap-3 group">
        <button 
          onClick={() => setVolume("ocean", oceanVolume === 0 ? 50 : 0)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${oceanVolume > 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
        >
          <Waves className="w-4 h-4" />
        </button>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <input 
            type="range" min="0" max="100" 
            value={oceanVolume}
            onChange={(e) => setVolume("ocean", Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${oceanVolume}%` }} />
        </div>
      </div>
    </motion.div>
  );
}
