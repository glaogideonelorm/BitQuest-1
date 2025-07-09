'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { LatLngExpression } from 'leaflet';

interface MapProps {
  treasureLocations: Array<{
    id: string;
    position: LatLngExpression;
    collected: boolean;
  }>;
  onTreasureClick: (id: string) => void;
}

export default function Map({ treasureLocations, onTreasureClick }: MapProps) {
  const [userLocation, setUserLocation] = useState<LatLngExpression>([0, 0]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  return (
    <MapContainer
      center={userLocation}
      zoom={16}
      className="h-[50vh] w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* User location marker */}
      <Marker position={userLocation}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Treasure markers */}
      {treasureLocations.map((treasure) => (
        <Marker
          key={treasure.id}
          position={treasure.position}
          eventHandlers={{
            click: () => onTreasureClick(treasure.id),
          }}
        >
          <Popup>
            {treasure.collected ? 'Collected!' : 'Treasure chest'}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
