// AppLayout.js
import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "./Sidebar";
import ChatWidget from "./ChatWidget";
import FineTunePage from "./FineTunePage";
import DocumentManager from "./DocumentManagement";
import EmbedGenerator from "./ChatBotGenerator";
import LoginPage from "./LoginPage";

function PrivateRoute({ children }) {
  const { user } = useAuth();
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

        {/* Routes protégées */}
        <Route path="/" element={<PrivateRoute><EmbedGenerator /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><EmbedGenerator /></PrivateRoute>} />
        <Route path="/finetune" element={<PrivateRoute><FineTunePage /></PrivateRoute>} />
        <Route path="/docs" element={<PrivateRoute><DocumentManager /></PrivateRoute>} />
      </Routes>
    </>
  );
}
