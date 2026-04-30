import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/providers/trpc";
import { toBlogPost } from "../../contracts/blog";
import ImageUpload from "@/components/ImageUpload";
import BadgeEditor from "@/components/BadgeEditor";
import type { Badge } from "@/components/BadgeEditor";

const c = {
  dark: {
    bg: "#121212", cardBg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)",
    textPrimary: "#FFFFFF", textDim: "rgba(255,255,255,0.4)", textSecondary: "rgba(255,255,255,0.5)",
    headerGrad: "linear-gradient(135deg, #1a2a3a 0%, #0d1b2a 50%, #1b2838 100%)",
    coverBg: "#0d1b2a", borderLight: "rgba(255,255,255,0.1)",
    avatarBorder: "#1b2838", avatarShadow: "0 4px 20px rgba(0,0,0,0.4)",
    sidebarBg: "rgba(255,255,255,0.02)",
  },
  light: {
    bg: "var(--bg-warm-white)", cardBg: "rgba(0,0,0,0.03)", border: "rgba(0,0,0,0.06)",
    textPrimary: "var(--text-charcoal)", textDim: "var(--text-grey)", textSecondary: "var(--text-grey)",
    headerGrad: "linear-gradient(135deg, #e8e0d8 0%, #d4ccc4 50%, #e0d8d0 100%)",
    coverBg: "#d4ccc4", borderLight: "rgba(0,0,0,0.1)",
    avatarBorder: "#c8c0b8", avatarShadow: "0 4px 20px rgba(0,0,0,0.1)",
    sidebarBg: "rgba(0,0,0,0.015)",
  },
};

