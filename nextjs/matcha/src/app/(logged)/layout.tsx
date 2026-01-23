"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Stack from "@/components/common/Stack";
import LeftDrawer from "@/components/browsing/LeftDrawer";
import ChatInterface from "@/components/browsing/ChatInterface";
import ChatProfilePanel from "@/components/browsing/ChatProfilePanel";
import MatchingModal from "@/components/browsing/MatchingModal";
import { BrowsingProvider, useBrowsing } from "@/contexts/BrowsingContext";
import { MeProvider, useMe } from "@/contexts/MeContext";
import { Message } from "@/types/message";
import { matchesApi } from "@/lib/api";
import { MatchUser } from "@/types/api/matches";
import { useUserProfile } from "@/hooks/useUserProfile";

type Tab = "matches" | "messages";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { openMatchModal, openConversation, closeConversation, selectedConversationId, selectedMatchUserId, closeMatchModal } = useBrowsing();

  // useMe here — MeProvider is above LayoutContent in the tree
  const { id, username, profilePictureUrls, profilePictureIndex, isLoading: meLoading, error: meError, refresh } = useMe();
  const [activeTab, setActiveTab] = useState<Tab>("matches");
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});
  const [matchesList, setMatchesList] = useState<MatchUser[]>([]);

  // Fetch full profile for selected match
  const { data: matchProfile } = useUserProfile(selectedMatchUserId || "");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const result = await matchesApi.getMatches(0, 20);
        setMatchesList(result.matches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    fetchMatches();
  }, []);

  const drawerMatches = useMemo(() => matchesList.map(m => ({
    id: String(m.id),
    name: m.firstName,
    pictureUrl: m.profilePicture
  })), [matchesList]);

  const drawerConversations = useMemo(() => matchesList.map(m => ({
    id: String(m.id), // Use UserID as ConversationID for now to ensure consistency
    userId: String(m.id),
    name: m.firstName,
    pictureUrl: m.profilePicture || "/default-profile.svg",
    lastMessage: "Start chatting"
  })), [matchesList]);

  const handleConversationClick = useCallback((conversationId: string) => {
    openConversation(conversationId);
  }, [openConversation, pathname, router]);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    if (tab === "messages") {
      if (drawerConversations.length > 0) openConversation(drawerConversations[0].id);
    } else {
      closeConversation();
    }
  }, [openConversation, closeConversation, pathname, router, drawerConversations]);

  const handleMatchClick = useCallback((userId: string) => {
    openMatchModal(userId);
  }, [openMatchModal]);

  const handleStartChat = useCallback((userId: string) => {
    setActiveTab("messages");
    openConversation(userId);
    closeMatchModal();
  }, [openConversation, closeMatchModal]);

  const handleSendMessage = useCallback((content: string) => {
    if (!selectedConversationId) return;
    const newMessage: Message = { id: `msg-${Date.now()}`, senderId: "current-user", content, timestamp: new Date() };
    setAllMessages((prev) => ({ ...prev, [selectedConversationId]: [ ...(prev[selectedConversationId] || []), newMessage ] }));
  }, [selectedConversationId]);

  // Modal User Mapping
  const modalUser = useMemo(() => {
    if (!matchProfile) return null;
    return {
      id: String(matchProfile.id),
      firstName: matchProfile.username, // Fallback as firstName is not in UserProfileResponse
      lastName: "",
      birthday: matchProfile.bornAt,
      biography: matchProfile.bio,
      interests: matchProfile.tags,
      gender: matchProfile.gender,
      interestedInGenders: [], // TODO: Derive from orientation
      profilePicture: matchProfile.profilePictures[matchProfile.profilePictureIndex] || null,
      additionalPictures: matchProfile.profilePictures.filter((_, i) => i !== matchProfile.profilePictureIndex),
    };
  }, [matchProfile]);

  const selectedConversation = selectedConversationId ? drawerConversations.find((conv) => conv.id === selectedConversationId) : null;
  // Find selected user from matchesList
  const selectedMatchUser = selectedConversation && selectedConversation.userId 
    ? matchesList.find((u) => String(u.id) === selectedConversation.userId) 
    : null;

  // Map to UserProfile for ChatProfilePanel
  const selectedChatUser = selectedMatchUser ? {
    id: String(selectedMatchUser.id),
    firstName: selectedMatchUser.firstName,
    lastName: "", // Not available in MatchUser
    birthday: `${new Date().getFullYear() - selectedMatchUser.age}-01-01`, // Approximate
    biography: "No biography available",
    interests: [`${selectedMatchUser.commonInterests} common interests`],
    gender: "unknown",
    interestedInGenders: [],
    profilePicture: selectedMatchUser.profilePicture,
    additionalPictures: []
  } : null;

  const conversationMessages = selectedConversationId ? allMessages[selectedConversationId as keyof typeof allMessages] || [] : [];

  return (
    <Stack direction="row" className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Global Matching Modal */}
      <MatchingModal
        isOpen={!!selectedMatchUserId}
        onClose={closeMatchModal}
        user={modalUser}
        isFromMatch={true}
        onLike={() => {}} // Already matched
        onPass={() => {}} // Cannot pass a match
        onChat={handleStartChat}
      />

      {/* LeftDrawer receives loading/error state and can render skeleton or error locally */}
      <LeftDrawer
        currentUser={{
          username,
          pictureUrl: profilePictureUrls[profilePictureIndex ?? 0] || "/default-profile.svg",
        }}
        matches={drawerMatches}
        conversations={drawerConversations}
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
