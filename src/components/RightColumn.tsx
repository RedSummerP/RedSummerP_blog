import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useIsMobile } from "@/hooks/use-mobile";
import ImageUpload from "./ImageUpload";
import type { Badge } from "./BadgeEditor";

gsap.registerPlugin(ScrollTrigger);

interface CVItem {
  category: string;
  title: string;
  subtitle?: string;
  year: string;
}

const fallbackCvData: Record<string, CVItem[]> = {
  zh: [
    { category: "Skills", title: "编程语言", subtitle: "Rust / TypeScript / C++ / Python", year: "" },
    { category: "Skills", title: "游戏开发", subtitle: "自研引擎 / ECS架构 / 像素艺术", year: "" },
    { category: "Projects", title: "星隙旅人", subtitle: "独立2D平台冒险游戏 / Rust自研引擎", year: "2023 - 至今" },
  ],
  en: [
    { category: "Skills", title: "Programming", subtitle: "Rust / TypeScript / C++ / Python", year: "" },
    { category: "Skills", title: "Game Development", subtitle: "Custom Engine / ECS / Pixel Art", year: "" },
    { category: "Projects", title: "Stellar Vagabond", subtitle: "Indie 2D Platformer / Rust Engine", year: "2023 - Present" },
  ],
};

export default function RightColumn() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const artFrameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const utils = trpc.useUtils();

  const { data: cvDataDb } = trpc.cv.list.useQuery();
  const { data: latestDate } = trpc.blog.latestUpdate.useQuery();
  const createCv = trpc.cv.create.useMutation({ onSuccess: () => utils.cv.list.invalidate() });
  const updateCv = trpc.cv.update.useMutation({ onSuccess: () => utils.cv.list.invalidate() });
  const deleteCv = trpc.cv.delete.useMutation({ onSuccess: () => utils.cv.list.invalidate() });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ category: "", zhTitle: "", zhSubtitle: "", enTitle: "", enSubtitle: "", year: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Only run GSAP parallax on desktop
  useEffect(() => {
    if (isMobile || !artFrameRef.current || !imageRef.current) return;
    const tween = gsap.to(imageRef.current, {
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: artFrameRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  }, [isMobile]);

  // Re-run parallax when avatar URL changes (on desktop only)
  useEffect(() => {
    if (isMobile || !artFrameRef.current || !imageRef.current) return;
    const tween = gsap.to(imageRef.current, {
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: artFrameRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  }, []);

  const dbItems = cvDataDb ?? [];
  const useDb = dbItems.length > 0;

  const items = useDb
    ? dbItems.map((e) => ({
        category: e.category,
        title: language === "zh" ? e.zhTitle : e.enTitle,
        subtitle: language === "zh" ? (e.zhSubtitle || undefined) : (e.enSubtitle || undefined),
        year: e.year,
        id: e.id,
      }))
    : fallbackCvData[language].map((e, i) => ({ ...e, id: i }));

  const sections = items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const sectionOrder = useDb
    ? Array.from(new Set(items.map((i) => i.category)))
    : ["Skills", "Projects"];

  const startEdit = (item: (typeof items)[0]) => {
    const dbItem = dbItems.find((d) => d.id === item.id);
    if (dbItem) {
      setEditForm({
        category: dbItem.category,
        zhTitle: dbItem.zhTitle,
        zhSubtitle: dbItem.zhSubtitle || "",
        enTitle: dbItem.enTitle,
        enSubtitle: dbItem.enSubtitle || "",
        year: dbItem.year,
      });
      setEditingId(item.id);
      setIsAdding(false);
    }
  };

  const startAdd = () => {
    setEditForm({ category: "Skills", zhTitle: "", zhSubtitle: "", enTitle: "", enSubtitle: "", year: "" });
    setIsAdding(true);
    setEditingId(null);
  };

  const saveEdit = () => {
    if (isAdding) {
      createCv.mutate({ ...editForm, sortOrder: dbItems.length + 1 });
    } else if (editingId !== null) {
      updateCv.mutate({ id: editingId, ...editForm });
    }
    setIsAdding(false);
    setEditingId(null);
  };

  const containerStyle: React.CSSProperties = isMobile
    ? { overflowY: "visible" }
    : { overflowY: "auto" };

  return (
    <aside
      className={isMobile ? "" : "sticky top-0 h-screen"}
      style={{
        width: isMobile ? "100%" : "25%",
        minWidth: isMobile ? "auto" : "280px",
        ...containerStyle,
      }}
    >
      <div className={isMobile ? "p-4 pb-8" : "p-6 pb-24"}>
        <AvatarSection isMobile={isMobile} />

        {/* Skills & Projects Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-grey)", lineHeight: 1.4 }}>
            SKILLS & PROJECTS
          </h2>
          {isAuthenticated && useDb && (
            <button
              onClick={() => setEditMode(!editMode)}
              style={{ fontSize: "10px", color: editMode ? "#E74C3C" : "var(--text-grey)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}
            >
              {editMode ? (language === "zh" ? "完成" : "DONE") : (language === "zh" ? "编辑" : "EDIT")}
            </button>
          )}
        </div>

        {/* Add new / Edit form */}
        {(isAdding || editingId !== null) && (
          <div className="mb-6 p-3" style={{ border: "1px solid var(--border-light)", background: "rgba(0,0,0,0.02)" }}>
            <div className="space-y-2">
              {[
                { key: "category", ph: "Category (e.g. Skills / Projects)" },
                { key: "zhTitle", ph: "中文标题" },
                { key: "zhSubtitle", ph: "中文副标题" },
                { key: "enTitle", ph: "EN Title" },
                { key: "enSubtitle", ph: "EN Subtitle" },
                { key: "year", ph: "Year" },
              ].map((f) => (
                <input
                  key={f.key}
                  placeholder={f.ph}
                  value={editForm[f.key as keyof typeof editForm]}
                  onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                  style={{ width: "100%", fontSize: "11px", padding: "6px 8px", border: "1px solid var(--border-light)", outline: "none", background: "transparent", color: "var(--text-charcoal)", fontFamily: "'Space Mono', monospace" }}
                />
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={saveEdit} style={{ fontSize: "10px", padding: "3px 10px", background: "#FFFFFF", color: "#1A1A1A", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>SAVE</button>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} style={{ fontSize: "10px", padding: "3px 10px", background: "none", border: "1px solid var(--border-light)", cursor: "pointer", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)" }}>CANCEL</button>
            </div>
          </div>
        )}

        {editMode && !isAdding && editingId === null && (
          <button
            onClick={startAdd}
            style={{ fontSize: "10px", color: "var(--text-charcoal)", background: "none", border: "1px dashed var(--border-light)", padding: "6px 12px", cursor: "pointer", fontFamily: "'Space Mono', monospace", width: "100%", marginBottom: "16px" }}
          >
            + {language === "zh" ? "添加条目" : "Add Entry"}
          </button>
        )}

        {/* CV List */}
        {sectionOrder.map((category) => {
          const sectionItems = sections[category];
          if (!sectionItems || sectionItems.length === 0) return null;
          return (
            <div key={category} style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "16px", marginBottom: "16px" }}>
              {sectionItems.map((item, idx) => (
                <div key={item.id} className="flex gap-4" style={{ marginBottom: idx < sectionItems.length - 1 ? "16px" : "0", position: "relative" }}>
                  {idx === 0 && <span style={{ fontSize: "12px", fontWeight: 400, color: "var(--text-charcoal)", lineHeight: 1.6, flexShrink: 0, width: "80px" }}>{category}</span>}
                  {idx > 0 && <span style={{ width: "80px", flexShrink: 0 }} />}
                  <div className="flex-1">
                    <p style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--text-charcoal)", whiteSpace: "pre-line" }}>{item.title}</p>
                    {item.subtitle && <p style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--text-grey)", whiteSpace: "pre-line" }}>{item.subtitle}</p>}
                    <p style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--text-charcoal)" }}>{item.year}</p>

                    {editMode && useDb && (
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => startEdit(item)} style={{ fontSize: "9px", color: "var(--text-grey)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>EDIT</button>
                        <button onClick={() => { if (confirm(language === "zh" ? "删除?" : "Delete?")) deleteCv.mutate({ id: item.id }); }} style={{ fontSize: "9px", color: "#E74C3C", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>DEL</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        <p style={{ fontSize: "11px", color: "var(--text-grey)", marginTop: "32px" }}>
          {latestDate
            ? "Last Updated " + new Date(latestDate).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
            : "Last Updated 2024"}
        </p>
      </div>
    </aside>
  );
}

interface AvatarSectionProps {
  isMobile: boolean;
}

function AvatarSection({ isMobile }: AvatarSectionProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const artFrameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [editingAvatar, setEditingAvatar] = useState(false);

  const { data: settings } = trpc.settings.get.useQuery();
  const { data: profileData } = trpc.profile.get.useQuery();
  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => utils.settings.get.invalidate(),
  });
  const updateBio = trpc.profile.update.useMutation({
    onSuccess: () => utils.profile.get.invalidate(),
  });

  const avatarUrl = settings?.avatarImage || "/images/portrait.jpg";

  // Badges
  let badges: Badge[] = [];
  try { if (profileData?.badges && typeof profileData.badges === "string") { const p = JSON.parse(profileData.badges); if (Array.isArray(p)) badges = p; } } catch {}

  const moveBadge = (from: number, to: number) => {
    const b = [...badges];
    const [moved] = b.splice(from, 1);
    b.splice(to, 0, moved);
    updateBio.mutate({ badges: JSON.stringify(b) });
  };

  // Only run GSAP parallax on desktop
  useEffect(() => {
    if (isMobile || !artFrameRef.current || !imageRef.current) return;
    const tween = gsap.to(imageRef.current, {
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: artFrameRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  }, [avatarUrl, isMobile]);

  return (
    <div className="mb-10">
      <div
        ref={artFrameRef}
        style={{
          border: "1px solid var(--border-light)",
          boxShadow: "0px 4px 15px rgba(0,0,0,0.08)",
          overflow: "hidden",
          aspectRatio: "1 / 1",
          width: isMobile ? "50%" : "100%",
          maxWidth: isMobile ? "200px" : "none",
          margin: isMobile ? "0 auto 16px" : "0",
        }}
      >
        <img
          ref={imageRef}
          src={avatarUrl}
          alt="Portrait"
          className="block"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
      </div>
      {isAuthenticated && (
        <div className="mt-2">
          {editingAvatar ? (
            <div className="p-2" style={{ border: "1px solid var(--border-light)" }}>
              <ImageUpload
                value={avatarUrl}
                onChange={(url) => {
                  updateSettings.mutate({ avatarImage: url });
                  setEditingAvatar(false);
                }}
                label="Avatar"
                variant="light"
              />
              <button
                onClick={() => setEditingAvatar(false)}
                style={{ fontSize: "10px", marginTop: "8px", padding: "3px 10px", background: "none", border: "1px solid var(--border-light)", cursor: "pointer", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)" }}
              >
                CLOSE
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingAvatar(true)}
              style={{ fontSize: "10px", color: "var(--text-grey)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}
            >
              EDIT AVATAR
            </button>
          )}
        </div>
      )}

      {/* Badges under avatar */}
      {badges.length > 0 && (
        <div className="mt-4" style={{ borderTop: "1px solid var(--border-light)", paddingTop: "14px" }}>
          <p style={{ fontSize: "10px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>ACHIEVEMENTS</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {badges.map((badge, idx) => (
              <div key={idx} style={{ position: "relative", textAlign: "center", width: "62px" }}
                onMouseEnter={(e) => { const t = e.currentTarget.querySelector(".btip") as HTMLElement; if (t) t.style.display = "block"; }}
                onMouseLeave={(e) => { const t = e.currentTarget.querySelector(".btip") as HTMLElement; if (t) t.style.display = "none"; }}
              >
                <div style={{ width: "38px", height: "38px", margin: "0 auto 2px", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border-light)", background: "var(--bg-warm-white)" }}>
                  {badge.icon ? (
                    <img src={badge.icon} alt={badge.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", opacity: 0.3 }}>🏆</div>
                  )}
                </div>
                <p style={{ fontSize: "8px", color: "var(--text-grey)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{badge.name}</p>
                <div className="btip" style={{ display: "none", position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.85)", color: "#fff", padding: "4px 8px", borderRadius: "3px", fontSize: "9px", whiteSpace: "nowrap", zIndex: 10, marginBottom: "4px" }}>
                  <strong>{badge.name}</strong><br />{badge.description}
                </div>
                {/* Reorder arrows for admin */}
                {isAuthenticated && (
                  <div style={{ position: "absolute", top: "-6px", right: "-2px", display: "flex", gap: "1px" }}>
                    {idx > 0 && (
                      <button onClick={() => { const b = [...badges]; const [m] = b.splice(idx, 1); b.splice(idx-1, 0, m); updateBio.mutate({ badges: JSON.stringify(b) }); }} style={{ fontSize: "7px", color: "var(--text-grey)", background: "var(--bg-warm-white)", border: "1px solid var(--border-light)", borderRadius: "2px", cursor: "pointer", padding: "0 2px", lineHeight: "12px" }}>▲</button>
                    )}
                    {idx < badges.length - 1 && (
                      <button onClick={() => { const b = [...badges]; const [m] = b.splice(idx, 1); b.splice(idx+1, 0, m); updateBio.mutate({ badges: JSON.stringify(b) }); }} style={{ fontSize: "7px", color: "var(--text-grey)", background: "var(--bg-warm-white)", border: "1px solid var(--border-light)", borderRadius: "2px", cursor: "pointer", padding: "0 2px", lineHeight: "12px" }}>▼</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
