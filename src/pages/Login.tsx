import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Login() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError(language === "zh" ? "请填写用户名和密码" : "Please fill in username and password");
      return;
    }

    loginMutation.mutate({
      username: username.trim(),
      password: password.trim(),
    });
  };

  const s = language === "zh" ? {
    title: "管理员登入",
    username: "用户名",
    password: "密码",
    submit: "登入",
    submitting: "处理中...",
  } : {
    title: "Admin Login",
    username: "Username",
    password: "Password",
    submit: "Log In",
    submitting: "Logging in...",
  };

  const isPending = loginMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-warm-white)" }}>
      <div className="w-full max-w-sm mx-4" style={{ border: "1px solid var(--border-light)", padding: "32px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 400, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-charcoal)", marginBottom: "24px" }}>
          {s.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={s.username}
              autoComplete="username"
              style={{
                width: "100%", fontSize: "12px", padding: "10px 12px",
                border: "1px solid var(--border-light)", outline: "none",
                color: "var(--text-charcoal)", fontFamily: "'Space Mono', monospace",
                background: "transparent", boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={s.password}
              autoComplete="current-password"
              style={{
                width: "100%", fontSize: "12px", padding: "10px 12px",
                border: "1px solid var(--border-light)", outline: "none",
                color: "var(--text-charcoal)", fontFamily: "'Space Mono', monospace",
                background: "transparent", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: "11px", color: "#E74C3C", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%", padding: "12px", fontSize: "12px",
              fontFamily: "'Space Mono', monospace",
              color: "var(--bg-warm-white)", background: "var(--text-charcoal)",
              border: "none", cursor: isPending ? "wait" : "pointer",
              opacity: isPending ? 0.7 : 1, letterSpacing: "0.05em",
            }}
          >
            {isPending ? s.submitting : s.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
