"use client";

import { useState } from "react";
import UserHeader from "./UserHeader";
import MatchCard from "./MatchCard";
import ConversationItem from "./ConversationItem";
import Typography from "@/components/common/Typography";
import Stack from "@/components/common/Stack";

type Tab = "matches" | "messages";

interface Match {
  id: string;
  name: string;
  pictureUrl: string | null;
}

interface Conversation {
  id: string;
  name: string;
  pictureUrl: string;
  lastMessage: string;
}

interface LeftDrawerProps {
  currentUser: {
    username: string;
    pictureUrl: string;
  };
  matches: Match[];
  conversations: Conversation[];
  onMatchClick?: (matchId: string) => void;
  onConversationClick?: (conversationId: string) => void;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  meLoading: boolean;
  meError: string | null;
  onRetryMe: () => void;
}

export default function LeftDrawer({
  currentUser,
  matches,
  conversations,
  onMatchClick,
  onConversationClick,
  activeTab: controlledActiveTab,
  onTabChange,
  meLoading,
  meError,
  onRetryMe,
}: LeftDrawerProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<Tab>("matches");

  // Use controlled tab if provided, otherwise use internal state
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = (tab: Tab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }

    // Automatically open the last conversation when switching to messages tab
    if (tab === "messages" && conversations.length > 0 && onConversationClick) {
      onConversationClick(conversations[0].id);
    }
  };

  return (
    <Stack
      direction="column"
      spacing="none"
      className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full"
    >
      {/* User Header */}
      <UserHeader
        username={currentUser.username}
        pictureUrl={currentUser.pictureUrl}
        isLoading={meLoading}
        error={meError}
      />
      {
      meError ? (
        <Stack
          direction="column"
          align="center"
          justify="center"
          className="p-4"
        >
          <Typography color="error">
            {meError}
          </Typography>
          <button
            onClick={onRetryMe}
            className="mt-2 px-4 py-2 bg-red-700 text-white rounded"
          >
            Réessayer
          </button>
        </Stack>
      ) : null}

      {/* Tabs */}
      <Stack
        direction="row"
        spacing="none"
        className="border-b border-gray-200 dark:border-gray-700"
      >
        <button
          onClick={() => handleTabChange("matches")}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === "matches"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Matchs
        </button>
        <button
          onClick={() => handleTabChange("messages")}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === "messages"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Messages
        </button>
      </Stack>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "matches" && (
          <Stack direction="column" spacing="sm" className="p-2">
            {matches.length === 0 ? (
              <Stack
                direction="column"
                align="center"
                justify="center"
                className="py-8"
              >
                <Typography color="secondary">
                  Aucun match pour le moment
                </Typography>
              </Stack>
            ) : (
              matches.map((match) => (
                <MatchCard
                  key={match.id}
                  id={match.id}
                  name={match.name}
                  pictureUrl={match.pictureUrl || "/default-profile.svg"}
                  onClick={() => onMatchClick?.(match.id)}
                />
              ))
            )}
          </Stack>
        )}

        {activeTab === "messages" && (
          <Stack direction="column" spacing="sm" className="p-2">
            {conversations.length === 0 ? (
              <Stack
                direction="column"
                align="center"
                justify="center"
                className="py-8"
              >
                <Typography color="secondary">
                  Aucune conversation pour le moment
                </Typography>
              </Stack>
            ) : (
              conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  id={conversation.id}
                  name={conversation.name}
                  pictureUrl={conversation.pictureUrl}
                  lastMessage={conversation.lastMessage}
                  onClick={() => onConversationClick?.(conversation.id)}
                />
              ))
            )}
          </Stack>
        )}
      </div>
    </Stack>
  );
}
