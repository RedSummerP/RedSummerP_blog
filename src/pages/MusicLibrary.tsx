import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

interface Track {
  name: string;
  url: string;
  artist?: string;
}

export default function MusicLibrary() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchTracks = () => {
    fetch("/api/music")
      .then((r) => r.json())
      .then((data) => setTracks(data.tracks || []))
      .catch(() => {});
  };

  useEffect(() => { fetchTracks(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await fetch("/api/music/upload", { method: "POST", body: fd });
      fetchTracks();
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await fetch(`/api/music/${encodeURIComponent(name)}`, { method: "DELETE" });
      if (playing === name) { setPlaying(null); audioRef.current?.pause(); }
      fetchTracks();
    } catch {}
  };

  const togglePlay = (track: Track) => {
    if (playing === track.name) {
      audioRef.current?.pause();
      setPlaying(null);
    } else {
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = track.url;
      audioRef.current.play().catch(() => {});
      setPlaying(track.name);
    }
  };

  const s = language === "zh" ? {
    title: "音乐库", back: "返回", empty: "还没有音乐文件",
    upload: "上传音乐", uploading: "上传中...", delete: "删除",
    playing: "播放中", files: "个文件", notice: "支持 MP3 / WAV / OGG / FLAC 格式",
  } : {
    title: "Music Library", back: "Back", empty: "No music files yet",
    upload: "Upload Music", uploading: "Uploading...", delete: "Delete",
    playing: "Playing", files: "files", notice: "Supports MP3 / WAV / OGG / FLAC",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D" }}>
      <header style={{ height: "40px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#0D0D0D" }}>
        <button onClick={() => navigate("/")} style={{ fontSize: "12px", letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer" }}>
          {s.back}
        </button>
        <h1 style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 400, letterSpacing: "0.05em" }}>{s.title}</h1>
        <div style={{ width: "60px" }} />
      </header>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 16px" }}>

        {/* Upload */}
        {isAuthenticated && (
          <div style={{ marginBottom: "24px", padding: "16px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px", textAlign: "center" }}>
            <input ref={fileRef} type="file" accept="audio/*" onChange={handleUpload} style={{ display: "none" }} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ fontSize: "12px", padding: "8px 20px", background: uploading ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "4px", cursor: uploading ? "wait" : "pointer", fontFamily: "'Space Mono', monospace" }}
            >
              {uploading ? s.uploading : `+ ${s.upload}`}
            </button>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "10px", fontFamily: "'Space Mono', monospace" }}>{s.notice}</p>
          </div>
        )}

        {/* List */}
        {tracks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.3 }}>🎵</div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>{s.empty}</p>
            {!isAuthenticated && (
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", marginTop: "8px" }}>{language === "zh" ? "请登录后上传音乐" : "Log in to upload music"}</p>
            )}
          </div>
        ) : (
          <>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace", marginBottom: "12px" }}>{tracks.length} {s.files}</p>
            {tracks.map((t) => (
              <div key={t.name} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: playing === t.name ? "rgba(90,170,164,0.08)" : "transparent" }}>
                <button
                  onClick={() => togglePlay(t)}
                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: playing === t.name ? "rgba(45,106,101,0.6)" : "rgba(255,255,255,0.08)", color: "#F0F0F0", cursor: "pointer", fontSize: "12px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {playing === t.name ? "⏸" : "▶"}
                </button>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: "13px", color: playing === t.name ? "#5AAAA4" : "#F0F0F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.name.replace(/\.[^.]+$/, "")}
                  </div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", fontFamily: "'Space Mono', monospace", marginTop: "2px" }}>
                    {t.name.split(".").pop()?.toUpperCase()}
                  </div>
                </div>
                {isAuthenticated && (
                  <button onClick={() => handleDelete(t.name)} style={{ fontSize: "11px", color: "rgba(231,76,60,0.5)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace", flexShrink: 0 }}>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
