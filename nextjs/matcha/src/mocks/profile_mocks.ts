import { ProfileInteraction, ConnectionStatus } from "@/types/profileInteraction";

// Mock current user ID (should come from auth context in real app)
export const CURRENT_USER_ID = "current-user";

// Mock current user has profile picture (required to like others)
export const CURRENT_USER_HAS_PROFILE_PICTURE = true;

// Mock profile interactions data
export const mockProfileInteractions: Record<string, ProfileInteraction> = {
  "1": {
    userId: "1",
    likedByMe: true,
    likedByThem: true,
    blocked: false,
    reported: false,
    isOnline: true,
    viewedAt: new Date("2025-11-02T14:30:00"),
  },
  "2": {
    userId: "2",
    likedByMe: false,
    likedByThem: true,
    blocked: false,
    reported: false,
    isOnline: false,
    lastSeenAt: new Date("2025-11-02T08:15:00"),
  },
  "3": {
    userId: "3",
    likedByMe: true,
    likedByThem: false,
    blocked: false,
    reported: false,
    isOnline: false,
    lastSeenAt: new Date("2025-11-01T22:45:00"),
  },
  "4": {
    userId: "4",
    likedByMe: false,
    likedByThem: false,
    blocked: false,
    reported: false,
    isOnline: true,
  },
  "5": {
    userId: "5",
    likedByMe: false,
    likedByThem: false,
    blocked: false,
    reported: false,
    isOnline: false,
    lastSeenAt: new Date("2025-10-30T18:20:00"),
  },
};

// Helper to get connection status
export function getConnectionStatus(userId: string): ConnectionStatus {
  const interaction = mockProfileInteractions[userId];
  if (!interaction) return 'none';
  
  if (interaction.likedByMe && interaction.likedByThem) return 'connected';
  if (interaction.likedByThem) return 'liked_by_them';
  if (interaction.likedByMe) return 'you_liked';
  return 'none';
}

// Mock API functions
export async function toggleLike(userId: string): Promise<ProfileInteraction> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const current = mockProfileInteractions[userId] || {
    userId,
    likedByMe: false,
    likedByThem: false,
    blocked: false,
    reported: false,
    isOnline: false,
  };
  
  current.likedByMe = !current.likedByMe;
  mockProfileInteractions[userId] = current;
  
  return current;
}

export async function blockUser(userId: string): Promise<ProfileInteraction> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const current = mockProfileInteractions[userId] || {
    userId,
    likedByMe: false,
    likedByThem: false,
    blocked: false,
    reported: false,
    isOnline: false,
  };
  
  current.blocked = true;
  // Blocking also removes likes
  current.likedByMe = false;
  mockProfileInteractions[userId] = current;
  
  return current;
}

export async function reportUser(userId: string): Promise<ProfileInteraction> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const current = mockProfileInteractions[userId] || {
    userId,
    likedByMe: false,
    likedByThem: false,
    blocked: false,
    reported: false,
    isOnline: false,
  };
  
  current.reported = true;
  mockProfileInteractions[userId] = current;
  
  return current;
}

export async function recordProfileVisit(userId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (!mockProfileInteractions[userId]) {
    mockProfileInteractions[userId] = {
      userId,
      likedByMe: false,
      likedByThem: false,
      blocked: false,
      reported: false,
      isOnline: false,
    };
  }
  
  mockProfileInteractions[userId].viewedAt = new Date();
}