export default function Profile() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  const t = theme === "dark" ? "dark" : "light";
  const utils = trpc.useUtils();

  const { data: myPostsRaw, isLoading } = trpc.blog.listMine.useQuery(undefined, { enabled: isAuthenticated });
  const { data: bio } = trpc.profile.get.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();
  const updateSettings = trpc.settings.update.useMutation({ onSuccess: () => utils.settings.get.invalidate() });
  const updateBio = trpc.profile.update.useMutation({ onSuccess: () => utils.profile.get.invalidate() });
  const deletePost = trpc.blog.delete.useMutation({ onSuccess: () => { utils.blog.listMine.invalidate(); utils.blog.list.invalidate(); } });

  const [editingAvatar, setEditingAvatar] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"articles" | "about">("articles");

  const myPosts = myPostsRaw ? myPostsRaw.map(toBlogPost) : [];
  const avatarUrl = settings?.avatarImage || "/images/portrait.jpg";
  const publicCount = myPosts.filter((p) => p.isPublic).length;
  const privateCount = myPosts.filter((p) => !p.isPublic).length;

  let badges: Badge[] = [];
  try { if (bio?.badges && typeof bio.badges === "string") { const p = JSON.parse(bio.badges); if (Array.isArray(p)) badges = p; } } catch {}
  const saveBadges = (nb: Badge[]) => { updateBio.mutate({ badges: JSON.stringify(nb) }); };

  if (!isAuthenticated) { navigate("/login"); return null; }

  const profileText = language === "zh" ? (bio?.zhText || "暂无简介") : (bio?.enText || "No bio");

  const L = (zh: string, en: string) => language === "zh" ? zh : en;

  // Badge display component
  const BadgeBlock = ({ badge }: { badge: Badge }) => (
    <div style={{ position: "relative", textAlign: "center", width: "72px" }}
      onMouseEnter={(e) => { const el = e.currentTarget.querySelector(".bt") as HTMLElement; if (el) el.style.display = "block"; }}
      onMouseLeave={(e) => { const el = e.currentTarget.querySelector(".bt") as HTMLElement; if (el) el.style.display = "none"; }}
    >
      <div style={{ width: "48px", height: "48px", margin: "0 auto 3px", borderRadius: "6px", overflow: "hidden", border: `1px solid ${c[t].border}`, background: c[t].cardBg }}>
        {badge.icon ? <img src={badge.icon} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", opacity: 0.3 }}>🏆</div>}
      </div>
      <p style={{ fontSize: "9px", color: c[t].textDim, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{badge.name}</p>
      <div className="bt" style={{ display: "none", position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.9)", color: "#fff", padding: "4px 8px", borderRadius: "3px", fontSize: "10px", whiteSpace: "nowrap", zIndex: 10, marginBottom: "4px" }}>
        <strong>{badge.name}</strong><br />{badge.description}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: c[t].bg }}>
      {/* ===== Cover / Header Area ===== */}
      <div style={{ background: c[t].headerGrad, position: "relative", paddingBottom: "16px" }}>
        <header style={{ height: "40px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: `1px solid ${c[t].border}` }}>
          <button onClick={() => navigate("/")} style={{ fontSize: "12px", letterSpacing: "0.05em", textTransform: "uppercase", color: c[t].textDim, background: "none", border: "none", cursor: "pointer" }}>{L("返回", "Back")}</button>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button onClick={() => navigate("/admin/new-post")} style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: c[t].textPrimary, background: t === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", border: "none", padding: "5px 14px", cursor: "pointer", borderRadius: "2px" }}>{L("+ 写文章", "+ New Post")}</button>
            <button onClick={() => setEditMode(!editMode)} style={{ fontSize: "10px", fontFamily: "'Space Mono', monospace", color: editMode ? "#2ecc71" : c[t].textDim, background: "none", border: `1px solid ${editMode ? "rgba(46,204,113,0.3)" : c[t].border}`, padding: "4px 10px", cursor: "pointer", borderRadius: "2px" }}>{editMode ? `✏️ ${L("编辑中", "Editing")}` : L("编辑模式", "Edit")}</button>
            <button onClick={logout} style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: c[t].textDim, background: "none", border: "none", cursor: "pointer" }}>{L("退出", "Log Out")}</button>
          </div>
        </header>

        <div style={{ display: "flex", gap: "20px", padding: "20px 24px", alignItems: "flex-end" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "4px", border: `3px solid ${c[t].avatarBorder}`, overflow: "hidden", background: c[t].coverBg, boxShadow: c[t].avatarShadow }}>
              <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {editMode && <button onClick={() => setEditingAvatar(!editingAvatar)} style={{ position: "absolute", bottom: "-6px", right: "-6px", fontSize: "9px", color: "#fff", background: "rgba(0,0,0,0.6)", border: `1px solid ${c[t].borderLight}`, padding: "2px 6px", cursor: "pointer", fontFamily: "'Space Mono', monospace", borderRadius: "2px" }}>{L("编辑", "Edit")}</button>}
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 400, color: c[t].textPrimary, margin: "0 0 2px" }}>{user?.name || user?.username}</h1>
            <p style={{ fontSize: "12px", color: c[t].textDim, margin: 0, lineHeight: 1.5 }}>{profileText.slice(0, 120)}{profileText.length > 120 ? "..." : ""}</p>
          </div>
        </div>

        {editingAvatar && editMode && (
          <div style={{ padding: "0 24px 16px" }}>
            <div style={{ border: `1px solid ${c[t].borderLight}`, background: "rgba(0,0,0,0.3)", maxWidth: "400px", padding: "12px" }}>
              <ImageUpload value={avatarUrl} onChange={(url) => { updateSettings.mutate({ avatarImage: url }); setEditingAvatar(false); }} label="Avatar" variant="dark" />
              <button onClick={() => setEditingAvatar(false)} style={{ marginTop: "8px", fontSize: "10px", color: c[t].textDim, background: "none", border: `1px solid ${c[t].borderLight}`, padding: "3px 10px", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>CLOSE</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", padding: "0 24px", borderTop: `1px solid ${c[t].border}` }}>
          {(["articles", "about"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              fontSize: "12px", fontFamily: "'Space Mono', monospace",
              color: activeTab === tab ? c[t].textPrimary : c[t].textDim,
              background: "none", border: "none",
              borderBottom: activeTab === tab ? `2px solid ${c[t].textPrimary}` : "2px solid transparent",
              padding: "10px 16px", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em",
            }}>{L(tab === "articles" ? "文章" : "关于", tab === "articles" ? "Articles" : "About")}</button>
          ))}
        </div>
      </div>

      {/* ===== Main Layout: Sidebar + Content ===== */}
      <div style={{ display: "flex", maxWidth: "980px", margin: "0 auto", padding: "16px 24px", gap: "20px" }}>
        {/* ===== Left Sidebar ===== */}
        <aside style={{ width: "180px", flexShrink: 0 }}>
          {/* Stats */}
          <div style={{ background: c[t].sidebarBg, border: `1px solid ${c[t].border}`, padding: "14px", marginBottom: "12px", borderRadius: "4px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div><p style={{ fontSize: "9px", color: c[t].textDim, fontFamily: "'Space Mono', monospace", margin: "0 0 2px", textTransform: "uppercase" }}>{L("文章", "Posts")}</p><p style={{ fontSize: "20px", color: c[t].textPrimary, fontFamily: "'Space Mono', monospace", margin: 0 }}>{myPosts.length}</p></div>
              <div><p style={{ fontSize: "9px", color: c[t].textDim, fontFamily: "'Space Mono', monospace", margin: "0 0 2px", textTransform: "uppercase" }}>{L("公开", "Public")}</p><p style={{ fontSize: "20px", color: "#2ecc71", fontFamily: "'Space Mono', monospace", margin: 0 }}>{publicCount}</p></div>
            </div>
            <p style={{ fontSize: "9px", color: c[t].textDim, fontFamily: "'Space Mono', monospace", margin: "0 0 2px", textTransform: "uppercase" }}>{L("私密", "Private")}</p>
            <p style={{ fontSize: "14px", color: "#e74c3c", fontFamily: "'Space Mono', monospace", margin: 0 }}>{privateCount}</p>
          </div>

          {/* Badges in sidebar */}
          {badges.length > 0 && (
            <div style={{ background: c[t].sidebarBg, border: `1px solid ${c[t].border}`, padding: "14px", borderRadius: "4px" }}>
              <p style={{ fontSize: "9px", color: c[t].textDim, fontFamily: "'Space Mono', monospace", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "1px" }}>{L("荣誉徽章", "Achievements")}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {badges.map((badge, i) => <BadgeBlock key={i} badge={badge} />)}
              </div>
            </div>
          )}
        </aside>

        {/* ===== Main Content ===== */}
        <main className="flex-1" style={{ minWidth: 0 }}>
          {/* ---- Articles Tab ---- */}
          {activeTab === "articles" && (
            <>
              <h2 style={{ fontSize: "11px", fontWeight: 400, textTransform: "uppercase", color: c[t].textDim, marginBottom: "14px", letterSpacing: "0.1em", fontFamily: "'Space Mono', monospace" }}>{L("最近动态", "Activity")}</h2>
              {isLoading ? (
                <p style={{ fontSize: "12px", color: c[t].textDim, fontFamily: "'Space Mono', monospace" }}>{L("加载中...", "Loading...")}</p>
              ) : myPosts.length === 0 ? (
                <div style={{ background: c[t].cardBg, border: `1px solid ${c[t].border}`, padding: "32px", textAlign: "center", borderRadius: "4px" }}>
                  <p style={{ fontSize: "12px", color: c[t].textDim, fontFamily: "'Space Mono', monospace" }}>{L("还没有文章", "No articles yet")}</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {myPosts.map((post) => {
                    const content = post[language];
                    return (
                      <div key={post.id} style={{ background: c[t].cardBg, border: `1px solid ${c[t].border}`, display: "flex", overflow: "hidden", borderRadius: "4px" }}>
                        <div style={{ width: "120px", height: "85px", flexShrink: 0, background: c[t].coverBg }}>
                          <img src={post.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ flex: 1, padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          <h3 style={{ fontSize: "13px", fontWeight: 400, color: c[t].textPrimary, margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{content.title}</h3>
                          <p style={{ fontSize: "10px", color: c[t].textDim, margin: "0 0 6px" }}>{post.year} / {content.collection}</p>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "9px", padding: "1px 6px", fontFamily: "'Space Mono', monospace", backgroundColor: post.isPublic ? "rgba(46,204,113,0.15)" : "rgba(231,76,60,0.15)", color: post.isPublic ? "#2ecc71" : "#e74c3c" }}>{post.isPublic ? L("公开", "Public") : L("私密", "Private")}</span>
                            <button onClick={() => navigate(`/post/${post.id}`)} style={{ fontSize: "10px", color: c[t].textDim, background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>{L("查看", "View")}</button>
                            {editMode && (
                              <>
                                <button onClick={() => navigate(`/post/${post.id}?mode=edit`)} style={{ fontSize: "10px", color: c[t].textDim, background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>{L("编辑", "Edit")}</button>
                                <button onClick={() => { if (confirm(L("确定删除？", "Delete?"))) deletePost.mutate({ id: post.id }); }} style={{ fontSize: "10px", color: "#E74C3C", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>{L("删除", "Del")}</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ---- About Tab ---- */}
          {activeTab === "about" && (
            <div style={{ background: c[t].cardBg, border: `1px solid ${c[t].border}`, padding: "20px", borderRadius: "4px" }}>
              <h3 style={{ fontSize: "13px", color: c[t].textPrimary, marginBottom: "12px", fontWeight: 400 }}>{L("个人简介", "Bio")}</h3>
              <p style={{ fontSize: "12px", lineHeight: 1.8, color: c[t].textSecondary, whiteSpace: "pre-line", margin: 0 }}>{profileText}</p>
              {bio?.email && (
                <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: `1px solid ${c[t].border}` }}>
                  <p style={{ fontSize: "10px", color: c[t].textDim, fontFamily: "'Space Mono', monospace", margin: "0 0 4px" }}>EMAIL</p>
                  <a href={`mailto:${bio.email}`} style={{ fontSize: "12px", color: t === "dark" ? "#66c0f4" : "#2D6A65", textDecoration: "none" }}>{bio.email}</a>
                </div>
              )}
              {bio?.instagram && (
                <div style={{ marginTop: "10px" }}>
                  <p style={{ fontSize: "10px", color: c[t].textDim, fontFamily: "'Space Mono', monospace", margin: "0 0 4px" }}>LINK</p>
                  <a href={bio.instagram} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: t === "dark" ? "#66c0f4" : "#2D6A65", textDecoration: "none" }}>{bio.instagram}</a>
                </div>
              )}

              {/* Badge editor (in About tab, admin only) */}
              {editMode && (
                <div style={{ marginTop: "24px", borderTop: `1px solid ${c[t].border}`, paddingTop: "16px" }}>
                  <BadgeEditor badges={badges} onUpdate={saveBadges} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
