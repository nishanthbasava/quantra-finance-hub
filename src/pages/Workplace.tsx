import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useSelection } from "@/contexts/SelectionContext";
import { useData } from "@/contexts/DataContext";
import ContextPanel from "@/components/workspace/ContextPanel";
import ChatMessageBubble from "@/components/workspace/ChatMessageBubble";
import ChatInput from "@/components/workspace/ChatInput";
import { type ChatMessage } from "@/components/workspace/demoResponses";
import { useLLMChat, type LLMResponse } from "@/hooks/useLLMChat";

const Workplace = () => {
  const { selectedNodes, selectedTransactions, totalSelected } = useSelection();
  const { timeRange, totalExpenses } = useData();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build context from selected items
  const selectedItems = useMemo(() => {
    const items: unknown[] = [];
    selectedNodes.forEach((node) => {
      items.push({ type: "sankey_node", id: node.id, label: node.label, amount: node.amount, category: node.categoryName, depth: node.depth });
    });
    selectedTransactions.forEach((tx) => {
      items.push({ type: "transaction", id: tx.id, merchant: tx.merchant, amount: tx.amount, category: tx.category });
    });
    return items;
  }, [selectedNodes, selectedTransactions]);

  const context = useMemo(() => ({
    page: "workspace" as const,
    selectedItems,
    mockData: { timeRange, totalExpenses, totalSelected },
  }), [selectedItems, timeRange, totalExpenses, totalSelected]);

  const handleResponse = useCallback((res: LLMResponse) => {
    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: res.assistantMessage,
    };
    setChatMessages(prev => [...prev, assistantMsg]);
  }, []);

  const llm = useLLMChat({
    context,
    onResponse: handleResponse,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chatMessages, llm.isLoading]);

  const handleSend = useCallback(
    (text: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      };
      setChatMessages(prev => [...prev, userMsg]);
      llm.sendMessage(text);
    },
    [llm]
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
          {chatMessages.length === 0 && !llm.isLoading && (
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
            {chatMessages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {llm.isLoading && (
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
          <ChatInput onSend={handleSend} disabled={llm.isLoading} />
        </section>
      </div>
    </div>
  );
};

export default Workplace;
