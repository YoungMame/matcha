"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Stack from "@/components/common/Stack";
import LeftDrawer from "@/components/browsing/LeftDrawer";
import ChatInterface from "@/components/browsing/ChatInterface";
import ChatProfilePanel from "@/components/browsing/ChatProfilePanel";
import { mockMatches, mockConversations, mockMessages, generateMockProfilesWithMetadata } from "@/mocks/browsing_mocks";
import { BrowsingProvider, useBrowsing } from "@/contexts/BrowsingContext";
import { MeProvider, useMe } from "@/contexts/MeContext";
import { Message } from "@/types/message";

type Tab = "matches" | "messages";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { openMatchModal, openConversation, closeConversation, selectedConversationId } = useBrowsing();

  // useMe here — MeProvider is above LayoutContent in the tree
  const { id, username, profilePictureUrls, profilePictureIndex, isLoading: meLoading, error: meError, refresh } = useMe();
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
      if (mockConversations.length > 0) openConversation(mockConversations[0].id);
    } else {
      closeConversation();
    }
  }, [openConversation, closeConversation, pathname, router]);

  const handleMatchClick = useCallback((userId: string) => {
    openMatchModal(userId);
  }, [openMatchModal]);

  const handleSendMessage = useCallback((content: string) => {
    if (!selectedConversationId) return;
    const newMessage: Message = { id: `msg-${Date.now()}`, senderId: "current-user", content, timestamp: new Date() };
    setAllMessages((prev) => ({ ...prev, [selectedConversationId]: [ ...(prev[selectedConversationId] || []), newMessage ] }));
  }, [selectedConversationId]);

  const selectedConversation = selectedConversationId ? mockConversations.find((conv) => conv.id === selectedConversationId) : null;
  const selectedChatUser = selectedConversation && selectedConversation.userId ? allProfiles.find((u) => u.id === selectedConversation.userId) : null;
  const conversationMessages = selectedConversationId ? allMessages[selectedConversationId as keyof typeof allMessages] || [] : [];

  return (
    <Stack direction="row" className="h-full bg-gray-50 dark:bg-gray-900">
      {/* LeftDrawer receives loading/error state and can render skeleton or error locally */}
      <LeftDrawer
        currentUser={{
          username,
          pictureUrl: profilePictureUrls[profilePictureIndex ?? 0] || "/default-profile.svg",
        }}
        matches={mockMatches}
        conversations={mockConversations}
        onMatchClick={handleMatchClick}
        onConversationClick={handleConversationClick}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        meLoading={meLoading}
        meError={meError}
        onRetryMe={refresh}
      />

      {/* Main Content - don't block whole layout; child components handle meLoading/meError as needed */}
      {activeTab === "messages" && selectedConversationId && selectedChatUser ? (
        <Stack direction="row" className="flex-1 overflow-hidden">
          <ChatInterface
            conversationId={selectedConversationId}
            otherUser={{
              id: selectedChatUser.id,
              name: selectedChatUser.firstName,
              pictureUrl: selectedChatUser.profilePicture || "/default-profile.svg",
            }}
            messages={conversationMessages}
            currentUserId={String(id ?? "")}
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

export default function LoggedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // MeProvider wraps the whole area that may need user data, but we don't block rendering
  return (
    <MeProvider>
      <BrowsingProvider>
        <LayoutContent>{children}</LayoutContent>
      </BrowsingProvider>
    </MeProvider>
  );
}
