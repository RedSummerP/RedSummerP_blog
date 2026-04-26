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
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const utils = trpc.useUtils();

  const { data: myPostsRaw, isLoading } = trpc.blog.listMine.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: settings } = trpc.settings.get.useQuery();
  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: () => utils.settings.get.invalidate(),
  });

  const deletePost = trpc.blog.delete.useMutation({
    onSuccess: () => {
      utils.blog.listMine.invalidate();
      utils.blog.list.invalidate();
    },
  });

  const [editingAvatar, setEditingAvatar] = useState(false);

  const myPosts = myPostsRaw ? myPostsRaw.map(toBlogPost) : [];
  const avatarUrl = settings?.avatarImage || "/images/portrait.jpg";

  const t = {
    zh: {
      back: "返回首页",
      newPost: "+ 写文章",
      logout: "退出登录",
      role: "角色",
      admin: "管理员",
      user: "用户",
      articles: "我的文章",
      articleCount: "文章数",
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
    },
    en: {
      back: "Back to home",
      newPost: "+ New Post",
      logout: "Log out",
      role: "Role",
      admin: "Admin",
      user: "User",
      articles: "My Articles",
      articleCount: "Articles",
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
    },
  };
  const s = t[language];

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-warm-white)" }}>
      {/* ====== Profile Header (Steam Style) ====== */}
      <div
        style={{
          background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)",
          borderBottom: "1px solid var(--border-light)",
          position: "relative",
        }}
      >
        {/* Top Navigation Bar */}
        <header
          className="flex items-center justify-between px-6"
          style={{ height: "40px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={() => navigate("/")}
            style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer" }}
          >
            {s.back}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/new-post")}
              style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.1)", border: "none", padding: "4px 12px", cursor: "pointer", borderRadius: "2px" }}
            >
              {s.newPost}
            </button>
            <button
              onClick={logout}
              style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer" }}
            >
              {s.logout}
            </button>
          </div>
        </header>

        {/* Avatar + User Info Row */}
        <div className="flex items-end gap-4 px-6" style={{ paddingTop: "24px", paddingBottom: "16px" }}>
          {/* Avatar */}
          <div style={{ position: "relative", marginBottom: "-24px", zIndex: 10 }}>
            <img
              src={avatarUrl}
              alt="Avatar"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "4px",
                border: "2px solid #2a2a2a",
                objectFit: "cover",
                background: "#1a1a1a",
              }}
            />
          </div>

          {/* User Name + Role */}
          <div style={{ paddingBottom: "8px" }}>
            <h1 style={{ fontSize: "18px", fontWeight: 400, color: "#FFFFFF", letterSpacing: "0.02em" }}>
              {user?.name || user?.username}
            </h1>
            <span
              style={{
                fontSize: "10px",
                fontFamily: "'Space Mono', monospace",
                color: isAdmin ? "#2ecc71" : "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {isAdmin ? s.admin : s.user}
            </span>
          </div>
        </div>
      </div>

      {/* ====== Main Content ====== */}
      <div className="flex" style={{ paddingTop: "32px", maxWidth: "900px", margin: "0 auto", gap: "24px", paddingLeft: "24px", paddingRight: "24px" }}>
        {/* Left Sidebar */}
        <aside style={{ width: "200px", flexShrink: 0 }}>
          {/* Stats */}
          <div style={{ border: "1px solid var(--border-light)", padding: "16px", marginBottom: "16px" }}>
            <div style={{ marginBottom: "12px" }}>
              <p style={{ fontSize: "10px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {s.articleCount}
              </p>
              <p style={{ fontSize: "20px", color: "var(--text-charcoal)", fontFamily: "'Space Mono', monospace" }}>
                {myPosts.length}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "10px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {s.memberSince}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-charcoal)" }}>
                2024
              </p>
            </div>
          </div>

          {/* Avatar Edit */}
          {isAdmin && (
            <div style={{ border: "1px solid var(--border-light)", padding: "16px", marginBottom: "16px" }}>
              {!editingAvatar ? (
                <button
                  onClick={() => setEditingAvatar(true)}
                  style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                >
                  {s.editAvatar}
                </button>
              ) : (
                <div>
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
                    style={{ fontSize: "10px", marginTop: "8px", color: "var(--text-grey)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace" }}
                  >
                    {s.close}
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Right Content - Articles */}
        <main className="flex-1" style={{ minWidth: 0 }}>
          <h2
            style={{
              fontSize: "12px",
              fontWeight: 400,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--text-grey)",
              marginBottom: "24px",
              paddingBottom: "8px",
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            {s.articles}
          </h2>

          {isLoading ? (
            <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>{s.loading}</p>
          ) : myPosts.length === 0 ? (
            <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>{s.empty}</p>
          ) : (
            <div className="space-y-4">
              {myPosts.map((post) => {
                const content = post[language];
                return (
                  <div
                    key={post.id}
                    style={{
                      border: "1px solid var(--border-light)",
                      padding: "16px",
                      display: "flex",
                      gap: "16px",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Cover Image */}
                    <img
                      src={post.image}
                      alt={content.title}
                      style={{
                        width: "100px",
                        height: "70px",
                        objectFit: "cover",
                        border: "1px solid var(--border-light)",
                        flexShrink: 0,
                      }}
                    />

                    {/* Content */}
                    <div className="flex-1" style={{ minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: "14px",
                          fontWeight: 400,
                          color: "var(--text-charcoal)",
                          marginBottom: "4px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {content.title}
                      </h3>
                      <p style={{ fontSize: "11px", color: "var(--text-grey)", marginBottom: "8px" }}>
                        {post.year} / {content.collection}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            fontSize: "9px",
                            padding: "1px 6px",
                            fontFamily: "'Space Mono', monospace",
                            backgroundColor: post.isPublic ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)",
                            color: post.isPublic ? "#2ecc71" : "#e74c3c",
                          }}
                        >
                          {post.isPublic ? s.public : s.private}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2" style={{ flexShrink: 0 }}>
                      <button
                        onClick={() => navigate(`/post/${post.id}`)}
                        style={{ fontSize: "10px", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace", textDecoration: "underline", whiteSpace: "nowrap" }}
                      >
                        {s.view}
                      </button>
                      <button
                        onClick={() => navigate(`/post/${post.id}?mode=edit`)}
                        style={{ fontSize: "10px", color: "var(--text-grey)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace", textDecoration: "underline", whiteSpace: "nowrap" }}
                      >
                        {s.edit}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(s.confirmDelete)) {
                            deletePost.mutate({ id: post.id });
                          }
                        }}
                        style={{ fontSize: "10px", color: "#E74C3C", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace", textDecoration: "underline", whiteSpace: "nowrap" }}
                      >
                        {s.delete}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
