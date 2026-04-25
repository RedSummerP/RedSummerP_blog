import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Login() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
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

    if (isRegister) {
      if (password.length < 6) {
        setError(language === "zh" ? "密码至少6位" : "Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError(language === "zh" ? "两次密码不一致" : "Passwords do not match");
        return;
      }
      registerMutation.mutate({
        username: username.trim(),
        password: password.trim(),
        name: name.trim() || undefined,
      });
    } else {
      loginMutation.mutate({
        username: username.trim(),
        password: password.trim(),
      });
    }
  };

  const t = {
    zh: {
      loginTitle: "管理员登入",
      registerTitle: "注册账户",
      username: "用户名",
      password: "密码",
      confirmPassword: "确认密码",
      name: "昵称（可选）",
      submit: "登入",
      registerSubmit: "注册",
      submitting: "处理中...",
      switchToRegister: "没有账户？点击注册",
      switchToLogin: "已有账户？点击登入",
      hint: "默认账户：admin / 123456",
    },
    en: {
      loginTitle: "Admin Login",
      registerTitle: "Create Account",
      username: "Username",
      password: "Password",
      confirmPassword: "Confirm Password",
      name: "Display Name (optional)",
      submit: "Log In",
      registerSubmit: "Sign Up",
      submitting: "Processing...",
      switchToRegister: "No account? Register here",
      switchToLogin: "Have an account? Log in",
      hint: "Default: admin / 123456",
    },
  };
  const s = t[language];

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg-warm-white)" }}
    >
      <div
        className="w-full max-w-sm mx-4"
        style={{
          border: "1px solid var(--border-light)",
          padding: "32px",
        }}
      >
        <h2
          style={{
            fontSize: "14px",
            fontWeight: 400,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--text-charcoal)",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          {isRegister ? s.registerTitle : s.loginTitle}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              style={{
                fontSize: "11px",
                color: "var(--text-grey)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              {s.username}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid var(--border-light)",
                padding: "10px 12px",
                fontSize: "12px",
                color: "var(--text-charcoal)",
                fontFamily: "'Space Mono', monospace",
                outline: "none",
              }}
            />
          </div>

          {isRegister && (
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--text-grey)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {s.name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid var(--border-light)",
                  padding: "10px 12px",
                  fontSize: "12px",
                  color: "var(--text-charcoal)",
                  fontFamily: "'Space Mono', monospace",
                  outline: "none",
                }}
              />
            </div>
          )}

          <div>
            <label
              style={{
                fontSize: "11px",
                color: "var(--text-grey)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              {s.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid var(--border-light)",
                padding: "10px 12px",
                fontSize: "12px",
                color: "var(--text-charcoal)",
                fontFamily: "'Space Mono', monospace",
                outline: "none",
              }}
            />
          </div>

          {isRegister && (
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--text-grey)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {s.confirmPassword}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid var(--border-light)",
                  padding: "10px 12px",
                  fontSize: "12px",
                  color: "var(--text-charcoal)",
                  fontFamily: "'Space Mono', monospace",
                  outline: "none",
                }}
              />
            </div>
          )}

          {error && (
            <p style={{ fontSize: "11px", color: "#E74C3C" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "12px",
              fontFamily: "'Space Mono', monospace",
              color: "var(--bg-warm-white)",
              background: "var(--text-charcoal)",
              border: "none",
              cursor: isPending ? "wait" : "pointer",
              opacity: isPending ? 0.7 : 1,
              letterSpacing: "0.05em",
            }}
          >
            {isPending ? s.submitting : (isRegister ? s.registerSubmit : s.submit)}
          </button>
        </form>

        <button
          onClick={() => { setIsRegister(!isRegister); setError(""); }}
          style={{
            fontSize: "11px",
            color: "var(--text-grey)",
            marginTop: "16px",
            textAlign: "center",
            fontFamily: "'Space Mono', monospace",
            background: "none",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          {isRegister ? s.switchToLogin : s.switchToRegister}
        </button>

        {!isRegister && (
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-grey)",
              marginTop: "12px",
              textAlign: "center",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {s.hint}
          </p>
        )}
      </div>
    </div>
  );
}
