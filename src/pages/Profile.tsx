import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/providers/trpc";
import { toBlogPost } from "../../contracts/blog";
import ImageUpload from "@/components/ImageUpload";

export default function Profile() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();

  const { data: myPostsRaw, isLoading } = trpc.blog.listMine.useQuery(undefined, { enabled: isAuthenticated });
  const { data: bio } = trpc.profile.get.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();
  const updateSettings = trpc.settings.update.useMutation({ onSuccess: () => utils.settings.get.invalidate() });

  const deletePost = trpc.blog.delete.useMutation({
    onSuccess: () => { utils.blog.listMine.invalidate(); utils.blog.list.invalidate(); },
  });

  const [editingAvatar, setEditingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<"articles" | "about">("articles");

  const myPosts = myPostsRaw ? myPostsRaw.map(toBlogPost) : [];
  const avatarUrl = settings?.avatarImage || "/images/portrait.jpg";
  const publicCount = myPosts.filter((p) => p.isPublic).length;
  const privateCount = myPosts.filter((p) => !p.isPublic).length;

  const t = {
    zh: {
      back: "返回首页",
      newPost: "+ 写文章",
      logout: "退出登录",
      articles: "文章",
      about: "关于",
      articleCount: "文章数",
      publicCount: "公开",
      privateCount: "私密",
      memberSince: "加入于",
      loading: "加载中...",
      empty: `还没有文章，点击"写文章"开始创作吧`,
      edit: "编辑",
      delete: "删除",
      view: "查看",
      public: "公开",
      private: "私密",
      confirmDelete: "确定要删除这篇文章吗？",
      editAvatar: "更换头像",
      close: "关闭",
      recentActivity: "最近动态",
      noBio: "暂无个人简介",
    },
    en: {
      back: "Back to home",
      newPost: "+ New Post",
      logout: "Log out",
      articles: "Articles",
      about: "About",
      articleCount: "Articles",
      publicCount: "Public",
      privateCount: "Private",
      memberSince: "Member since",
      loading: "Loading...",
      empty: "No articles yet. Click \"New Post\" to start writing.",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      public: "Public",
      private: "Private",
      confirmDelete: "Are you sure you want to delete this post?",
      editAvatar: "Change Avatar",
      close: "Close",
      recentActivity: "Recent Activity",
      noBio: "No bio yet",
    },
  };
  const s = t[language];

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const profileText = language === "zh" ? (bio?.zhText || s.noBio) : (bio?.enText || s.noBio);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#121212" }}>
      {/* ====== Steam-Style Header ====== */}
      <div style={{ background: "linear-gradient(135deg, #1a2a3a 0%, #0d1b2a 50%, #1b2838 100%)", position: "relative", minHeight: "240px" }}>
        {/* Nav Bar */}
        <header className="flex items-center justify-between px-6" style={{ height: "40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => navigate("/")} style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer" }}>
            {s.back}
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin/new-post")} style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "#fff", background: "rgba(255,255,255,0.1)", border: "none", padding: "5px 14px", cursor: "pointer", borderRadius: "2px" }}>
              {s.newPost}
            </button>
            <button onClick={logout} style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer" }}>
              {s.logout}
            </button>
          </div>
        </header>

        {/* Profile Hero */}
        <div className="flex items-end gap-5 px-6" style={{ paddingTop: "32px", paddingBottom: "24px" }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: "100px", height: "100px", borderRadius: "4px", border: "3px solid #1b2838", overflow: "hidden", background: "#0d1b2a", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
              <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {/* Avatar edit overlay */}
            <button
              onClick={() => setEditingAvatar(!editingAvatar)}
              style={{ position: "absolute", bottom: "-8px", right: "-8px", fontSize: "9px", color: "#fff", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", padding: "2px 6px", cursor: "pointer", fontFamily: "'Space Mono', monospace", borderRadius: "2px" }}
            >
              {s.editAvatar}
            </button>
          </div>

          {/* User Info */}
          <div style={{ paddingBottom: "4px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 400, color: "#FFFFFF", letterSpacing: "0.02em", marginBottom: "4px" }}>
              {user?.name || user?.username}
            </h1>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", maxWidth: "500px", lineHeight: 1.5 }}>
              {profileText.slice(0, 80)}{profileText.length > 80 ? "..." : ""}
            </p>
          </div>
        </div>

        {/* Avatar Upload Panel */}
        {editingAvatar && (
          <div className="px-6" style={{ paddingBottom: "16px" }}>
            <div className="p-3" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", maxWidth: "400px" }}>
              <ImageUpload value={avatarUrl} onChange={(url) => { updateSettings.mutate({ avatarImage: url }); setEditingAvatar(false); }} label="Avatar" variant="dark" />
              <button onClick={() => setEditingAvatar(false)} style={{ fontSize: "10px", marginTop: "8px", color: "rgba(255,255,255,0.5)", background: "none", border: "1px solid rgba(255,255,255,0.2)", padding: "3px 10px", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
                {s.close}
              </button>
            </div>
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {(["articles", "about"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: "12px",
                fontFamily: "'Space Mono', monospace",
                color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.4)",
                background: "none",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid #fff" : "2px solid transparent",
                padding: "10px 16px",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {s[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* ====== Main Content ====== */}
      <div className="flex" style={{ maxWidth: "980px", margin: "0 auto", gap: "24px", padding: "24px" }}>
        {/* Left Sidebar */}
        <aside style={{ width: "220px", flexShrink: 0 }}>
          {/* Stats Card */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "16px", marginBottom: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", textTransform: "uppercase" }}>{s.articleCount}</p>
                <p style={{ fontSize: "22px", color: "#fff", fontFamily: "'Space Mono', monospace" }}>{myPosts.length}</p>
              </div>
              <div>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", textTransform: "uppercase" }}>{s.publicCount}</p>
                <p style={{ fontSize: "22px", color: "#2ecc71", fontFamily: "'Space Mono', monospace" }}>{publicCount}</p>
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>{s.privateCount}</p>
              <p style={{ fontSize: "14px", color: "#e74c3c", fontFamily: "'Space Mono', monospace" }}>{privateCount}</p>
            </div>
          </div>

          {/* Member Since */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px" }}>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>{s.memberSince}</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>2024</p>
          </div>
        </aside>

        {/* Right Content */}
        <main className="flex-1" style={{ minWidth: 0 }}>
          {activeTab === "articles" ? (
            <>
              <h2 style={{ fontSize: "11px", fontWeight: 400, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "16px", letterSpacing: "0.1em", fontFamily: "'Space Mono', monospace" }}>
                {s.recentActivity}
              </h2>

              {isLoading ? (
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>{s.loading}</p>
              ) : myPosts.length === 0 ? (
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "32px", textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace" }}>{s.empty}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myPosts.map((post) => {
                    const content = post[language];
                    return (
                      <div key={post.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "0", overflow: "hidden" }}>
                        {/* Cover */}
                        <div style={{ width: "140px", height: "100px", flexShrink: 0, background: "#0d1b2a" }}>
                          <img src={post.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-4" style={{ minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            <h3 style={{ fontSize: "14px", fontWeight: 400, color: "#fff", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {content.title}
                            </h3>
                            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{post.year} / {content.collection}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span style={{ fontSize: "9px", padding: "2px 8px", fontFamily: "'Space Mono', monospace", backgroundColor: post.isPublic ? "rgba(46,204,113,0.15)" : "rgba(231,76,60,0.15)", color: post.isPublic ? "#2ecc71" : "#e74c3c" }}>
                              {post.isPublic ? s.public : s.private}
                            </span>
                            <button onClick={() => navigate(`/post/${post.id}`)} style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
                              {s.view}
                            </button>
                            <button onClick={() => navigate(`/post/${post.id}?mode=edit`)} style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
                              {s.edit}
                            </button>
                            <button onClick={() => { if (confirm(s.confirmDelete)) deletePost.mutate({ id: post.id }); }} style={{ fontSize: "10px", color: "#E74C3C", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}>
                              {s.delete}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* About Tab */
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "24px" }}>
              <h3 style={{ fontSize: "14px", color: "#fff", marginBottom: "16px", fontWeight: 400 }}>
                {language === "zh" ? "个人简介" : "Bio"}
              </h3>
              <p style={{ fontSize: "13px", lineHeight: 1.8, color: "rgba(255,255,255,0.6)", whiteSpace: "pre-line" }}>
                {profileText}
              </p>
              {bio?.email && (
                <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", marginBottom: "4px" }}>EMAIL</p>
                  <a href={`mailto:${bio.email}`} style={{ fontSize: "12px", color: "#66c0f4", textDecoration: "none" }}>{bio.email}</a>
                </div>
              )}
              {bio?.instagram && (
                <div style={{ marginTop: "12px" }}>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", marginBottom: "4px" }}>LINK</p>
                  <a href={bio.instagram} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#66c0f4", textDecoration: "none" }}>{bio.instagram}</a>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
