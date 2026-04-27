import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import ImageUpload from "./ImageUpload";

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
  const artFrameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const utils = trpc.useUtils();

  const { data: cvDataDb } = trpc.cv.list.useQuery();
  const createCv = trpc.cv.create.useMutation({ onSuccess: () => utils.cv.list.invalidate() });
  const updateCv = trpc.cv.update.useMutation({ onSuccess: () => utils.cv.list.invalidate() });
  const deleteCv = trpc.cv.delete.useMutation({ onSuccess: () => utils.cv.list.invalidate() });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ category: "", zhTitle: "", zhSubtitle: "", enTitle: "", enSubtitle: "", year: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!artFrameRef.current || !imageRef.current) return;
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

  return (
    <aside className="sticky top-0 h-screen overflow-y-auto" style={{ width: "25%", minWidth: "280px" }}>
      <div className="p-6 pb-24">
        <AvatarSection />

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

        {/* Add button (only in edit mode) */}
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

                    {/* Edit mode actions */}
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

        <p style={{ fontSize: "11px", color: "var(--text-grey)", marginTop: "32px" }}>Last Updated 2024</p>
      </div>
    </aside>
  );
}

function AvatarSection() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const artFrameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [editingAvatar, setEditingAvatar] = useState(false);

  const { data: settings } = trpc.settings.get.useQuery();
  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => utils.settings.get.invalidate(),
  });

  const avatarUrl = settings?.avatarImage || "/images/portrait.jpg";

  useEffect(() => {
    if (!artFrameRef.current || !imageRef.current) return;
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
  }, [avatarUrl]);

  return (
    <div className="mb-10">
      <div ref={artFrameRef} style={{ border: "1px solid var(--border-light)", boxShadow: "0px 4px 15px rgba(0,0,0,0.08)", overflow: "hidden", aspectRatio: "1 / 1", width: "100%" }}>
        <img ref={imageRef} src={avatarUrl} alt="Portrait" className="block" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
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
    </div>
  );
}
