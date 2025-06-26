import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, Cpu, BookOpen, LogOut } from "lucide-react";
import { supabase } from "../lib/supabaseClient"; // adapte selon ton import supabase

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // Pour gérer le style actif du lien
  const isActive = (path) =>
    pathname === path
      ? "bg-indigo-700 text-white font-semibold"
      : "text-indigo-300 hover:bg-indigo-600 hover:text-white";

  // Les items avec icône + label + route
  const menuItems = [
    { label: "Chat", icon: MessageSquare, to: "/chat" },
    { label: "Fine-Tune", icon: Cpu, to: "/finetune" },
    { label: "Documents", icon: BookOpen, to: "/docs" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login"); // redirige vers la page login après déconnexion
  };

  return (
    <nav
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`
      fixed left-4
      top-1/2
      -translate-y-1/2
      flex flex-col justify-between
      bg-indigo-800 text-indigo-300
      rounded-xl
      shadow-lg
      transition-[width] duration-300 ease-in-out
      overflow-hidden
      ${expanded ? "w-56" : "w-16"}   {/* largeur augmentée en étendu */}
      h-[calc(60vh+4rem)]  
      z-50
    `}
      aria-label="Sidebar de navigation"
    >
      <div>
        {menuItems.map(({ label, icon: Icon, to }) => (
          <Link
            to={to}
            key={to}
            className={`flex items-center gap-4 px-4 py-3 cursor-pointer select-none transition-colors rounded-lg mx-2 my-1 ${isActive(
              to
            )}`}
          >
            <Icon className="w-6 h-6" aria-hidden="true" />
            {expanded && <span className="whitespace-nowrap">{label}</span>}
          </Link>
        ))}
      </div>

      {/* Bouton déconnexion tout en bas avec padding horizontal augmenté */}
      <button
        onClick={handleLogout}
        className={`flex items-center py-3 mb-4 mx-2 rounded-lg text-indigo-300 hover:bg-indigo-600 hover:text-white transition select-none cursor-pointer
    ${expanded ? "gap-4 px-6 justify-start" : "px-2 justify-center"}`}
        aria-label="Se déconnecter"
      >
        <LogOut className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
        {expanded && <span className="whitespace-nowrap">Se déconnecter</span>}
      </button>
    </nav>
  );
}
