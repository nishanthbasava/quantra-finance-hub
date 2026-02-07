// ─── LLM Chat Hook ──────────────────────────────────────────────────────────
// Provides a unified interface for all chat inputs to call the Dedalus LLM.

import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LLMContext {
  page: "dashboard" | "transactions" | "workspace" | "simulation";
  selectedItems?: unknown[];
  filters?: Record<string, unknown>;
  mockData?: Record<string, unknown>;
}

export interface LLMAction {
  type: string;
  spec: Record<string, unknown>;
}

export interface LLMResponse {
  assistantMessage: string;
  actions: LLMAction[];
}

interface UseLLMChatOptions {
  context: LLMContext;
  onResponse?: (response: LLMResponse) => void;
  onStreamDelta?: (delta: string) => void;
  streaming?: boolean;
}

export function useLLMChat({ context, onResponse, onStreamDelta, streaming = false }: UseLLMChatOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<LLMMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string): Promise<LLMResponse | null> => {
    const userMsg: LLMMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      if (streaming && onStreamDelta) {
        // Streaming mode
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/llm-chat`;
        const controller = new AbortController();
        abortRef.current = controller;

        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            context,
            stream: true,
          }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          const errorData = await resp.json().catch(() => ({}));
          const errorMsg = (errorData as { error?: string }).error ?? "I couldn't reach the model—try again.";
          toast.error(errorMsg);
          setIsLoading(false);
          return null;
        }

        if (!resp.body) throw new Error("No response body");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                fullContent += content;
                onStreamDelta(content);
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        const assistantMsg: LLMMessage = { role: "assistant", content: fullContent };
        setMessages(prev => [...prev, assistantMsg]);
        setIsLoading(false);

        const result: LLMResponse = { assistantMessage: fullContent, actions: [] };
        onResponse?.(result);
        return result;
      } else {
        // Non-streaming mode
        const { data, error } = await supabase.functions.invoke("llm-chat", {
          body: {
            messages: [...messages, userMsg],
            context,
            stream: false,
          },
        });

        if (error) {
          console.error("LLM invoke error:", error);
          toast.error("I couldn't reach the model—try again.");
          setIsLoading(false);
          return null;
        }

        const response = data as LLMResponse;
        const assistantMsg: LLMMessage = { role: "assistant", content: response.assistantMessage };
        setMessages(prev => [...prev, assistantMsg]);
        setIsLoading(false);

        onResponse?.(response);
        return response;
      }
    } catch (err) {
      console.error("LLM error:", err);
      if (err instanceof DOMException && err.name === "AbortError") {
        // User cancelled
      } else {
        toast.error("I couldn't reach the model—try again.");
      }
      setIsLoading(false);
      return null;
    }
  }, [messages, context, streaming, onStreamDelta, onResponse]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    cancel,
    clearHistory,
    setMessages,
  };
}
