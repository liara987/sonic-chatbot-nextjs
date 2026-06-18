"use client";

import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import Image from "next/image";
import { useChat } from "@/hooks/useChat";

function ErrorState() {
  return (
    <div className="not-available" role="alert">
      <Image
        src="/sonic-no.gif"
        alt="Sonic fazendo sinal de não"
        unoptimized
        width={200}
        height={200}
      />
      <Image
        src="/sonic-indisponivel.png"
        alt="O Sonic está indisponível no momento"
        width={300}
        height={100}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <Image
      src="/sonic-running.gif"
      alt="Sonic correndo enquanto pensa"
      unoptimized
      width={50}
      height={50}
      className="sonic-running"
    />
  );
}

export default function ChatInterface() {
  const { messages, status, sendMessage } = useChat();

  const isTyping = status === "loading";
  const hasError = status === "error";

  return (
    <div className="chat" role="main">
      <Image
        src="/title.png"
        alt="Sonic ChatBot"
        width={320}
        height={80}
        priority
        className="title"
      />

      <MainContainer>
        <ChatContainer>
          <MessageList
            scrollBehavior="smooth"
            typingIndicator={
              isTyping ? (
                <TypingIndicator content="Sonic está procurando uma resposta..." />
              ) : null
            }
          >
            {hasError ? (
              <MessageList.Content>
                <ErrorState />
              </MessageList.Content>
            ) : isTyping ? (
              <MessageList.Content>
                <LoadingState />
              </MessageList.Content>
            ) : (
              messages.map((msg) => (
                <Message
                  key={msg.id}
                  model={{
                    message: msg.message,
                    sender: msg.sender,
                    direction: msg.direction,
                    position: msg.position,
                  }}
                />
              ))
            )}
          </MessageList>

          <MessageInput
            placeholder="Pergunte qualquer coisa para o Sonic"
            attachButton={false}
            onSend={sendMessage}
            disabled={isTyping}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}
