import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Auth() {
  const [mode, setMode] = useState("login"); // login | register | otp
  const [otpStep, setOtpStep] = useState("phone"); // phone | verify
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveToken = (token, user) => {
    localStorage.setItem("legalitt_token", token);
    localStorage.setItem("legalitt_user", JSON.stringify(user));
    window.location.reload();
  };

  const handleRegister = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!data.success) return setError(data.message);
      saveToken(data.token, data.user);
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!data.success) return setError(data.message);
      saveToken(data.token, data.user);
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  const handleSendOTP = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/send-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone })
      });
      const data = await res.json();
      if (!data.success) return setError(data.message);
      setOtpStep("verify");
      setSuccess("OTP sent successfully!");
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, otp: form.otp, name: form.name })
      });
      const data = await res.json();
      if (!data.success) return setError(data.message);
      saveToken(data.token, data.user);
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0fafa", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: "24px", padding: "36px 28px", width: "100%", maxWidth: "400px", boxShadow: "0 8px 40px rgba(0,180,160,0.10)" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#0d9488", letterSpacing: "-1px" }}>⚖️ Legalitt</div>
          <div style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>Your legal partner</div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "12px", padding: "4px", marginBottom: "24px" }}>
          {["login", "register", "otp"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); setOtpStep("phone"); }}
              style={{ flex: 1, padding: "8px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px",
                background: mode === m ? "#0d9488" : "transparent", color: mode === m ? "#fff" : "#64748b", transition: "all 0.2s" }}>
              {m === "login" ? "Login" : m === "register" ? "Register" : "OTP"}
            </button>
          ))}
        </div>

        {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}
        {success && <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "10px 14px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px" }}>{success}</div>}

        {/* Login */}
        {mode === "login" && (
          <div>
            <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handle}
              style={inputStyle} />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle}
              style={inputStyle} />
            <button onClick={handleLogin} disabled={loading} style={btnStyle}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        )}

        {/* Register */}
        {mode === "register" && (
          <div>
            <input name="name" placeholder="Full Name" value={form.name} onChange={handle} style={inputStyle} />
            <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handle} style={inputStyle} />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle} style={inputStyle} />
            <button onClick={handleRegister} disabled={loading} style={btnStyle}>
              {loading ? "Registering..." : "Create Account"}
            </button>
          </div>
        )}

        {/* OTP */}
        {mode === "otp" && otpStep === "phone" && (
          <div>
            <input name="name" placeholder="Your Name (optional)" value={form.name} onChange={handle} style={inputStyle} />
            <div style={{ display: "flex", border: "1.5px solid #e2e8f0", borderRadius: "12px", marginBottom: "14px", overflow: "hidden" }}>
              <span style={{ padding: "14px 12px", background: "#f8fafc", color: "#475569", fontSize: "14px", borderRight: "1px solid #e2e8f0" }}>🇮🇳 +91</span>
              <input name="phone" placeholder="10-digit mobile number" value={form.phone} onChange={handle}
                style={{ flex: 1, border: "none", padding: "14px", fontSize: "15px", outline: "none" }} />
            </div>
            <button onClick={handleSendOTP} disabled={loading} style={btnStyle}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        )}

        {mode === "otp" && otpStep === "verify" && (
          <div>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px", textAlign: "center" }}>
              OTP sent to +91 {form.phone}
            </p>
            <input name="otp" placeholder="Enter 6-digit OTP" value={form.otp} onChange={handle}
              maxLength={6} style={{ ...inputStyle, textAlign: "center", fontSize: "22px", letterSpacing: "8px", fontWeight: "700" }} />
            <button onClick={handleVerifyOTP} disabled={loading} style={btnStyle}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button onClick={() => { setOtpStep("phone"); setError(""); setSuccess(""); }}
              style={{ width: "100%", padding: "12px", background: "none", border: "none", color: "#0d9488", cursor: "pointer", fontSize: "14px", marginTop: "8px" }}>
              ← Change number
            </button>
          </div>
        )}

        {/* Google Auth */}
        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <div style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "12px" }}>— or continue with —</div>
          <button onClick={() => window.location.href = `${API}/auth/google`}
            style={{ width: "100%", padding: "12px", border: "1.5px solid #e2e8f0", borderRadius: "12px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "15px", fontWeight: "600", color: "#334155" }}>
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "14px", border: "1.5px solid #e2e8f0", borderRadius: "12px",
  marginBottom: "14px", fontSize: "15px", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s"
};

const btnStyle = {
  width: "100%", padding: "14px", background: "#0d9488", color: "#fff",
  border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700",
  cursor: "pointer", transition: "background 0.2s"
};
