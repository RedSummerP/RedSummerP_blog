import { useState } from "react";
import { Routes, Route } from "react-router";
import LeftColumn from "./components/LeftColumn";
import MiddleColumn from "./components/MiddleColumn";
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
import { useIsMobile } from "@/hooks/use-mobile";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import MiniMusicPlayer from "./components/MiniMusicPlayer";
import Guestbook from "./pages/Guestbook";
import NewPost from "./pages/NewPost";
import MusicLibrary from "./pages/MusicLibrary";
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
  const [showRightPanel, setShowRightPanel] = useState(false);
  const { isAdmin } = useAuth();
  const isMobile = useIsMobile();

  const { data: publicPosts } = trpc.blog.list.useQuery();
  const { data: adminPosts } = trpc.blog.listAdmin.useQuery(undefined, { enabled: isAdmin });
  const dbPosts = isAdmin ? adminPosts : publicPosts;
  const isLoading = isAdmin
    ? (adminPosts === undefined)
    : (publicPosts === undefined);
  const posts: BlogPost[] = dbPosts ? dbPosts.map(toBlogPost) : [];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-warm-white)" }}>
      {/* Header - responsive */}
      <header
        className="fixed top-0 left-0 right-0 flex items-center justify-between"
        style={{
          height: isMobile ? "48px" : "40px",
          zIndex: 50,
          backgroundColor: "var(--bg-warm-white)",
          borderBottom: isMobile ? "1px solid var(--border-light)" : "none",
          padding: isMobile ? "0 12px" : "0 24px",
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontSize: isMobile ? "11px" : "12px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-charcoal)" }}>
            CREATOR'S LOG
          </span>
          {/* Mobile right panel toggle */}
          {isMobile && (
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              style={{
                fontSize: "11px",
                fontFamily: "'Space Mono', monospace",
                color: "var(--text-grey)",
                background: "none",
                border: "1px solid var(--border-light)",
                padding: "2px 8px",
                cursor: "pointer",
              }}
            >
              {showRightPanel ? "CLOSE" : "INFO"}
            </button>
          )}
        </div>
        <ToggleBar onSettingsClick={() => setShowSettings(true)} />
      </header>

      {/* Mobile: Right column overlay */}
      {isMobile && showRightPanel && (
        <div
          style={{
            position: "fixed",
            top: "48px",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            backgroundColor: "var(--bg-warm-white)",
            overflowY: "auto",
          }}
        >
          <div
            className="flex flex-col"
            style={{ height: "100%" }}
          >
            {/* Compact left column content */}
            <div style={{ padding: "16px", borderBottom: "1px solid var(--border-light)" }}>
              <button
                onClick={() => setShowContact(true)}
                style={{
                  fontSize: "12px",
                  fontFamily: "'Space Mono', monospace",
                  color: "var(--text-charcoal)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                CONTACT
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <RightColumn />
            </div>
          </div>
        </div>
      )}

      {/* Main layout - responsive */}
      {isMobile ? (
        /* Mobile: single column */
        <div style={{ paddingTop: "48px" }}>
          {isLoading ? (
            <div className="flex items-center justify-center" style={{ padding: "48px 16px" }}>
              <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>LOADING...</p>
            </div>
          ) : (
            <MiddleColumn posts={posts} />
          )}
        </div>
      ) : (
        /* Desktop: three columns */
        <div className="flex" style={{ paddingTop: "40px", height: "100vh" }}>
          <LeftColumn onContactClick={() => setShowContact(true)} />
          {isLoading ? (
            <main className="flex-1 flex items-center justify-center" style={{ borderRight: "1px solid var(--border-light)" }}>
              <p style={{ fontSize: "12px", color: "var(--text-grey)", fontFamily: "'Space Mono', monospace" }}>LOADING...</p>
            </main>
          ) : (
            <MiddleColumn posts={posts} />
          )}
          <RightColumn />
        </div>
      )}

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
        <MiniMusicPlayer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/guestbook" element={<Guestbook />} />
          <Route path="/admin/new-post" element={<NewPost />} />
                  <Route path="/profile" element={<Profile />} />
          <Route path="/music" element={<MusicLibrary />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </LanguageProvider>
    </ThemeProvider>
  );
}
