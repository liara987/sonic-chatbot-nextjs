// ────────────────────────────────────────────────────────────
//  Shared chat types (safe to import in client AND server)
// ────────────────────────────────────────────────────────────

/** A single rendered chat bubble */
export interface ChatMessage {
  id: string;
  message: string;
  sender: "sonic" | "user";
  direction: "incoming" | "outgoing";
  position: "single" | "first" | "normal" | "last";
}

/** Minimal representation sent to the API route */
export interface ConversationEntry {
  role: "user" | "assistant";
  content: string;
}

/** Body the client POSTs to /api/chat */
export interface ChatRequestBody {
  message: string;
  history: ConversationEntry[];
}

/** Successful response from /api/chat */
export interface ChatApiResponse {
  reply: string;
}

/** Error shape returned by /api/chat */
export interface ChatApiError {
  error: string;
}
