export interface MapUser {
    id: string;
    firstName: string;
    profilePicture: string;
    latitude: number;
    longitude: number;
}

export interface MapCluster {
    latitude: number;
    longitude: number;
    count: number;
}

export interface UsersMapResponse {
    users: Array<MapUser>;
    clusters: Array<MapCluster>;
}