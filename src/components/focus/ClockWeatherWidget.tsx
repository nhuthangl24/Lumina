import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, X } from "lucide-react";

export function ClockWeatherWidget() {
  const [isVisible, setIsVisible] = useState(true);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [city, setCity] = useState("Ho Chi Minh");
  const [weather, setWeather] = useState({ temp: "72", condition: "Sunny", high: "78", low: "65", aqi: "42" });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }));
    };
    
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async (cityName: string) => {
    try {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(cityName)}?format=j1`);
      if (res.ok) {
        const data = await res.json();
        const current = data.current_condition[0];
        const today = data.weather[0];
        setWeather({
          temp: current.temp_C,
          condition: current.weatherDesc[0].value,
          high: today.maxtempC,
          low: today.mintempC,
          aqi: "Good"
        });
      }
    } catch (e) {
      console.log("Could not fetch weather, using fallback");
    }
  };

  useEffect(() => {
    const loadCity = () => {
      const savedCity = localStorage.getItem("promodo_weather_city") || "Ho Chi Minh";
      setCity(savedCity);
      fetchWeather(savedCity);
    };
    
    loadCity();
    
    window.addEventListener('promodo_settings_updated', loadCity);
    return () => window.removeEventListener('promodo_settings_updated', loadCity);
  }, []);

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

      <div>
        <h2 className="text-3xl font-heading font-bold text-white tracking-tight">{time}</h2>
        <p className="text-white/60 text-sm font-medium">{date}</p>
      </div>
      
      <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
            {weather.condition.toLowerCase().includes("rain") ? (
              <CloudRain className="w-4 h-4 text-blue-400" />
            ) : weather.condition.toLowerCase().includes("cloud") ? (
              <Cloud className="w-4 h-4 text-gray-400" />
            ) : (
              <Sun className="w-4 h-4 text-yellow-400" />
            )}
          </div>
          <div className="max-w-[100px]">
            <p className="text-white font-bold truncate" title={city}>{city}</p>
            <p className="text-white/50 text-xs truncate" title={weather.condition}>{weather.temp}°C • {weather.condition}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-xs">H: {weather.high}° L: {weather.low}°</p>
        </div>
      </div>
    </motion.div>
  );
}
