import { useParams, useNavigate, useSearchParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useIsMobile } from "@/hooks/use-mobile";
import type { BlogPost } from "../../contracts/blog";
import ImageUpload from "./ImageUpload";
import MarkdownRenderer from "./MarkdownRenderer";

interface PostDetailProps {
  posts: BlogPost[];
}

export default function PostDetail({ posts }: PostDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const utils = trpc.useUtils();
  const isMobile = useIsMobile();

  const isEditMode = searchParams.get("mode") === "edit" && isAdmin;

  const post = posts.find((p) => p.id === Number(id));

  const updatePost = trpc.blog.update.useMutation({
    onSuccess: () => {
      utils.blog.list.invalidate();
      navigate(`/post/${id}`);
    },
  });

  const [editForm, setEditForm] = useState({
    year: "", image: "", isPublic: true, zhTitle: "", zhSubtitle: "", zhCollection: "",
    zhContent: "", zhDetailContent: "", enTitle: "", enSubtitle: "",
    enCollection: "", enContent: "", enDetailContent: "",
  });

  useEffect(() => {
    if (post && isEditMode) {
      setEditForm({
        year: post.year, image: post.image, isPublic: post.isPublic, zhTitle: post.zh.title,
        zhSubtitle: post.zh.subtitle, zhCollection: post.zh.collection,
        zhContent: post.zh.content, zhDetailContent: post.zh.detailContent,
        enTitle: post.en.title, enSubtitle: post.en.subtitle,
        enCollection: post.en.collection, enContent: post.en.content,
        enDetailContent: post.en.detailContent,
      });
    }
  }, [post, isEditMode]);

  useEffect(() => {
    if (contentRef.current && !isEditMode) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      );
    }
  }, [id, isEditMode]);

  const backText = language === "zh" ? "返回首页" : "Back to home";
  const notFoundText = language === "zh" ? "文章不存在" : "Article not found";
  const editThisText = language === "zh" ? "编辑此文章" : "Edit this post";
  const viewText = language === "zh" ? "查看文章" : "View article";

  const inputBase = {
    width: "100%",
    background: "#2A2A2A",
    border: "1px solid #444",
    borderRadius: "2px",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#FFFFFF",
    fontFamily: "'Space Mono', monospace",
    outline: "none",
  };

  const labelStyle = {
    fontSize: "11px",
    color: "rgba(255,255,255,0.6)",
    display: "block" as const,
    marginBottom: "6px",
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "0.05em",
  };

  const headerPad = isMobile ? "0 12px" : "0 24px";
  const contentPad = isMobile ? "16px" : "24px";

  if (!post) {
    return (
      <div className="flex items-center justify-center" style={{ height: "100vh", backgroundColor: "var(--bg-warm-white)" }}>
        <div className="text-center" style={{ padding: "0 24px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-grey)" }}>{notFoundText}</p>
          <button onClick={() => navigate("/")} style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            {backText}
          </button>
        </div>
      </div>
    );
  }

  // EDIT MODE
  if (isEditMode) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#1A1A1A" }}>
        <header className="fixed top-0 left-0 right-0 flex items-center justify-between" style={{ height: "40px", zIndex: 50, backgroundColor: "#1A1A1A", borderBottom: "1px solid #333", padding: headerPad }}>
          <button onClick={() => navigate("/")} style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "#FFFFFF", background: "none", border: "none", cursor: "pointer" }}>
            CREATOR'S LOG
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/post/${post.id}`)} style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer" }}>
              {viewText}
            </button>
            <button onClick={() => navigate("/")} style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "#FFFFFF", background: "none", border: "none", cursor: "pointer" }}>
              {language === "zh" ? "关闭" : "Close"}
            </button>
          </div>
        </header>

        <div className="mx-auto" style={{ maxWidth: "720px", padding: isMobile ? "56px 12px 40px" : "80px 24px 80px" }}>
          <div className="flex items-center justify-between mb-8">
            <h1 style={{ fontSize: "16px", fontWeight: 400, color: "#FFFFFF", letterSpacing: "0.05em" }}>{editThisText}</h1>
          </div>

          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="flex-1">
                <label style={labelStyle}>Year</label>
                <input type="text" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} style={inputBase} />
              </div>
              <div>
                <label style={labelStyle}>{language === "zh" ? "可见性" : "Visibility"}</label>
                <button
                  onClick={() => setEditForm({ ...editForm, isPublic: !editForm.isPublic })}
                  style={{
                    ...inputBase,
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: editForm.isPublic ? "rgba(46, 204, 113, 0.15)" : "rgba(231, 76, 60, 0.15)",
                    color: editForm.isPublic ? "#2ecc71" : "#e74c3c",
                    minWidth: "100px",
                  }}
                >
                  {editForm.isPublic ? (language === "zh" ? "公开" : "PUBLIC") : (language === "zh" ? "私密" : "PRIVATE")}
                </button>
              </div>
            </div>

            <div>
              <ImageUpload
                value={editForm.image}
                onChange={(url) => setEditForm({ ...editForm, image: url })}
                label="Image"
              />
            </div>

            <div style={{ borderTop: "1px solid #333", paddingTop: "20px" }}>
              <h3 style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "16px", letterSpacing: "0.05em", fontFamily: "'Space Mono', monospace" }}>中文内容</h3>
              <div className="space-y-4">
                <div><label style={labelStyle}>标题</label><input type="text" value={editForm.zhTitle} onChange={(e) => setEditForm({ ...editForm, zhTitle: e.target.value })} style={inputBase} /></div>
                <div><label style={labelStyle}>副标题</label><input type="text" value={editForm.zhSubtitle} onChange={(e) => setEditForm({ ...editForm, zhSubtitle: e.target.value })} style={inputBase} /></div>
                <div><label style={labelStyle}>分类</label><input type="text" value={editForm.zhCollection} onChange={(e) => setEditForm({ ...editForm, zhCollection: e.target.value })} style={inputBase} /></div>
                <div><label style={labelStyle}>摘要</label><textarea value={editForm.zhContent} onChange={(e) => setEditForm({ ...editForm, zhContent: e.target.value })} rows={3} style={{ ...inputBase, resize: "vertical" }} /></div>
                <div><label style={labelStyle}>详细内容</label><textarea value={editForm.zhDetailContent} onChange={(e) => setEditForm({ ...editForm, zhDetailContent: e.target.value })} rows={8} style={{ ...inputBase, resize: "vertical" }} /></div>
              </div>
            </div>

            <div className="flex gap-3" style={{ paddingTop: "8px" }}>
              <TranslateButton2 zhFields={editForm} onTranslated={(fields) => setEditForm({ ...editForm, ...fields })} />
            </div>

            <div style={{ borderTop: "1px solid #333", paddingTop: "20px" }}>
              <h3 style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "16px", letterSpacing: "0.05em", fontFamily: "'Space Mono', monospace" }}>EN Content</h3>
              <div className="space-y-4">
                <div><label style={labelStyle}>Title</label><input type="text" value={editForm.enTitle} onChange={(e) => setEditForm({ ...editForm, enTitle: e.target.value })} style={inputBase} /></div>
                <div><label style={labelStyle}>Subtitle</label><input type="text" value={editForm.enSubtitle} onChange={(e) => setEditForm({ ...editForm, enSubtitle: e.target.value })} style={inputBase} /></div>
                <div><label style={labelStyle}>Collection</label><input type="text" value={editForm.enCollection} onChange={(e) => setEditForm({ ...editForm, enCollection: e.target.value })} style={inputBase} /></div>
                <div><label style={labelStyle}>Summary</label><textarea value={editForm.enContent} onChange={(e) => setEditForm({ ...editForm, enContent: e.target.value })} rows={3} style={{ ...inputBase, resize: "vertical" }} /></div>
                <div><label style={labelStyle}>Detail</label><textarea value={editForm.enDetailContent} onChange={(e) => setEditForm({ ...editForm, enDetailContent: e.target.value })} rows={8} style={{ ...inputBase, resize: "vertical" }} /></div>
              </div>
            </div>

            <div className="flex gap-3 pt-4" style={{ borderTop: "1px solid #333" }}>
              <button
                onClick={() => updatePost.mutate({ id: post.id, ...editForm, sortOrder: post.id, isPublic: editForm.isPublic })}
                disabled={updatePost.isPending}
                style={{ flex: 1, padding: "12px", fontSize: "12px", fontFamily: "'Space Mono', monospace", color: "#1A1A1A", background: "#FFFFFF", border: "none", borderRadius: "2px", cursor: updatePost.isPending ? "wait" : "pointer", opacity: updatePost.isPending ? 0.7 : 1, letterSpacing: "0.05em" }}
              >
                {updatePost.isPending ? (language === "zh" ? "保存中..." : "Saving...") : (language === "zh" ? "保存" : "SAVE")}
              </button>
              <button
                onClick={() => navigate(`/post/${post.id}`)}
                style={{ flex: 1, padding: "12px", fontSize: "12px", fontFamily: "'Space Mono', monospace", color: "#FFFFFF", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "2px", cursor: "pointer", letterSpacing: "0.05em" }}
              >
                {language === "zh" ? "取消" : "CANCEL"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW MODE
  const content = post[language];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-warm-white)" }}>
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between" style={{ height: "40px", zIndex: 50, backgroundColor: "var(--bg-warm-white)", borderBottom: "1px solid var(--border-light)", padding: headerPad }}>
        <button onClick={() => navigate("/")} style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer" }}>
          CREATOR'S LOG
        </button>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <button onClick={() => navigate(`/post/${post.id}?mode=edit`)} style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "var(--text-grey)", background: "none", border: "none", cursor: "pointer" }}>
              EDIT
            </button>
          )}
          <button onClick={() => navigate("/")} style={{ fontSize: "12px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer" }}>
            {language === "zh" ? "关闭" : "Close"}
          </button>
        </div>
      </header>

      <div ref={contentRef} className="mx-auto" style={{ maxWidth: "680px", padding: isMobile ? "56px 16px 60px" : "80px 24px 80px" }}>
        <div className="mb-6 md:mb-8" style={{ border: "1px solid var(--border-light)" }}>
          <img src={post.image} alt={content.title} className="w-full h-auto block" loading="eager" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span style={{ fontSize: "11px", color: "var(--text-grey)" }}>{post.year}</span>
          <span style={{ fontSize: "11px", color: "var(--border-light)" }}> / </span>
          <span style={{ fontSize: "11px", color: "var(--text-grey)" }}>{content.collection}</span>
          {isAdmin && (
            <>
              <span style={{ fontSize: "11px", color: "var(--border-light)" }}> / </span>
              <span style={{
                fontSize: "10px",
                padding: "1px 6px",
                borderRadius: "2px",
                fontFamily: "'Space Mono', monospace",
                backgroundColor: post.isPublic ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)",
                color: post.isPublic ? "#2ecc71" : "#e74c3c",
              }}>
                {post.isPublic ? (language === "zh" ? "公开" : "PUBLIC") : (language === "zh" ? "私密" : "PRIVATE")}
              </span>
            </>
          )}
        </div>

        <h1 style={{ fontSize: isMobile ? "18px" : "22px", fontWeight: 400, lineHeight: 1.3, color: "var(--text-charcoal)", marginBottom: "6px" }}>{content.title}</h1>
        <p style={{ fontSize: "13px", color: "var(--text-grey)", lineHeight: 1.5, marginBottom: "32px" }}>{content.subtitle}</p>

        <div style={{ borderTop: "1px solid var(--border-light)", marginBottom: "32px" }} />

        <div>
          <MarkdownRenderer content={content.detailContent} />
        </div>

        <div style={{ borderTop: "1px solid var(--border-light)", marginTop: "48px", paddingTop: "24px" }}>
          <button onClick={() => navigate("/")} style={{ fontSize: "12px", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px" }}>
            {language === "zh" ? "返回全部文章" : "Back to all articles"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Mini translate button for PostDetail edit mode */
function TranslateButton2({ zhFields, onTranslated }: {
  zhFields: {
    zhTitle: string; zhSubtitle: string; zhCollection: string;
    zhContent: string; zhDetailContent: string;
  };
  onTranslated: (fields: {
    enTitle: string; enSubtitle: string; enCollection: string;
    enContent: string; enDetailContent: string;
  }) => void;
}) {
  const [translating, setTranslating] = useState(false);

  const translateField = async (text: string): Promise<string> => {
    if (!text.trim()) return "";
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      return data.translated || text;
    } catch {
      return text;
    }
  };

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const [enTitle, enSubtitle, enCollection, enContent, enDetailContent] = await Promise.all([
        translateField(zhFields.zhTitle),
        translateField(zhFields.zhSubtitle),
        translateField(zhFields.zhCollection),
        translateField(zhFields.zhContent),
        translateField(zhFields.zhDetailContent),
      ]);
      onTranslated({ enTitle, enSubtitle, enCollection, enContent, enDetailContent });
    } finally {
      setTranslating(false);
    }
  };

  return (
    <button
      onClick={handleTranslate}
      disabled={translating}
      style={{
        fontSize: "11px",
        fontFamily: "'Space Mono', monospace",
        color: translating ? "rgba(255,255,255,0.4)" : "#FFFFFF",
        background: translating ? "transparent" : "rgba(46, 204, 113, 0.15)",
        border: `1px solid ${translating ? "rgba(255,255,255,0.2)" : "rgba(46, 204, 113, 0.4)"}`,
        padding: "6px 14px",
        cursor: translating ? "wait" : "pointer",
        borderRadius: "2px",
      }}
    >
      {translating ? "TRANSLATING..." : "🌐 Translate to English"}
    </button>
  );
}
