import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import UsersMapApi from '@lib/api/usersMapApi';
import { UsersMapResponse, MapUser, MapCluster } from '@/types/api/usersMap';

const queryClient = new QueryClient();

const LEVEL1_ZOOM = 12;
const LEVEL2_ZOOM = 30;
const SIGNIFICANT_MOVE_DISTANCE = 0.1;
const SIGNIFICANT_ZOOM_CHANGE = 2;

function UserMapQueryClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
  );
}

export default function UsersMap({ currentPos }: { currentPos: { lat?: number; lng?: number } }) {

    const [zoom, setZoom] = useState(42);
    const [level, setLevel] = useState(1);
    const [radius, setRadius] = useState(1000);
    const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: currentPos.lat || 0, lng: currentPos.lng || 0 });
    const [users, setUsers] = useState<Array<any>>([]);
    const [clusters, setClusters] = useState<Array<any>>([]);
    const [lastSignificantMove, setLastSignificantMove] = useState<{ lat: number; lng: number }>({ lat: center.lat, lng: center.lng });
    const [lastSignificantZoom, setLastSignificantZoom] = useState<number>(zoom);

    useEffect(() => {
        if (zoom >= LEVEL2_ZOOM) {
            setLevel(2);
        } else if (zoom >= LEVEL1_ZOOM) {
            setLevel(1);
        } else {
            setLevel(0);
        }
    }, [zoom]);

    useEffect(() => {
        const distance = Math.sqrt(
            Math.pow(center.lat - lastSignificantMove.lat, 2) +
            Math.pow(center.lng - lastSignificantMove.lng, 2)
        );

        if (distance >= SIGNIFICANT_MOVE_DISTANCE || Math.abs(zoom - lastSignificantZoom) >= SIGNIFICANT_ZOOM_CHANGE) {
            setLastSignificantMove({ lat: center.lat, lng: center.lng });
            setLastSignificantZoom(zoom);
        }

        queryClient.invalidateQueries(['map']);

    }, [center, lastSignificantMove]);


    const { isPending, error, data, isFetching } = useQuery({
    queryKey: ['map'],
    queryFn: async () => {
      const response = await UsersMapApi.getNearUsers(1, currentPos.lat || 0, currentPos.lng || 0, 1000);
      return response;
    },
  })

//   if (error) return 'An error has occurred: ' + error.message;

  return (
    <UserMapQueryClientProvider>
        <h1>Users Map</h1>
        <p>Current Position: {currentPos.lat}, {currentPos.lng}</p>
    </UserMapQueryClientProvider>
  );
}