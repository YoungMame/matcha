"use client";

import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { mapApi } from '@/lib/api/map';
import { UsersMapResponse, MapUser, MapCluster } from '@/types/api/usersMap';
import maplibregl, { Marker } from 'maplibre-gl';
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
    const [markersElements, setMarkersElements] = useState<Array<HTMLElement>>([]);

    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maplibregl.Map | null>(null);

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

    useEffect(() => {
        if (map.current) return;

        if (!mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://tiles.openfreemap.org/styles/bright',
            center: [center.lng, center.lat],
            zoom: zoom
        });

        setRadius(getScreenWidthInKM() / 2);

        map.current.addControl(new maplibregl.FullscreenControl());
        map.current.addControl(new maplibregl.NavigationControl());

        map.current.on('moveend', () => {
            if (!map.current) return;
            const center = map.current.getCenter();
            setCenter({ lat: center.lat, lng: center.lng });
        });

        map.current.on('zoomend', () => {
            if (!map.current) return;
            const zoom = map.current.getZoom();
            setZoom(zoom);
            setLevel(zoom < LEVEL1_ZOOM ? zoom < LEVEL2_ZOOM ? 2 : 1 : 0 );
        });
    }, []);

    useEffect(() => {
        const distance = haversineDistance(
            center.lat,
            center.lng,
            lastSignificantMove.lat,
            lastSignificantMove.lng
        );
        const radius = getScreenWidthInKM() / 2;
        const neededRadius = radius * 2 * SIGNIFICANT_MOVE_DISTANCE;

        const zoomDiff = Math.abs(lastSignificantZoom - zoom);

        if (distance > neededRadius || zoomDiff > SIGNIFICANT_ZOOM_CHANGE) {
            console.log('Significant move detected, updating data...');
            setLastSignificantMove({ lat: center.lat, lng: center.lng });
            setLastSignificantZoom(zoom);
            setRadius(radius);
            queryClient.invalidateQueries({ queryKey: ['map'] });
        }
    }, [center, zoom, lastSignificantMove]);


    const { isPending, error, data, isFetching } = useQuery({
        queryKey: ['map'],
        queryFn: async () => {
            console.log('refetching')
            const response: UsersMapResponse = await mapApi.getNearUsers(level.toString(), center.lat.toFixed(6), center.lng.toFixed(6), (radius * 111.32).toFixed(6));
            console.log('Fetched map data:', response);
            return response;
        },
    });

    useEffect(() => {
        console.log('Map data updated:', data);
        if (data) {
            setUsers(data.users);
            setClusters(data.clusters);
        }

        markersElements.forEach(el => el.remove());
        setMarkersElements([]);

        data?.users.forEach(user => {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.opacity = '1';
            el.style.fillOpacity = '1';
            el.style.width = '50px';
            el.style.height = '50px';
            el.style.backgroundImage = `url(${user.profilePicture || '/default-profile.svg'})`;
            el.style.backgroundPosition = 'center';
            el.style.backgroundSize = 'cover';
            el.style.borderRadius = '50%';
            el.style.border = '5px solid red';
            el.title = user.firstName;
            el.onclick = () => {
                router.push(`/profile/${user.id}`);
            }
            new Marker({ element: el })
                .setLngLat([user.longitude, user.latitude])
                .addTo(map.current!);
            setMarkersElements(prev => [...prev, el]);
        });

        data?.clusters.forEach(user => {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.opacity = '1';
            el.style.fillOpacity = '1';
            el.style.width = '50px';
            el.style.height = '50px';
            el.style.backgroundColor = 'rgba(0, 123, 255, 0.7)';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.innerHTML = `<span style="color: white; font-weight: bold; width: 100%; text-align: center;">${user.count}</span>`;
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            new Marker({ element: el })
                .setLngLat([user.longitude, user.latitude])
                .addTo(map.current!);
            setMarkersElements(prev => [...prev, el]);
        });
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
                <div ref={mapContainer} className='position-absolute w-100 h-100'>
                </div>
            </div>
        </div>
    );
}