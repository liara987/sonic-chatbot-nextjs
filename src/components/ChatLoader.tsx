"use client";

import dynamic from "next/dynamic";

// @chatscope uses browser APIs (window, document) — must be client-only
const ChatInterface = dynamic(() => import("./ChatInterface"), {
  ssr: false,
  loading: () => (
    <div className="loading-shell" aria-busy="true">
      <p style={{ color: "#ffd700" }}>Carregando Sonic...</p>
    </div>
  ),
});

export default function ChatLoader() {
  return <ChatInterface />;
}
