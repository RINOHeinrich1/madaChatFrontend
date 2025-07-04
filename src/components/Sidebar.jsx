import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, Cpu, BookOpen, LogOut, Menu, List } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false); // affichage mobile
  const [expanded, setExpanded] = useState(false); // état "hover" desktop

  const isActive = (path) =>
    pathname === path
      ? "bg-indigo-700 text-white font-semibold"
      : "text-indigo-300 hover:bg-indigo-600 hover:text-white";

  const menuItems = [
    { label: "Chatbots", icon: List, to: "/chatbots" },
    // { label: "Chat", icon: MessageSquare, to: "/chat" },
    { label: "Fine-Tune", icon: Cpu, to: "/finetune" },
    { label: "Documents", icon: BookOpen, to: "/docs" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <>
      {/* Bouton flottant mobile (visible uniquement en dessous de md) */}
      <button
        onClick={() => setVisible((prev) => !prev)}
        className="md:hidden fixed bottom-6 left-6 z-50 bg-indigo-700 text-white p-3 rounded-full shadow-lg hover:bg-indigo-800 transition"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar : masqué sur mobile sauf si visible === true */}
      <nav
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`
          ${visible ? "flex" : "hidden"} md:flex
          fixed left-4 top-1/2 -translate-y-1/2
          flex-col justify-between
          bg-indigo-800 text-indigo-300
          rounded-xl shadow-lg
          transition-[width] duration-300 ease-in-out
          overflow-hidden
          ${expanded || visible ? "w-56" : "w-16"}
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
              onClick={() => setVisible(false)} // ferme après clic mobile
              className={`flex items-center gap-4 px-4 py-3 cursor-pointer select-none transition-colors rounded-lg mx-2 my-1 ${isActive(
                to
              )}`}
            >
              <Icon className="w-6 h-6" aria-hidden="true" />
              {(expanded || visible) && (
                <span className="whitespace-nowrap">{label}</span>
              )}
            </Link>
          ))}
        </div>

        <button
          onClick={() => {
            handleLogout();
            setVisible(false);
          }}
          className={`flex items-center py-3 mb-4 mx-2 rounded-lg text-indigo-300 hover:bg-indigo-600 hover:text-white transition select-none cursor-pointer ${
            expanded || visible ? "gap-4 px-6 justify-start" : "px-2 justify-center"
          }`}
          aria-label="Se déconnecter"
        >
          <LogOut className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
          {(expanded || visible) && <span>Se déconnecter</span>}
        </button>
      </nav>
    </>
  );
}
