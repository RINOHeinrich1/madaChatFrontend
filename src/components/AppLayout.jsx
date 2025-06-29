// AppLayout.js
import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "./Sidebar";
import ChatWidget from "./ChatWidget";
import { Loader2 } from "lucide-react";
import FineTunePage from "./FineTunePage";
import DocumentManager from "./DocumentManagement";
import EmbedGenerator from "./ChatBotGenerator";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-indigo-600 dark:text-indigo-400 bg-gray-100 dark:bg-gray-900 transition-colors">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="text-lg font-medium">Chargement en cours...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

export default function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const hideSidebar = location.pathname === "/chat-widget" || location.pathname === "/login";

  return (
    <>
      {!hideSidebar && user && <Sidebar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat-widget" element={<ChatWidget />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Routes protégées */}
        <Route path="/" element={<PrivateRoute><EmbedGenerator /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><EmbedGenerator /></PrivateRoute>} />
        <Route path="/finetune" element={<PrivateRoute><FineTunePage /></PrivateRoute>} />
        <Route path="/docs" element={<PrivateRoute><DocumentManager /></PrivateRoute>} />
      </Routes>
    </>
  );
}
