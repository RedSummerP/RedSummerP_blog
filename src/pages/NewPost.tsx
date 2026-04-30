import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/providers/trpc";
import ImageUpload from "@/components/ImageUpload";

export default function NewPost() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    year: "2024",
    image: "/images/hero-art.jpg",
    isPublic: true,
    zhTitle: "", zhSubtitle: "", zhCollection: "", zhContent: "", zhDetailContent: "",
    enTitle: "", enSubtitle: "", enCollection: "", enContent: "", enDetailContent: "",
  });
  const [showEnglish, setShowEnglish] = useState(false);

  const createPost = trpc.blog.create.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      utils.blog.listMine.invalidate();
      navigate("/profile");
    },
  });

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const [translating, setTranslating] = useState(false);

  const translateField = async (zhText: string): Promise<string> => {
    if (!zhText.trim()) return "";
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: zhText }),
      });
      const data = await res.json();
      return data.translated || zhText;
    } catch {
      return zhText;
    }
  };

  const syncEnglish = async () => {
    setTranslating(true);
    try {
      const [enTitle, enSubtitle, enCollection, enContent, enDetailContent] = await Promise.all([
        form.enTitle || translateField(form.zhTitle),
        form.enSubtitle || translateField(form.zhSubtitle),
        form.enCollection || translateField(form.zhCollection),
        form.enContent || translateField(form.zhContent),
        form.enDetailContent || translateField(form.zhDetailContent),
      ]);
      setForm((prev) => ({
        ...prev,
        enTitle: prev.enTitle || enTitle,
        enSubtitle: prev.enSubtitle || enSubtitle,
        enCollection: prev.enCollection || enCollection,
        enContent: prev.enContent || enContent,
        enDetailContent: prev.enDetailContent || enDetailContent,
      }));
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = () => {
    if (!form.zhTitle) return;
    // If English fields are empty, auto-fill with Chinese
    const payload = {
      ...form,
      enTitle: form.enTitle || form.zhTitle,
      enSubtitle: form.enSubtitle || form.zhSubtitle,
      enCollection: form.enCollection || form.zhCollection,
      enContent: form.enContent || form.zhContent,
      enDetailContent: form.enDetailContent || form.zhDetailContent,
      sortOrder: 0,
    };
    createPost.mutate(payload);
  };

  const t = {
    zh: {
      title: "新建文章",
      back: "返回",
      submit: "发布",
      submitting: "发布中...",
      required: "标题为必填项",
      syncEnglish: "🔄 同步生成英文",
      showEnglish: "展开英文 ▼",
      hideEnglish: "收起英文 ▲",
      year: "年份",
      visibility: "可见性",
      public: "公开",
      private: "私密",
      zhContentLabel: "中文内容",
      enContentLabel: "English Content",
      titlePlaceholder: "标题",
      subtitlePlaceholder: "副标题",
      collectionPlaceholder: "分类",
      summaryPlaceholder: "摘要内容",
      detailPlaceholder: "详细内容",
    },
    en: {
      title: "New Post",
      back: "Back",
      submit: "Publish",
      submitting: "Publishing...",
      required: "Title is required",
      syncEnglish: "🔄 Sync to English",
      showEnglish: "Show English ▼",
      hideEnglish: "Hide English ▲",
      year: "Year",
      visibility: "Visibility",
      public: "Public",
      private: "Private",
      zhContentLabel: "Chinese Content",
      enContentLabel: "English Content",
      titlePlaceholder: "Title",
      subtitlePlaceholder: "Subtitle",
      collectionPlaceholder: "Collection",
      summaryPlaceholder: "Summary content",
      detailPlaceholder: "Detail content",
    },
  };
  const s = t[language === "zh" ? "zh" : "en"];

  const inputStyle = {
    width: "100%",
    fontSize: "12px",
    padding: "8px 10px",
    border: "1px solid var(--border-light)",
    outline: "none",
    color: "var(--text-charcoal)",
    fontFamily: "'Space Mono', monospace",
    background: "transparent",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-warm-white)" }}>
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between px-6" style={{ height: "40px", zIndex: 50, backgroundColor: "var(--bg-warm-white)", borderBottom: "1px solid var(--border-light)" }}>
        <button onClick={() => navigate("/profile")} style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer" }}>
          NEURAL ATELIER (BLOG)
        </button>
        <button onClick={() => navigate("/profile")} style={{ fontSize: "12px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer" }}>
          {s.back}
        </button>
      </header>

      {/* Form */}
      <div className="mx-auto" style={{ maxWidth: "680px", padding: "80px 24px 80px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 400, color: "var(--text-charcoal)", marginBottom: "32px" }}>{s.title}</h1>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>{s.year}</label>
              <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px" }}>{s.visibility}</label>
              <button
                onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
                style={{
                  ...inputStyle,
                  cursor: "pointer",
                  textAlign: "center",
                  backgroundColor: form.isPublic ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)",
                  color: form.isPublic ? "#2ecc71" : "#e74c3c",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {form.isPublic ? s.public : s.private}
              </button>
            </div>
          </div>

          <div>
            <ImageUpload
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              label="Image"
              variant="dark"
            />
          </div>

          {/* Chinese Content */}
          <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "16px" }}>
            <h3 style={{ fontSize: "12px", color: "var(--text-grey)", marginBottom: "12px" }}>{s.zhContentLabel}</h3>
            <div className="space-y-3">
              <input placeholder={s.titlePlaceholder} value={form.zhTitle} onChange={(e) => setForm({ ...form, zhTitle: e.target.value })} style={inputStyle} />
              <input placeholder={s.subtitlePlaceholder} value={form.zhSubtitle} onChange={(e) => setForm({ ...form, zhSubtitle: e.target.value })} style={inputStyle} />
              <input placeholder={s.collectionPlaceholder} value={form.zhCollection} onChange={(e) => setForm({ ...form, zhCollection: e.target.value })} style={inputStyle} />
              <textarea placeholder={s.summaryPlaceholder} value={form.zhContent} onChange={(e) => setForm({ ...form, zhContent: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              <textarea placeholder={s.detailPlaceholder} value={form.zhDetailContent} onChange={(e) => setForm({ ...form, zhDetailContent: e.target.value })} rows={6} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          </div>

          {/* English Toggle & Sync */}
          <div className="flex gap-3" style={{ paddingTop: "8px" }}>
            <button
              onClick={syncEnglish}
              disabled={translating}
              style={{
                fontSize: "11px",
                fontFamily: "'Space Mono', monospace",
                color: translating ? "var(--text-grey)" : "var(--text-charcoal)",
                background: translating ? "transparent" : "rgba(46, 204, 113, 0.08)",
                border: `1px solid ${translating ? "var(--border-light)" : "rgba(46, 204, 113, 0.3)"}`,
                padding: "6px 14px",
                cursor: translating ? "wait" : "pointer",
                borderRadius: "2px",
              }}
            >
              {translating ? "TRANSLATING..." : s.syncEnglish}
            </button>
            <button
              onClick={() => setShowEnglish(!showEnglish)}
              style={{
                fontSize: "11px",
                fontFamily: "'Space Mono', monospace",
                color: "var(--text-grey)",
                background: "transparent",
                border: "1px solid var(--border-light)",
                padding: "6px 14px",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              {showEnglish ? s.hideEnglish : s.showEnglish}
            </button>
          </div>

          {/* English Content (Collapsible) */}
          {showEnglish && (
            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "16px" }}>
              <h3 style={{ fontSize: "12px", color: "var(--text-grey)", marginBottom: "12px" }}>{s.enContentLabel}</h3>
              <div className="space-y-3">
                <input placeholder={s.titlePlaceholder} value={form.enTitle} onChange={(e) => setForm({ ...form, enTitle: e.target.value })} style={inputStyle} />
                <input placeholder={s.subtitlePlaceholder} value={form.enSubtitle} onChange={(e) => setForm({ ...form, enSubtitle: e.target.value })} style={inputStyle} />
                <input placeholder={s.collectionPlaceholder} value={form.enCollection} onChange={(e) => setForm({ ...form, enCollection: e.target.value })} style={inputStyle} />
                <textarea placeholder={s.summaryPlaceholder} value={form.enContent} onChange={(e) => setForm({ ...form, enContent: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                <textarea placeholder={s.detailPlaceholder} value={form.enDetailContent} onChange={(e) => setForm({ ...form, enDetailContent: e.target.value })} rows={6} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={createPost.isPending}
            style={{
              width: "100%", padding: "12px", fontSize: "12px", fontFamily: "'Space Mono', monospace",
              color: "var(--bg-warm-white)", background: "var(--text-charcoal)", border: "none",
              cursor: createPost.isPending ? "wait" : "pointer", opacity: createPost.isPending ? 0.7 : 1,
              letterSpacing: "0.05em", marginTop: "16px",
            }}
          >
            {createPost.isPending ? s.submitting : s.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
