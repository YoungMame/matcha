import axios from '../axios';
import type { UsersMapResponse } from '@/types/api/usersMap';

export const mapApi =  {
    getNearUsers: async (level: string, lat: string, lng: string, radius: string): Promise<UsersMapResponse> => {
        const response = await axios.get<UsersMapResponse>(`/api/private/map?level=${level}&latitude=${lat}&longitude=${lng}&radius=${radius}`);
        return response.data;
    }
}