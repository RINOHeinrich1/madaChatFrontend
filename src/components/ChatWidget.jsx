// src/components/ChatWidget.js
import ChatPage from "./ChatPage";
import { useParams } from "react-router-dom";

export default function ChatWidget() {
  const { chatbot_id } = useParams();

  return (
    <div style={{ height: "100vh", width: "100%", overflow: "hidden" }}>
      <ChatPage chatbot_id={chatbot_id} />
    </div>
  );
}
