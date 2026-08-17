"use client";
import AuthGate from "@/components/AuthGate";
import ChatPage from "@/components/ChatPage";

export default function Home() {
  return (
    <AuthGate>
      <ChatPage isDev={true} />
    </AuthGate>
  );
}
