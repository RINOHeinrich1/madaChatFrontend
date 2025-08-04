import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ChatUI from "./ChatUI";
import { ClipLoader } from "react-spinners";

export const SpinnerLoaderComponent = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <ClipLoader color="#6366F1" size={60} />
    </div>
  );
};

export default function ChatWidget() {
  const { chatbot_id } = useParams();
  const [searchParams] = useSearchParams();
  const [isAllowed, setIsAllowed] = useState(null);
  const [error, setError] = useState("");

  const themeFromURL = searchParams.get("theme") || "light";
useEffect(() => {
  const checkAccess = async () => {
    try {
      const { data, error } = await supabase
        .from("chatbots")
        .select("allowed_url")
        .eq("id", chatbot_id)
        .limit(1); // on ne met pas .single()

      if (error) throw error;



      const allowedRaw = data[0]?.allowed_url || "";
      const allowed = allowedRaw
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);

      const currentOrigin = window.location.origin;

      const isAllowedDomain =
        allowed.length === 0 || allowed.includes(currentOrigin);

      setIsAllowed(isAllowedDomain);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur d'autorisation");
      setIsAllowed(false);
    }
  };

  checkAccess();
}, [chatbot_id]);

  if (isAllowed === null) {
    return <SpinnerLoaderComponent />;
  }

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 font-semibold text-lg text-center px-4">
        Accès refusé : cette URL n’est pas autorisée pour ce chatbot.
        {error && <p className="text-sm mt-2 text-gray-500">{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100%", overflow: "hidden" }}>
      <ChatUI chatbot_id={chatbot_id} theme={themeFromURL} />
    </div>
  );
}
