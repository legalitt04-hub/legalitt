import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Scale } from "lucide-react";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveToken = (token, user) => {
    localStorage.setItem("legalitt_token", token);
    localStorage.setItem("legalitt_user", JSON.stringify(user));
    toast.success(`Welcome${user.name ? ", " + user.name : ""}! 🎉`);
    navigate("/");
  };

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!data.success) return setError(data.message);
      saveToken(data.token, data.user);
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!data.success) return setError(data.message);
      saveToken(data.token, data.user);
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  const handleGoogle = async (credentialResponse) => {
    try {
      const res = await fetch(`${API}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      if (!data.success) return toast.error(data.message);
      saveToken(data.token, data.user);
    } catch { toast.error("Google sign-in failed"); }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-5">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Scale size={32} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Legalitt</h1>
        <p className="text-gray-500 text-sm">Your trusted legal partner</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-card p-6">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          {["login", "register"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                mode === m ? "bg-primary-500 text-white shadow" : "text-gray-500"
              }`}>
              {m === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Register fields */}
        {mode === "register" && (
          <input name="name" placeholder="Full Name" value={form.name} onChange={handle}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-3 text-sm focus:outline-none focus:border-primary-400" />
        )}

        <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handle}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-3 text-sm focus:outline-none focus:border-primary-400" />

        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-5 text-sm focus:outline-none focus:border-primary-400" />

        <button
          onClick={mode === "login" ? handleLogin : handleRegister}
          disabled={loading}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-primary-200">
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or continue with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => toast.error("Google sign-in failed")}
            useOneTap={false}
            shape="pill"
            size="large"
            text={mode === "login" ? "signin_with" : "signup_with"}
          />
        </div>

        {/* Skip */}
        <button onClick={() => navigate("/")}
          className="w-full text-center text-gray-400 text-sm mt-4 hover:text-gray-600 transition-colors">
          Skip for now →
        </button>
      </div>
    </div>
  );
}
