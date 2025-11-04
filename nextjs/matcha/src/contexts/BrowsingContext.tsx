"use client";

import { createContext, useContext, ReactNode, useState, useCallback } from "react";

interface BrowsingContextType {
  // Match modal state
  selectedMatchUserId: string | null;
  openMatchModal: (userId: string) => void;
  closeMatchModal: () => void;
  
  // Conversation state
  selectedConversationId: string | null;
  openConversation: (conversationId: string) => void;
  closeConversation: () => void;
}

const BrowsingContext = createContext<BrowsingContextType | undefined>(undefined);

export function BrowsingProvider({ children }: { children: ReactNode }) {
  const [selectedMatchUserId, setSelectedMatchUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const openMatchModal = useCallback((userId: string) => {
    setSelectedMatchUserId(userId);
  }, []);

  const closeMatchModal = useCallback(() => {
    setSelectedMatchUserId(null);
  }, []);

  const openConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
  }, []);

  const closeConversation = useCallback(() => {
    setSelectedConversationId(null);
  }, []);

  return (
    <BrowsingContext.Provider 
      value={{ 
        selectedMatchUserId,
        openMatchModal,
        closeMatchModal,
        selectedConversationId,
        openConversation,
        closeConversation,
      }}
    >
      {children}
    </BrowsingContext.Provider>
  );
}

export function useBrowsing() {
  const context = useContext(BrowsingContext);
  if (context === undefined) {
    throw new Error("useBrowsing must be used within a BrowsingProvider");
  }
  return context;
}
