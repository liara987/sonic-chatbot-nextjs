"use client";

import { useCallback, useState } from "react";
import type {
  ChatMessage,
  ChatApiResponse,
  ChatApiError,
  ConversationEntry,
} from "@/types/chat";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "init-0",
  message: "Yo! Eu sou o Sonic, o ouriço mais rápido do mundo!\nPode me perguntar qualquer coisa.",
  sender: "sonic",
  direction: "incoming",
  position: "first",
};

export type ChatStatus = "idle" | "loading" | "error";

export interface UseChatReturn {
  messages: ChatMessage[];
  status: ChatStatus;
  sendMessage: (text: string) => Promise<void>;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [status, setStatus] = useState<ChatStatus>("idle");

  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      if (!text.trim()) return;

      const userMessage: ChatMessage = {
        id: generateId(),
        message: text,
        sender: "user",
        direction: "outgoing",
        position: "last",
      };

      setMessages((prev) => [...prev, userMessage]);
      setStatus("loading");

      // Build conversation history for the API (exclude the initial greeting)
      const history: ConversationEntry[] = messages
        .filter((m) => m.id !== "init-0")
        .map((m) => ({
          role: m.sender === "sonic" ? "assistant" : "user",
          content: m.message,
        }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history }),
        });

        const data: ChatApiResponse | ChatApiError = await res.json() as
          | ChatApiResponse
          | ChatApiError;

        if (!res.ok || "error" in data) {
          const msg =
            "error" in data ? data.error : "Erro ao conectar com o Sonic.";
          throw new Error(msg);
        }

        const sonicMessage: ChatMessage = {
          id: generateId(),
          message: data.reply,
          sender: "sonic",
          direction: "incoming",
          position: "first",
        };

        setMessages((prev) => [...prev, sonicMessage]);
        setStatus("idle");
      } catch (err: unknown) {
        console.error("[useChat] sendMessage error:", err);
        setStatus("error");
      }
    },
    [messages]
  );

  return { messages, status, sendMessage };
}
