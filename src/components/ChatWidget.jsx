import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ChatUI from "./ChatUI";
import { ScatterBoxLoader } from "react-awesome-loaders";

export const ScatterBoxLoaderComponent = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <ScatterBoxLoader
        primaryColor={"#6366F1"}
        background={"#ffffff"} // Remplace par theme.colors["background"] si tu utilises un thème
      />
    </div>
  );
};

export default function ChatWidget() {
  const { chatbot_id } = useParams();
  const [isAllowed, setIsAllowed] = useState(null); // null: loading, true: ok, false: interdit
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data, error } = await supabase
          .from("chatbots")
          .select("allowed_url")
          .eq("id", chatbot_id)
          .limit(1)
          .single(); // pour ne pas avoir à faire data[0]

        if (error) throw error;
        if (!data) throw new Error("Chatbot introuvable");

        const allowed = data.allowed_url
          ?.split(",")
          .map((u) => u.trim())
          .filter(Boolean);

        const currentOrigin = window.location.origin;

        if (!allowed || allowed.length === 0 || allowed.includes(currentOrigin)) {
          console.log("allowed");
          setIsAllowed(true);
        } else {
          console.log("not allowed:", allowed);
          console.log(currentOrigin);
          setIsAllowed(false);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Erreur d'autorisation");
        setIsAllowed(false);
      }
    };

    checkAccess();
  }, [chatbot_id]);

  if (isAllowed === null) {
    return <ScatterBoxLoaderComponent />;
  }

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 font-semibold text-lg">
        Accès refusé : cette URL n’est pas autorisée pour ce chatbot.
        {error && <p className="text-sm mt-2 text-gray-500">{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100%", overflow: "hidden" }}>
      <ChatUI chatbot_id={chatbot_id} />
    </div>
  );
}
