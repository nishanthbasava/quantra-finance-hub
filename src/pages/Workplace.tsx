import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useSelection } from "@/contexts/SelectionContext";
import ContextPanel from "@/components/workspace/ContextPanel";
import ChatMessageBubble from "@/components/workspace/ChatMessageBubble";
import ChatInput from "@/components/workspace/ChatInput";
import { generateDemoResponse, type ChatMessage } from "@/components/workspace/demoResponses";

const Workplace = () => {
  const { selectedNodes, selectedTransactions, totalSelected } = useSelection();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = useCallback(
    (text: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // Simulate response delay
      setTimeout(() => {
        const response = generateDemoResponse(text, selectedNodes, selectedTransactions);
        setMessages((prev) => [...prev, response]);
        setIsTyping(false);
      }, 800 + Math.random() * 600);
    },
    [selectedNodes, selectedTransactions]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <section className="shrink-0 pt-8 pb-4 px-6 max-w-4xl mx-auto w-full animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-1">
          Workspace
        </h1>
        <p className="text-muted-foreground text-sm">
          Analyze what you've selected.
        </p>
      </section>

      {/* Context panel */}
      <section className="shrink-0 max-w-4xl mx-auto w-full px-6 pb-4 animate-fade-in" style={{ animationDelay: "0.05s" }}>
        <ContextPanel />
      </section>

      {/* Chat area – fills remaining space */}
      <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full px-6">
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-thin"
        >
          {messages.length === 0 && !isTyping && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2 animate-fade-in">
                <p className="text-muted-foreground text-sm">
                  {totalSelected > 0
                    ? "Ask a question about your selected items to get started."
                    : "Select items from the Dashboard or Transactions, then ask a question."}
                </p>
              </div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-card border border-border/60 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input bar – pinned to bottom */}
        <section className="shrink-0 pb-6 pt-2">
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </section>
      </div>
    </div>
  );
};

export default Workplace;
