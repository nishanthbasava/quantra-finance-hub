import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface SelectedSankeyNode {
  id: string;
  label: string;
  depth: number;
  categoryName: string;
  amount: number;
}

export interface SelectedTransaction {
  id: string;
  merchant: string;
  amount: number;
  category: string;
}

interface SelectionContextType {
  selectMode: boolean;
  toggleSelectMode: () => void;
  selectedNodes: Map<string, SelectedSankeyNode>;
  selectedTransactions: Map<string, SelectedTransaction>;
  toggleNode: (node: SelectedSankeyNode) => void;
  toggleTransaction: (tx: SelectedTransaction) => void;
  clearAll: () => void;
  totalSelected: number;
}

const SelectionContext = createContext<SelectionContextType | null>(null);

export const useSelection = () => {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within SelectionProvider");
  return ctx;
};

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Map<string, SelectedSankeyNode>>(new Map());
  const [selectedTransactions, setSelectedTransactions] = useState<Map<string, SelectedTransaction>>(new Map());

  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => !prev);
  }, []);

  const toggleNode = useCallback((node: SelectedSankeyNode) => {
    setSelectedNodes((prev) => {
      const next = new Map(prev);
      if (next.has(node.id)) {
        next.delete(node.id);
      } else {
        next.set(node.id, node);
      }
      return next;
    });
  }, []);

  const toggleTransaction = useCallback((tx: SelectedTransaction) => {
    setSelectedTransactions((prev) => {
      const next = new Map(prev);
      if (next.has(tx.id)) {
        next.delete(tx.id);
      } else {
        next.set(tx.id, tx);
      }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelectedNodes(new Map());
    setSelectedTransactions(new Map());
  }, []);

  const totalSelected = selectedNodes.size + selectedTransactions.size;

  return (
    <SelectionContext.Provider
      value={{
        selectMode,
        toggleSelectMode,
        selectedNodes,
        selectedTransactions,
        toggleNode,
        toggleTransaction,
        clearAll,
        totalSelected,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};
