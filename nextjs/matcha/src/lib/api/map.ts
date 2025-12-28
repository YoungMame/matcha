import axios from '../axios';
import type { UsersMapResponse } from '@types/api/map';

export const mapApi =  {
    getNearUsers: async (level: number, lat: number, lng: number, radius: number): Promise<UsersMapResponse> => {
        const response = await axios.get<UsersMapResponse>(`/api/private/map?level=${level}&lat=${lat}&lng=${lng}&radius=${radius}`);
        return response.data;
    }
}