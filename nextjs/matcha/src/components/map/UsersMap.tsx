"use client";

import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { mapApi } from '@/lib/api/map';
import { UsersMapResponse, MapUser, MapCluster } from '@/types/api/usersMap';
import maplibregl from 'maplibre-gl';
import Map, { MapRef, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const LEVEL1_ZOOM = 5;
const LEVEL2_ZOOM = 3;
const SIGNIFICANT_MOVE_DISTANCE = 0.2; // Move fraction change
const SIGNIFICANT_ZOOM_CHANGE = 0.5; // From Zoom fraction change

export default function UsersMap({ currentPos }: { currentPos: { lat?: number; lng?: number } }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [zoom, setZoom] = useState(13);
    const [level, setLevel] = useState(0);
    const [radius, setRadius] = useState(0);
    const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: currentPos.lat || 0, lng: currentPos.lng || 0 });
    const [users, setUsers] = useState<Array<MapUser>>([]);
    const [clusters, setClusters] = useState<Array<MapCluster>>([]);
    const [lastSignificantMove, setLastSignificantMove] = useState<{ lat: number; lng: number }>({ lat: center.lat, lng: center.lng });
    const [lastSignificantZoom, setLastSignificantZoom] = useState<number>(zoom);
    const [firstFetchDone, setFirstFetchDone] = useState<boolean>(false);

    const map = useRef<MapRef>(null);

    function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function getScreenWidthInKM() {
        const bounds = map.current?.getBounds();
        if (!bounds) return 0;
        const northWest = bounds.getNorthWest();
        const northEast = bounds.getNorthEast();
        return haversineDistance(northWest.lat, northWest.lng, northEast.lat, northEast.lng);
    }

    const onMoveEnd = (evt: { viewState: { latitude: number; longitude: number } }) => {
        const center = evt.viewState;
        setCenter({ lat: center.latitude, lng: center.longitude });
    };

    const onZoomEnd = (evt: { viewState: { zoom: number } }) => {
        const zoom = evt.viewState.zoom;
        setZoom(zoom);
        setLevel(zoom < LEVEL1_ZOOM ? zoom < LEVEL2_ZOOM ? 2 : 1 : 0 );
    };

    useEffect(() => {
        const distance = haversineDistance(
            center.lat,
            center.lng,
            lastSignificantMove.lat,
            lastSignificantMove.lng
        );
        const radius = getScreenWidthInKM() / 2;
        setRadius(radius);

        const neededRadius = radius * 2 * SIGNIFICANT_MOVE_DISTANCE;

        const zoomDiff = Math.abs(lastSignificantZoom - zoom);

        if (distance > neededRadius || zoomDiff > SIGNIFICANT_ZOOM_CHANGE || !firstFetchDone) {
            // console.log('Significant move detected, updating data...');
            setLastSignificantMove({ lat: center.lat, lng: center.lng });
            setLastSignificantZoom(zoom);
            setFirstFetchDone(true);
            queryClient.invalidateQueries({ queryKey: ['map'] });
        }
    }, [center, zoom, lastSignificantMove, radius]);


    const { isPending, error, data, isFetching } = useQuery({
        queryKey: ['map'],
        queryFn: async () => {
            const response: UsersMapResponse = await mapApi.getNearUsers(level.toString(), center.lat.toFixed(6), center.lng.toFixed(6), radius.toFixed(6));
            // console.log('Fetched map data:', response);
            return response;
        },
    });

    useEffect(() => {
        if (data) {
            setUsers(data.users);
            setClusters(data.clusters);
        }
    }, [data]);

    return (
        <div className='flex flex-col'>
            <p>Zoom: {zoom}</p>
            <p>Center: {center.lat}, {center.lng}</p>
            <p>Radius: {radius}</p>
            <div className='position-relative w-100' style={{ height: `calc(100vh - 77px)` }}>
                {isFetching && <div>Loading map data...</div>}
                {error && <div>An error has occurred: {(error as Error).message}</div>}
                {!isFetching && !error && <div>Map data loaded. Users: {users.length}, Clusters: {clusters.length}</div>}
                <div className='position-absolute w-100 h-100'>
                    <Map
                        ref={map}
                        onMove={onMoveEnd}
                        onZoom={onZoomEnd}
                        initialViewState={{
                            longitude: center.lng,
                            latitude: center.lat,
                            zoom: zoom
                        }}
                        style={{ width: '100%', height: '100%' }}
                        mapLib={maplibregl}
                        mapStyle='https://tiles.openfreemap.org/styles/bright'
                    >
                        {users.map((user) => (
                            <Marker
                                key={`user-${user.id}`}
                                longitude={user.longitude}
                                latitude={user.latitude}
                                onClick={() => router.push(`/profile/${user.id}`)}
                                >
                                <Image className='rounded-full w-24 h-24' unoptimized src={user.profilePicture || '/default-profile.svg'} alt={user.firstName} width={24} height={24} />
                            </Marker>
                        ))}

                        {clusters.map((cluster, index) => (
                            <Marker
                                key={`cluster-${index}`}
                                longitude={cluster.longitude}
                                latitude={cluster.latitude}
                            >
                                <div className='bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center border-2 border-white'>
                                    {cluster.count}
                                </div>
                            </Marker>
                        ))}
                    </Map>
                </div>
            </div>
        </div>
    );
}