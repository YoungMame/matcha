import axios from '@/lib/axios';
import { GetMatchesResponse } from '@/types/api/matches';

export const matchesApi = {
    getMatches: async (offset: number = 0, limit: number = 20): Promise<GetMatchesResponse> => {
        const response = await axios.get<GetMatchesResponse>(`/api/private/match/${offset}/${limit}`);
        return response.data;
    }
};
