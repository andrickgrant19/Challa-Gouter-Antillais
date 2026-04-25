import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../context/LanguageContext";
import { restaurantConfig } from "../restaurant.config";

export default function Login() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const T = {
    title:    lang === "fr" ? "Connexion Propriétaire" : "Owner Login",
    subtitle: lang === "fr" ? "Accès au tableau de bord des commandes" : "Access the orders dashboard",
    email:    lang === "fr" ? "Adresse e-mail" : "Email",
    password: lang === "fr" ? "Mot de passe" : "Password",
    submit:   lang === "fr" ? "Se connecter" : "Sign In",
    notReady: lang === "fr" ? "Supabase n'est pas configuré." : "Supabase is not configured.",
    invalid:  lang === "fr" ? "Email ou mot de passe invalide." : "Invalid email or password.",
  };

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!supabase) { setError(T.notReady); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || T.invalid);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-black flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-gold/15 text-brand-gold border border-brand-gold/30 rounded-full px-4 py-1.5 text-xs font-body font-semibold tracking-widest uppercase mb-4">
            <ShieldCheck size={14} /> {restaurantConfig.name}
          </div>
          <h1 data-testid="login-title" className="font-heading text-4xl font-bold text-white">{T.title}</h1>
          <p className="font-body text-white/60 text-sm mt-2">{T.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-2xl space-y-4" data-testid="login-form">
          <div>
            <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{T.email}</label>
            <input
              required type="email" autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              data-testid="login-email-input"
              className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
            />
          </div>
          <div>
            <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{T.password}</label>
            <input
              required type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              data-testid="login-password-input"
              className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
            />
          </div>
          {error && (
            <div data-testid="login-error" className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm font-body">{error}</div>
          )}
          <button
            type="submit"
            disabled={submitting}
            data-testid="login-submit-btn"
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-body font-semibold py-3.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 className="animate-spin" size={16} />}
            {T.submit}
          </button>
        </form>
      </div>
    </main>
  );
}
