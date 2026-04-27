import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, UtensilsCrossed, History, Mail, PartyPopper, Sparkles, Users, Coffee, IceCreamCone } from "lucide-react";
import { supabase } from "../lib/supabase";
import { restaurantConfig } from "../restaurant.config";

export default function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email || "");
    });
  }, []);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate("/login");
  };

  const tabs = [
    { to: "/dashboard",          label: "Live Orders",   icon: LayoutDashboard, end: true },
    { to: "/dashboard/combo",    label: "Plats",         icon: Sparkles },
    { to: "/dashboard/family",   label: "Repas Familiaux", icon: Users },
    { to: "/dashboard/drinks",   label: "Boissons",      icon: Coffee },
    { to: "/dashboard/desserts", label: "Desserts",      icon: IceCreamCone },
    { to: "/dashboard/menu",     label: "Menu Items",    icon: UtensilsCrossed },
    { to: "/dashboard/catering", label: "Catering",      icon: PartyPopper },
    { to: "/dashboard/messages", label: "Messages",      icon: Mail },
    { to: "/dashboard/history",  label: "History",       icon: History },
  ];

  return (
    <main className="min-h-screen bg-brand-cream flex flex-col">
      {/* Top bar */}
      <header className="bg-brand-black text-white border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-heading text-lg font-bold">Chala</span>
            <span className="text-brand-gold font-heading text-[10px] tracking-[0.18em] uppercase hidden sm:inline">Owner Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-body text-white/60" data-testid="dashboard-email">{email}</span>
            <button
              onClick={handleLogout}
              data-testid="dashboard-logout-btn"
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-body text-sm px-3 py-1.5 rounded-md transition-colors"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
        {/* Tabs */}
        <nav className="border-t border-white/10 bg-brand-black">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 flex gap-1">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                data-testid={`tab-${t.to.split("/").pop() || "orders"}`}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-4 py-3 font-body text-sm font-medium border-b-2 transition-colors ${
                    isActive ? "border-brand-orange text-white" : "border-transparent text-white/60 hover:text-white"
                  }`
                }
              >
                <t.icon size={14} /> {t.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-6 py-6">
        <Outlet />
      </div>

      <footer className="text-center text-xs font-body text-brand-text py-6">
        {restaurantConfig.name} • Owner Console
      </footer>
    </main>
  );
}
