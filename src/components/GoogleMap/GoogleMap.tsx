import { useEffect, useRef } from 'react';
import {
  importLibrary,
} from '@googlemaps/js-api-loader';

import {
  subscribeToRiderLocations,
} from '../../services/firebase/riders/riders-location.services';

import type { RiderLocation } from '../../services/firebase/riders/riders.types';

import './GoogleMap.css';

function GoogleMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const mapInstance =
    useRef<google.maps.Map | null>(null);

  const markersRef =
    useRef<
      Map<
        string,
        google.maps.marker.AdvancedMarkerElement
      >
    >(new Map());

  // Keep the latest rider locations even if Firestore
  // updates before Google Maps finishes loading.
  const riderLocationsRef =
    useRef<Map<string, RiderLocation>>(new Map());

  function renderRiderMarkers() {
    const map = mapInstance.current;

    if (!map) {
      return;
    }

    const locations = Array.from(
      riderLocationsRef.current.values(),
    );

    const activeRiderIds = new Set(
      locations.map(
        (location) => location.riderId,
      ),
    );

    // Remove markers for riders that no longer
    // have an active location.
    markersRef.current.forEach(
      (marker, riderId) => {
        if (!activeRiderIds.has(riderId)) {
          marker.map = null;
          markersRef.current.delete(riderId);
        }
      },
    );

    // Create or update rider markers.
    locations.forEach((location) => {
      const existingMarker =
        markersRef.current.get(
          location.riderId,
        );

      const position = {
        lat: location.latitude,
        lng: location.longitude,
      };

      if (existingMarker) {
        existingMarker.position = position;
        return;
      }

      const marker =
        new google.maps.marker.AdvancedMarkerElement({
          map,
          position,
          title: `Rider ${location.riderId}`,
        });

      markersRef.current.set(
        location.riderId,
        marker,
      );
    });
  }

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

        await importLibrary('marker');

        if (!isMounted || !mapRef.current) {
          return;
        }

        const map = new Map(mapRef.current, {
          center: {
            lat: 8.2280,
            lng: 124.2452,
          },
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          mapId: 'BASURAGO_ADMIN_MAP',
        });

        mapInstance.current = map;

        // Important:
        // Render any rider locations that arrived
        // before the map finished loading.
        renderRiderMarkers();
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

      markersRef.current.forEach(
        (marker) => {
          marker.map = null;
        },
      );

      markersRef.current.clear();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const unsubscribe =
      subscribeToRiderLocations(
        (locations: RiderLocation[]) => {
          riderLocationsRef.current.clear();

          locations.forEach((location) => {
            riderLocationsRef.current.set(
              location.riderId,
              location,
            );
          });

          renderRiderMarkers();
        },
      );

    return unsubscribe;
  }, []);

  return (
    <div
      ref={mapRef}
      className="google-map"
      aria-label="BasuraGo map"
    />
  );
}

export default GoogleMap;