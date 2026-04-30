import { useState, useRef } from "react";

export interface Badge {
  name: string;
  description: string;
  icon: string;
  x: number;
  y: number;
}

interface BadgeEditorProps {
  badges: Badge[];
  onUpdate: (badges: Badge[]) => void;
}

export default function BadgeEditor({ badges, onUpdate }: BadgeEditorProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const startAdd = () => {
    setForm({ name: "", description: "", icon: "" });
    setAdding(true);
    setEditingIdx(null);
  };

  const startEdit = (idx: number) => {
    setForm({ name: badges[idx].name, description: badges[idx].description, icon: badges[idx].icon });
    setEditingIdx(idx);
    setAdding(false);
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setForm({ ...form, icon: data.url });
    } catch {}
    if (fileRef.current) fileRef.current.value = "";
  };

  const autoGenerateIcon = () => {
    if (!form.name.trim()) return;
    const name = encodeURIComponent(form.name.slice(0, 2));
    setForm({ ...form, icon: `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=128&format=png&font-size=0.5` });
  };

  const save = () => {
    if (!form.name.trim()) return;
    const newBadges = [...badges];
    if (adding) {
      newBadges.push({ ...form, x: 0, y: 0 } as Badge);
    } else if (editingIdx !== null) {
      newBadges[editingIdx] = { ...newBadges[editingIdx], ...form };
    }
    onUpdate(newBadges);
    setAdding(false);
    setEditingIdx(null);
  };

  const remove = (idx: number) => {
    if (!confirm(`删除徽章"${badges[idx].name}"？`)) return;
    onUpdate(badges.filter((_, i) => i !== idx));
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", fontSize: "11px", padding: "6px 8px",
    border: "1px solid rgba(255,255,255,0.2)", outline: "none",
    background: "rgba(255,255,255,0.05)", color: "#fff",
    fontFamily: "'Space Mono', monospace", boxSizing: "border-box" as const,
    marginBottom: "8px", borderRadius: "2px",
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", margin: 0, letterSpacing: "1px" }}>徽章管理</p>
        <button onClick={startAdd} style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", padding: "3px 10px", cursor: "pointer", fontFamily: "'Space Mono', monospace", borderRadius: "2px" }}>
          + 添加徽章
        </button>
      </div>

      {(adding || editingIdx !== null) && (
        <div style={{ padding: "12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", marginBottom: "12px", background: "rgba(0,0,0,0.2)" }}>
          <div>
            <input placeholder="徽章名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <textarea placeholder="简短介绍" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
              {form.icon && <img src={form.icon} alt="" style={{ width: "32px", height: "32px", borderRadius: "4px", objectFit: "cover" }} />}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleIconUpload} style={{ display: "none" }} />
              <button onClick={() => fileRef.current?.click()} style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", padding: "4px 10px", cursor: "pointer", fontFamily: "'Space Mono', monospace", borderRadius: "2px" }}>上传图标</button>
              <button onClick={autoGenerateIcon} style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", padding: "4px 10px", cursor: "pointer", fontFamily: "'Space Mono', monospace", borderRadius: "2px" }}>🎨 自动生成</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={save} style={{ fontSize: "10px", color: "#1A1A1A", background: "#fff", border: "none", padding: "4px 14px", cursor: "pointer", fontFamily: "'Space Mono', monospace", borderRadius: "2px" }}>保存</button>
            <button onClick={() => { setAdding(false); setEditingIdx(null); }} style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", background: "none", border: "1px solid rgba(255,255,255,0.15)", padding: "4px 14px", cursor: "pointer", fontFamily: "'Space Mono', monospace", borderRadius: "2px" }}>取消</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {badges.map((badge, idx) => (
          <div key={idx} style={{ position: "relative", width: "80px", textAlign: "center" }}
            onMouseEnter={(e) => { const tip = e.currentTarget.querySelector(".badge-tip") as HTMLElement; if (tip) tip.style.display = "block"; }}
            onMouseLeave={(e) => { const tip = e.currentTarget.querySelector(".badge-tip") as HTMLElement; if (tip) tip.style.display = "none"; }}
          >
            <div style={{ width: "60px", height: "60px", margin: "0 auto 4px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "rgba(255,255,255,0.03)" }}
              onClick={() => startEdit(idx)}
            >
              {badge.icon ? (
                <img src={badge.icon} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", opacity: 0.3 }}>🏆</div>
              )}
            </div>
            <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{badge.name}</p>
            <button onClick={() => remove(idx)} style={{ position: "absolute", top: "-4px", right: "4px", fontSize: "9px", color: "rgba(231,76,60,0.6)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>✕</button>
            <div className="badge-tip" style={{ display: "none", position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.9)", color: "#fff", padding: "6px 10px", borderRadius: "4px", fontSize: "10px", whiteSpace: "nowrap", zIndex: 10, marginBottom: "4px" }}>
              <strong>{badge.name}</strong><br />{badge.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
