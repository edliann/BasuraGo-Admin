import { useEffect, useRef } from 'react';
import {
  importLibrary,
} from '@googlemaps/js-api-loader';

import {
  subscribeToRiderLocations,
} from '../../services/firebase/riders/riders-location.services';

import type { RiderLocation } from '../../services/firebase/riders/riders.types';

import './RiderMap.css';

interface RiderMapProps {
  riderId: string;
}

function RiderMap({ riderId }: RiderMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const mapInstance =
    useRef<google.maps.Map | null>(null);

  const markerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(
      null,
    );

  useEffect(() => {
    let isMounted = true;

    async function initializeMap() {
      if (!mapRef.current) {
        return;
      }

      try {
        const { Map } =
          (await importLibrary(
            'maps',
          )) as google.maps.MapsLibrary;

        const { AdvancedMarkerElement } =
          (await importLibrary(
            'marker',
          )) as google.maps.MarkerLibrary;

        if (!isMounted || !mapRef.current) {
          return;
        }

        const map = new Map(mapRef.current, {
          center: {
            lat: 8.2280,
            lng: 124.2452,
          },
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          mapId: 'BASURAGO_ADMIN_MAP',
        });

        mapInstance.current = map;

        markerRef.current =
          new AdvancedMarkerElement({
            map,
            title: 'Rider location',
          });
      } catch (error) {
        console.error(
          'Google Maps failed to load:',
          error,
        );
      }
    }

    initializeMap();

    return () => {
      isMounted = false;

      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }

      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const unsubscribe =
      subscribeToRiderLocations(
        (locations: RiderLocation[]) => {
          const riderLocation =
            locations.find(
              (location) =>
                location.riderId === riderId,
            );

          if (!riderLocation) {
            return;
          }

          const position = {
            lat: riderLocation.latitude,
            lng: riderLocation.longitude,
          };

          const map = mapInstance.current;
          const marker = markerRef.current;

          if (!map || !marker) {
            return;
          }

          marker.position = position;

          map.panTo(position);
        },
      );

    return unsubscribe;
  }, [riderId]);

  return (
    <div
      ref={mapRef}
      className="rider-map"
      aria-label="Rider live location map"
    />
  );
}

export default RiderMap;