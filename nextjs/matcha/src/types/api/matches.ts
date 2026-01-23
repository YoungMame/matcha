export interface MatchUser {
    id: number;
    firstName: string;
    profilePicture: string | null;
    age: number;
    commonInterests: number;
    distance: number;
    chatId: number | null;
}

export interface GetMatchesResponse {
    matches: MatchUser[];
}
