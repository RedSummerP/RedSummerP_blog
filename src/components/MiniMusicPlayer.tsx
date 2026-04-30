import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";

interface Track {
  name: string;
  url: string;
  artist?: string;
}

export default function MiniMusicPlayer() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fabRef = useRef<HTMLDivElement>(null);

  // Fetch music list on mount
  useEffect(() => {
    fetch("/api/music")
      .then((r) => r.json())
      .then((data) => {
        if (data?.tracks?.length) setTracks(data.tracks);
      })
      .catch(() => {});
  }, []);

  const currentTrack = tracks[currentIdx];

  // Audio element setup (once)
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Update audio source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // Encode URL for Chinese characters
    const encodedUrl = currentTrack.url.split("/").map(s => encodeURIComponent(s)).join("/").replace(/%2F/g, "/");
    audio.src = encodedUrl;
    audio.load();

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    const onEnded = () => nextTrack();
    const onLoaded = () => setDuration(audio.duration || 0);
    const onError = () => {
      console.error("Audio error:", audio.error?.message);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
    };
  }, [currentTrack]);

  // Play/pause when isPlaying changes (only from user click)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.play().catch((err) => {
        console.error("Play failed:", err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const prevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setIsPlaying(false);
    setCurrentIdx((p) => (p - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setIsPlaying(false);
    setCurrentIdx((p) => (p + 1) % tracks.length);
  }, [tracks.length]);

  const toggleOpen = () => setIsOpen((o) => !o);

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return "00:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isOpen && fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [isOpen]);

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-end",
    gap: "10px",
  };

  const panelStyle: React.CSSProperties = {
    display: isOpen ? "block" : "none",
    background: "rgba(26,26,26,0.92)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: "12px",
    padding: "14px 18px",
    width: "250px",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  };

  const btnStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(26,26,26,0.9)",
    backdropFilter: "blur(8px)",
    color: "#F0F0F0",
    fontSize: "18px",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s",
    position: "relative" as const,
  };

  // No tracks mode - show button that navigates to /music
  if (tracks.length === 0) {
    return (
      <div style={{ position: "fixed", bottom: "28px", right: "28px", zIndex: 9999 }}>
        <button
          onClick={() => navigate("/music")}
          style={{
            width: "48px", height: "48px", borderRadius: "50%", border: "none",
            background: "rgba(26,26,26,0.85)", color: "rgba(255,255,255,0.6)",
            fontSize: "18px", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = "scale(1.08)"; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
          title="音乐库"
        >♪</button>
      </div>
    );
  }

  return (
    <div ref={fabRef} style={containerStyle}>
      {/* Mini player panel */}
      <div style={panelStyle}>
        {/* Edit library button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
          <button
            onClick={() => navigate("/music")}
            style={{
              fontSize: "10px", color: "rgba(255,255,255,0.3)", background: "none",
              border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace",
              letterSpacing: "1px",
            }}
          >
            EDIT LIBRARY
          </button>
        </div>

        <div style={{ fontSize: "13px", color: "#F0F0F0", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {currentTrack?.name?.replace(/\.[^.]+$/, "") || "未选择歌曲"}
        </div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "10px" }}>
          {currentTrack?.artist || "♪"}
        </div>

        {/* Progress bar */}
        <div style={{ height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", marginBottom: "4px", cursor: "pointer", position: "relative" }}
          onClick={(e) => {
            if (!audioRef.current || !duration) return;
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = pct * duration;
          }}
        >
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #2D6A65, #5AAAA4)", borderRadius: "2px" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace", marginBottom: "10px" }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
          <button onClick={prevTrack} style={{ ...ctrlBtn, fontSize: "13px" }}>⏮</button>
          <button onClick={togglePlay}
            style={{
              ...ctrlBtn, width: "38px", height: "38px",
              background: isPlaying ? "rgba(45,106,101,0.7)" : "rgba(45,106,101,0.5)",
              fontSize: "15px", boxShadow: "0 2px 8px rgba(45,106,101,0.2)",
            }}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={nextTrack} style={{ ...ctrlBtn, fontSize: "13px" }}>⏭</button>
        </div>
      </div>

      {/* FAB button */}
      <button onClick={toggleOpen} style={btnStyle}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = "scale(1.08)"; }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "scale(1)"; }}
      >
        {isOpen ? "✕" : "♪"}
      </button>
    </div>
  );
}

const ctrlBtn: React.CSSProperties = {
  width: "30px",
  height: "30px",
  border: "none",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.08)",
  color: "#F0F0F0",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
