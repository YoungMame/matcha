"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Stack from "@/components/common/Stack";
import LeftDrawer from "@/components/browsing/LeftDrawer";
import ChatInterface from "@/components/browsing/ChatInterface";
import ChatProfilePanel from "@/components/browsing/ChatProfilePanel";
import { mockMatches, mockConversations, mockMessages, generateMockProfilesWithMetadata } from "@/mocks/browsing_mocks";
import { BrowsingProvider, useBrowsing } from "@/contexts/BrowsingContext";
import { Message } from "@/types/message";

type Tab = "matches" | "messages";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { openMatchModal, openConversation, closeConversation, selectedConversationId } = useBrowsing();
  const [activeTab, setActiveTab] = useState<Tab>("matches");
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(mockMessages);

  // Generate all profiles for chat user lookup
  const allProfiles = useMemo(() => generateMockProfilesWithMetadata(undefined, 200), []);

  const handleConversationClick = useCallback((conversationId: string) => {
    openConversation(conversationId);
  }, [openConversation, pathname, router]);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    
    if (tab === "messages") {
      // Open first conversation when switching to messages
      if (mockConversations.length > 0) {
        openConversation(mockConversations[0].id);
      }
    } else {
      // Close conversation when switching to matches
      closeConversation();
    }
  }, [openConversation, closeConversation, pathname, router]);

  const handleMatchClick = useCallback((userId: string) => {
    openMatchModal(userId);
    // Don't navigate - let each page handle the modal display
  }, [openMatchModal]);

  const handleSendMessage = useCallback((content: string) => {
    if (!selectedConversationId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: "current-user",
      content,
      timestamp: new Date(),
    };

    setAllMessages((prev) => ({
      ...prev,
      [selectedConversationId]: [
        ...(prev[selectedConversationId] || []),
        newMessage,
      ],
    }));
  }, [selectedConversationId]);

  // Get the current conversation data
  const selectedConversation = selectedConversationId
    ? mockConversations.find((conv) => conv.id === selectedConversationId)
    : null;

  const selectedChatUser =
    selectedConversation && selectedConversation.userId
      ? allProfiles.find((u) => u.id === selectedConversation.userId)
      : null;

  const conversationMessages = selectedConversationId
    ? allMessages[selectedConversationId as keyof typeof allMessages] || []
    : [];

  return (
    <Stack direction="row" className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Left Drawer */}
      <LeftDrawer
        currentUser={{
          username: "User",
          pictureUrl: "/bob.jpg",
        }}
        matches={mockMatches}
        conversations={mockConversations}
        onMatchClick={handleMatchClick}
        onConversationClick={handleConversationClick}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content - Show ChatInterface when messages tab is active and conversation is selected */}
      {activeTab === "messages" && selectedConversationId && selectedChatUser ? (
        <Stack direction="row" className="flex-1 overflow-hidden">
          <ChatInterface
            conversationId={selectedConversationId}
            otherUser={{
              id: selectedChatUser.id,
              name: selectedChatUser.firstName,
              pictureUrl: selectedChatUser.profilePicture || "/bob.jpg",
            }}
            messages={conversationMessages}
            currentUserId="current-user"
            onSendMessage={handleSendMessage}
          />
          <ChatProfilePanel user={selectedChatUser} />
        </Stack>
      ) : (
        children
      )}
    </Stack>
  );
}

export default function LoggedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BrowsingProvider>
      <LayoutContent>{children}</LayoutContent>
    </BrowsingProvider>
  );
}
