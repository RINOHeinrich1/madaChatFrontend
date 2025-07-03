// src/components/ChatWidget.js
import ChatUI from "./ChatUI";
import { useParams } from "react-router-dom";

export default function ChatWidget() {
  const { chatbot_id } = useParams();

  return (
    <div style={{ height: "100vh", width: "100%", overflow: "hidden" }}>
      <ChatUI chatbot_id={chatbot_id} />
    </div>
  );
}
