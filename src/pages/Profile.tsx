import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/providers/trpc";
import { toBlogPost } from "../../contracts/blog";

export default function Profile() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const utils = trpc.useUtils();

  const { data: myPostsRaw, isLoading } = trpc.blog.listMine.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deletePost = trpc.blog.delete.useMutation({
    onSuccess: () => {
      utils.blog.listMine.invalidate();
    },
  });

  const myPosts = myPostsRaw ? myPostsRaw.map(toBlogPost) : [];

  const t = {
    zh: {
      title: "个人主页",
      back: "返回首页",
      logout: "退出登录",
      role: "角色",
      admin: "管理员",
      user: "用户",
      newPost: "+ 写文章",
      myArticles: "我的文章",
      loading: "加载中...",
      empty: "还没有文章，点击"写文章"开始创作吧",
      edit: "编辑",
      delete: "删除",
      view: "查看",
      public: "公开",
      private: "私密",
      confirmDelete: "确定要删除这篇文章吗？",
    },
    en: {
      title: "Profile",
      back: "Back to home",
      logout: "Log out",
      role: "Role",
      admin: "Admin",
      user: "User",
      newPost: "+ New Post",
      myArticles: "My Articles",
      loading: "Loading...",
      empty: "No articles yet. Click \"New Post\" to start writing.",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      public: "Public",
      private: "Private",
      confirmDelete: "Are you sure you want to delete this post?",
    },
  };
  const s = t[language];

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-warm-white)" }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 flex items-center justify-between px-6"
        style={{ height: "40px", zIndex: 50, backgroundColor: "var(--bg-warm-white)", borderBottom: "1px solid var(--border-light)" }}
      >
        <button
          onClick={() => navigate("/")}
          style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer" }}
        >
          {s.back}
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/new-post")}
            style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer" }}
          >
            {s.newPost}
          </button>
          <button
            onClick={logout}
            style={{ fontSize: "11px", fontFamily: "'Space Mono', monospace", color: "var(--text-grey)", background: "none", border: "none", cursor: "pointer" }}
          >
            {s.logout}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto" style={{ maxWidth: "720px", padding: "80px 24px 80px" }}>
        {/* User Info */}
        <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "24px", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 400, color: "var(--text-charcoal)", marginBottom: "8px" }}>
            {user?.name || user?.username}
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>
            {s.role}: {isAdmin ? s.admin : s.user}
          </p>
        </div>

        {/* Articles */}
        <div className="flex items-center justify-between" style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-grey)" }}>
            {s.myArticles}
          </h2>
        </div>

        {isLoading ? (
          <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>{s.loading}</p>
        ) : myPosts.length === 0 ? (
          <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>{s.empty}</p>
        ) : (
          <div className="space-y-6">
            {myPosts.map((post) => {
              const content = post[language];
              return (
                <div
                  key={post.id}
                  style={{ border: "1px solid var(--border-light)", padding: "16px" }}
                >
                  <div className="flex gap-4 items-start">
                    <img
                      src={post.image}
                      alt={content.title}
                      style={{ width: "80px", height: "80px", objectFit: "cover", border: "1px solid var(--border-light)", flexShrink: 0 }}
                    />
                    <div className="flex-1">
                      <h3 style={{ fontSize: "14px", fontWeight: 400, color: "var(--text-charcoal)", marginBottom: "4px" }}>
                        {content.title}
                      </h3>
                      <p style={{ fontSize: "11px", color: "var(--text-grey)", marginBottom: "8px" }}>
                        {post.year} / {content.collection}
                      </p>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "1px 6px",
                          borderRadius: "2px",
                          fontFamily: "'Space Mono', monospace",
                          backgroundColor: post.isPublic ? "rgba(46, 204, 113, 0.1)" : "rgba(231, 76, 60, 0.1)",
                          color: post.isPublic ? "#2ecc71" : "#e74c3c",
                        }}
                      >
                        {post.isPublic ? s.public : s.private}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => navigate(`/post/${post.id}`)}
                      style={{ fontSize: "11px", color: "var(--text-charcoal)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace", textDecoration: "underline" }}
                    >
                      {s.view}
                    </button>
                    <button
                      onClick={() => navigate(`/post/${post.id}?mode=edit`)}
                      style={{ fontSize: "11px", color: "var(--text-grey)", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace", textDecoration: "underline" }}
                    >
                      {s.edit}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(s.confirmDelete)) {
                          deletePost.mutate({ id: post.id });
                        }
                      }}
                      style={{ fontSize: "11px", color: "#E74C3C", background: "none", border: "none", cursor: "pointer", fontFamily: "'Space Mono', monospace", textDecoration: "underline" }}
                    >
                      {s.delete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
