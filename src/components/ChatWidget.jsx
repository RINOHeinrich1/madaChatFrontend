// src/components/ChatWidget.js
import ChatPage from "./ChatPage"; // ton composant principal

export default function ChatWidget() {
  return (
    <div style={{ height: "100vh", width: "100%", overflow: "hidden" }}>
      <ChatPage />
    </div>
  );
}
