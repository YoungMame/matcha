"use client";

import { useState } from "react";
import UserHeader from "./UserHeader";
import MatchCard from "./MatchCard";
import ConversationItem from "./ConversationItem";
import Typography from "@/components/common/Typography";

type Tab = "matches" | "messages";

interface Match {
  id: string;
  name: string;
  pictureUrl: string;
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
}

export default function LeftDrawer({
  currentUser,
  matches,
  conversations,
  onMatchClick,
  onConversationClick,
  activeTab: controlledActiveTab,
  onTabChange,
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
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* User Header */}
      <UserHeader
        username={currentUser.username}
        pictureUrl={currentUser.pictureUrl}
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "matches" && (
          <div className="p-2">
            {matches.length === 0 ? (
              <div className="text-center py-8">
                <Typography color="secondary">
                  Aucun match pour le moment
                </Typography>
              </div>
            ) : (
              matches.map((match) => (
                <MatchCard
                  key={match.id}
                  id={match.id}
                  name={match.name}
                  pictureUrl={match.pictureUrl}
                  onClick={() => onMatchClick?.(match.id)}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="p-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <Typography color="secondary">
                  Aucune conversation pour le moment
                </Typography>
              </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
