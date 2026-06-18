import { z } from "zod";

export const conversationEntrySchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(5000),
});

export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "A mensagem não pode ser vazia.")
    .max(2000, "A mensagem não pode ter mais de 2000 caracteres."),
  history: z
    .array(conversationEntrySchema)
    .max(50, "Histórico de conversa muito longo.")
    .default([]),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
