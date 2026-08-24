import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Check } from "lucide-react";
import Image from "next/image";
import { useAmbientStore } from "@/store/useAmbientStore";
import { useTimerStore } from "@/store/useTimerStore";
import { useLanguage } from "@/lib/LanguageContext";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

function extractYouTubeId(url: string) {
  if (url.includes('list=')) {
    try {
      const urlObj = new URL(url);
      const list = urlObj.searchParams.get('list');
      if (list) return `playlist:${list}`;
    } catch (e) {}
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
}

export function MusicPlayerWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { spotifyId, setSpotifyId } = useAmbientStore(); // vẫn dùng tên biến cũ nhưng lưu YouTube ID
  const [inputValue, setInputValue] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState("");
  const { t } = useLanguage();
  
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [trackName, setTrackName] = useState("YouTube Player");
  const [artistName, setArtistName] = useState("Đang phát nhạc nền");
  const [isIframeReady, setIsIframeReady] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  // Mặc định ID YouTube Lofi Girl nếu id hiện tại là của Spotify
  const currentVideoId = spotifyId.includes("37i9") ? "lTRiuFIWV54" : spotifyId;

  // Keep thumbnail error state in sync with video id
  useEffect(() => {
    setImgError(false);
    setActiveVideoId("");
  }, [currentVideoId]);

  // Lấy thông tin video YouTube (fallback nếu player chưa play)
  useEffect(() => {
    if (currentVideoId.startsWith('playlist:')) return;
    fetch(`https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${currentVideoId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.title && !activeVideoId) {
          setTrackName(data.title);
          setArtistName(data.author_name || "YouTube Video");
        }
      })
      .catch(() => {});
  }, [currentVideoId, activeVideoId]);

  // Khởi tạo YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    }

    function initPlayer() {
      if (!containerRef.current) return;
      
      const isPlaylist = currentVideoId.startsWith('playlist:');
      const vId = isPlaylist ? '' : currentVideoId;
      const playerVars: any = {
        'playsinline': 1,
        'controls': 1,
        'loop': 1,
      };
      if (isPlaylist) {
        playerVars.listType = 'playlist';
        playerVars.list = currentVideoId.replace('playlist:', '');
      } else {
        playerVars.playlist = currentVideoId;
      }
      
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '80',
        width: '100%',
        videoId: vId,
        playerVars: playerVars,
        events: {
          'onReady': () => {
            setIsIframeReady(true);
          },
          'onStateChange': (event: any) => {
            if (event.target && event.target.getVideoData) {
              const data = event.target.getVideoData();
              if (data) {
                if (data.title) setTrackName(data.title);
                if (data.author) setArtistName(data.author);
                if (data.video_id) setActiveVideoId(data.video_id);
              }
            }
            if (event.data === window.YT.PlayerState.ENDED) {
              if (isPlaylist && playerRef.current.nextVideo) {
                playerRef.current.nextVideo();
              } else if (playerRef.current.playVideo) {
                playerRef.current.playVideo();
              }
            }
          }
        }
      });
    }

    return () => {
      // Dọn dẹp
    };
  }, []);

  // Update video khi user đổi link
  useEffect(() => {
    if (playerRef.current && isIframeReady) {
      const isPlaylist = currentVideoId.startsWith('playlist:');
      if (isPlaylist) {
        const listId = currentVideoId.replace('playlist:', '');
        if (isPowerOn && playerRef.current.loadPlaylist) {
          playerRef.current.loadPlaylist({ list: listId, listType: 'playlist' });
        } else if (playerRef.current.cuePlaylist) {
          playerRef.current.cuePlaylist({ list: listId, listType: 'playlist' });
        }
      } else {
        if (isPowerOn && playerRef.current.loadVideoById) {
          playerRef.current.loadVideoById(currentVideoId);
          if (playerRef.current.setLoop) playerRef.current.setLoop(true);
        } else if (playerRef.current.cueVideoById) {
          playerRef.current.cueVideoById(currentVideoId);
        }
      }
    }
  }, [currentVideoId, isIframeReady, isPowerOn]);

  const handleUpdatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;

    const finalId = extractYouTubeId(inputValue.trim());

    setSpotifyId(finalId);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    setInputValue("");
    
    if (!isPowerOn) {
      setIsPowerOn(true);
    }

    const roomId = useTimerStore.getState().roomId;
    const isHost = useTimerStore.getState().isHost;
    if (roomId && isHost) {
      window.dispatchEvent(new CustomEvent("room-music-action", {
        detail: { playlistId: finalId }
      }));
    }
  };

  const togglePower = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isPowerOn;
    setIsPowerOn(newState);
    
    if (newState && !isOpen) {
      setIsOpen(true);
    }

    if (playerRef.current && isIframeReady) {
      if (newState) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  };

  return (
    <div className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex flex-col gap-2 w-full shadow-2xl relative group overflow-hidden">
      {/* Header / Current Status */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-colors ${isPowerOn ? 'border-[#FF0000]/50 shadow-[0_0_15px_rgba(255,0,0,0.2)] animate-[spin_10s_linear_infinite]' : 'border-zinc-700'}`}>
          <Image 
            sizes="(max-width: 768px) 100vw, 33vw" 
            src={imgError || (activeVideoId || currentVideoId).startsWith('playlist:') ? 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop' : `https://img.youtube.com/vi/${activeVideoId || currentVideoId}/0.jpg`} 
            fill 
            alt="Vinyl" 
            onError={() => setImgError(true)}
            className={`object-cover ${!isPowerOn && 'grayscale'}`} 
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-full border border-zinc-800" />
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <p className="text-white text-sm font-semibold truncate flex items-center gap-2">
            {trackName}
            <Music className="w-3 h-3 text-[#FF0000] flex-shrink-0" />
          </p>
          <p className="text-white/50 text-xs truncate">
            {isPowerOn ? artistName : "Đã tạm dừng"}
          </p>
        </div>

        {isPowerOn && (
          <div className="flex gap-1 h-5 items-end mr-2">
            <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-[#FF0000] rounded-full" />
            <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1 bg-[#FF0000] rounded-full" />
            <motion.div animate={{ height: [6, 12, 6] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.4 }} className="w-1 bg-[#FF0000] rounded-full" />
          </div>
        )}

        <button 
          onClick={togglePower}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${!isPowerOn ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-[#FF0000]/20 text-[#FF0000] hover:bg-[#FF0000]/30'}`}
          title={!isPowerOn ? "Bật nhạc" : "Tắt nhạc"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
        </button>
      </div>

      {/* Expanded Controls */}
      <motion.div 
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="flex flex-col gap-2 border-t border-white/10 mt-4 pt-4">
          <form onSubmit={handleUpdatePlaylist} className="flex gap-2">
            <input 
              type="text" 
              placeholder={t('musicDesc')}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#FF0000] transition-colors"
            />
            <button 
              type="submit"
              className="bg-[#FF0000]/20 text-[#FF0000] hover:bg-[#FF0000]/30 px-3 rounded-xl transition-colors text-xs font-semibold flex items-center justify-center min-w-[50px]"
            >
              {isSaved ? <Check className="w-4 h-4" /> : t('changeMusic')}
            </button>
          </form>

          <div className={`w-full h-[80px] rounded-xl overflow-hidden relative ${!isPowerOn ? 'opacity-50 pointer-events-none' : ''}`}>
            <div ref={containerRef}></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
