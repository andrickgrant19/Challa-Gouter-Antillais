import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { isOwnerAllowed } from "../lib/ownerAuth";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) { navigate("/login"); return; }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session && isOwnerAllowed(session.user?.email)) {
        setAuthed(true);
      } else {
        if (session) await supabase.auth.signOut();
        navigate("/login");
      }
      setChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session || !isOwnerAllowed(session.user?.email)) navigate("/login");
    });
    return () => subscription?.unsubscribe();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="text-brand-text font-body">Checking access...</div>
      </div>
    );
  }
  return authed ? children : null;
}
