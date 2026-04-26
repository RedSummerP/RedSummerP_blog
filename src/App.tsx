import { useState } from "react";
import { Routes, Route } from "react-router";
import LeftColumn from "./components/LeftColumn";
import RightColumn from "./components/RightColumn";
import PostDetail from "./components/PostDetail";
import ContactModal from "./components/ContactModal";
import SettingsModal from "./components/SettingsModal";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { trpc } from "@/providers/trpc";
import type { BlogPost } from "../contracts/blog";
import { toBlogPost } from "../contracts/blog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Guestbook from "./pages/Guestbook";
import NewPost from "./pages/NewPost";
import Profile from "./pages/Profile";

function ToggleBar({ onSettingsClick }: { onSettingsClick?: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { user, isAuthenticated, isLoading, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4">
      {/* Auth / Settings */}
      {isLoading ? null : isAuthenticated ? (
        <>
          {/* Settings Gear - admin only */}
          {isAdmin && onSettingsClick && (
            <button
              onClick={onSettingsClick}
              title={language === "zh" ? "账户设置" : "Account Settings"}
              style={{
                fontSize: "13px",
                fontFamily: "'Space Mono', monospace",
                color: "var(--text-charcoal)",
                background: "none",
                border: "none",
                cursor: "pointer",
                transition: "color 0.2s ease",
                letterSpacing: "0.05em",
                padding: 0,
                lineHeight: 1,
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--accent-teal)"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--text-charcoal)"; }}
            >
              &#9881;
            </button>
          )}
          {/* Username - click to profile */}
          <button
            onClick={() => navigate("/profile")}
            style={{
              fontSize: "12px",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-charcoal)",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.2s ease",
              letterSpacing: "0.05em",
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--accent-teal)"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--text-charcoal)"; }}
          >
            {user?.username || user?.name || "ADMIN"}
          </button>
          {/* Logout */}
          <button
            onClick={logout}
            title={language === "zh" ? "退出登录" : "Log out"}
            style={{
              fontSize: "12px",
              fontFamily: "'Space Mono', monospace",
              color: "var(--text-grey)",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.2s ease",
              letterSpacing: "0.05em",
              padding: 0,
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#E74C3C"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--text-grey)"; }}
          >
            &#x2715;
          </button>
        </>
      ) : (
        <button
          onClick={() => navigate("/login")}
          style={{
            fontSize: "12px",
            fontFamily: "'Space Mono', monospace",
            color: "var(--text-charcoal)",
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "color 0.2s ease",
            letterSpacing: "0.05em",
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--accent-teal)"; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--text-charcoal)"; }}
        >
          {language === "zh" ? "登入" : "LOG IN"}
        </button>
      )}

      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        style={{
          fontSize: "12px",
          fontFamily: "'Space Mono', monospace",
          color: "var(--text-charcoal)",
          background: "none",
          border: "none",
          cursor: "pointer",
          transition: "color 0.2s ease",
          letterSpacing: "0.05em",
        }}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--accent-teal)"; }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--text-charcoal)"; }}
      >
        {language === "zh" ? "中 / EN" : "ZH / en"}
      </button>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          fontSize: "12px",
          fontFamily: "'Space Mono', monospace",
          color: "var(--text-charcoal)",
          background: "none",
          border: "none",
          cursor: "pointer",
          transition: "color 0.2s ease",
          letterSpacing: "0.05em",
        }}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--accent-teal)"; }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--text-charcoal)"; }}
      >
        {theme === "light" ? "DARK" : "LIGHT"}
      </button>
    </div>
  );
}

function HomePage() {
  const [showContact, setShowContact] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { data: bio } = trpc.profile.get.useQuery();

  const welcomeText = language === "zh"
    ? (bio?.zhText || "欢迎来到我的个人空间。这里记录着我的思考、创作与探索。")
    : (bio?.enText || "Welcome to my personal space. A collection of thoughts, creations, and explorations.");

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-warm-white)" }}>
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between px-6" style={{ height: "40px", zIndex: 50, backgroundColor: "transparent" }}>
        <span style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-charcoal)" }}>
          CREATOR'S LOG
        </span>
        <ToggleBar onSettingsClick={() => setShowSettings(true)} />
      </header>

      <div className="flex" style={{ paddingTop: "40px", height: "100vh" }}>
        <LeftColumn onContactClick={() => setShowContact(true)} />
        <main className="flex-1 overflow-y-auto" style={{ borderRight: "1px solid var(--border-light)", height: "100vh" }}>
          <div className="p-6 pb-24" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-grey)", marginBottom: "32px" }}>
              {language === "zh" ? "关于" : "ABOUT"}
            </h2>
            <p style={{ fontSize: "13px", lineHeight: 1.8, color: "var(--text-charcoal)", whiteSpace: "pre-line", marginBottom: "32px" }}>
              {welcomeText}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => navigate("/profile")}
                style={{
                  fontSize: "12px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--bg-warm-white)",
                  background: "var(--text-charcoal)",
                  border: "none",
                  padding: "10px 20px",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                }}
              >
                {language === "zh" ? "查看我的文章 →" : "VIEW MY ARTICLES →"}
              </button>
            )}
          </div>
        </main>
        <RightColumn />
      </div>

      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}

function PostPage() {
  const { isAdmin } = useAuth();
  const { data: publicPosts } = trpc.blog.list.useQuery();
  const { data: adminPosts } = trpc.blog.listAdmin.useQuery(undefined, { enabled: isAdmin });
  const dbPosts = isAdmin ? adminPosts : publicPosts;
  const posts: BlogPost[] = dbPosts ? dbPosts.map(toBlogPost) : [];
  return <PostDetail posts={posts} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/guestbook" element={<Guestbook />} />
          <Route path="/admin/new-post" element={<NewPost />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </LanguageProvider>
    </ThemeProvider>
  );
}
