export type ConnectionStatus = 'none' | 'liked_by_them' | 'you_liked' | 'connected';

export type ProfileInteraction = {
  userId: string;
  viewedAt?: Date;
  likedByMe: boolean;
  likedByThem: boolean;
  blocked: boolean;
  reported: boolean;
  isOnline: boolean;
  lastSeenAt?: Date;
};

export type ProfileVisit = {
  visitorId: string;
  visitedUserId: string;
  visitedAt: Date;
};
