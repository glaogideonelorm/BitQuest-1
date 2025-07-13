"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useFarcaster } from "@/hooks/useFarcaster";

// Fix for Leaflet marker icons in Next.js
const icon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom chest icons based on type and collection status
const createChestIcon = (type: string, isCollected: boolean) => {
  const colors = {
    common: isCollected ? "#888" : "#8b4513",
    rare: isCollected ? "#888" : "#ffd700",
    epic: isCollected ? "#888" : "#00ffff",
  };

  return L.divIcon({
    className: "chest-marker",
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: ${colors[type as keyof typeof colors] || colors.common};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ${isCollected ? "opacity: 0.5;" : ""}
      ">
        <span style="color: white; font-size: 16px; font-weight: bold;">💎</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

interface Chest {
  id: string;
  location: { lat: number; lng: number };
  metadata: { type: string; value: number; model: string };
  distance: number;
  isCollected: boolean;
}

interface MapProps {
  onChestSelect?: (chest: Chest) => void;
}

export default function Map({ onChestSelect }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const chestMarkersRef = useRef<L.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chests, setChests] = useState<Chest[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([
    40.7128, -74.006,
  ]); // Start with a default
  const { user } = useFarcaster();

  // Fetch nearby chests
  const fetchNearbyChests = useCallback(
    async (lat: number, lng: number) => {
      try {
        const params = new URLSearchParams({
          lat: lat.toString(),
          lon: lng.toString(),
          ...(user?.fid && { userId: user.fid.toString() }),
        });

        const response = await fetch(`/api/chests/nearby?${params}`);
        if (response.ok) {
          const data = await response.json();
          setChests(data);
        }
      } catch (error) {
        console.error("Error fetching nearby chests:", error);
      }
    },
    [user?.fid]
  );

  // Collect a chest
  const collectChest = async (chestId: string) => {
    if (!user?.fid) {
      alert("Please sign in with Farcaster to collect chests");
      return;
    }

    try {
      const response = await fetch(`/api/chests/${chestId}/collect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fid: user.fid }),
      });

      if (response.ok) {
        // Update the chests state to mark as collected
        setChests((prev) =>
          prev.map((chest) =>
            chest.id === chestId ? { ...chest, isCollected: true } : chest
          )
        );

        // Update the marker on the map
        updateChestMarkers();

        alert("Chest collected successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to collect chest");
      }
    } catch (error) {
      console.error("Error collecting chest:", error);
      alert("Failed to collect chest");
    }
  };

  // Update chest markers on the map
  const updateChestMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing chest markers
    chestMarkersRef.current.forEach((marker) => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    chestMarkersRef.current = [];

    // Add new chest markers
    chests.forEach((chest) => {
      const marker = L.marker([chest.location.lat, chest.location.lng], {
        icon: createChestIcon(chest.metadata.type, chest.isCollected),
      })
        .addTo(mapInstanceRef.current!)
        .bindPopup(
          `<div class="text-center">
             <h3 class="font-semibold mb-2">Treasure Chest</h3>
             <p class="text-sm text-gray-600 capitalize">${chest.metadata.type}</p>
             <p class="text-sm text-gray-600">Value: ${chest.metadata.value} points</p>
             <p class="text-sm text-gray-600">Distance: ${Math.round(chest.distance)}m</p>
             ${
               chest.isCollected
                 ? '<p class="text-sm text-green-600 font-semibold">✓ Collected</p>'
                 : `<button onclick="window.collectChest('${chest.id}')" class="btn-primary mt-2 text-sm py-1">Collect</button>`
             }
             <button onclick="window.selectChestForAR('${chest.id}')" class="btn-secondary mt-2 text-sm py-1 ml-2">View in AR</button>
           </div>`
        );

      chestMarkersRef.current.push(marker);
    });
  }, [chests]);

  // Geolocation effect
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(newLocation);
        fetchNearbyChests(position.coords.latitude, position.coords.longitude);
        setIsLoading(false);
      },
      () => {
        // On error or permission denied, stick with the default and stop loading
        fetchNearbyChests(userLocation[0], userLocation[1]);
        setIsLoading(false);
      }
    );
  }, [fetchNearbyChests]);

  // Map initialization and cleanup effect
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView(
        userLocation,
        13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      // Add user marker
      userMarkerRef.current = L.marker(userLocation, { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup("You are here");
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Effect to update map view and user marker when location changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(userLocation, 14);

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userLocation);
      }
    }
  }, [userLocation]);

  // Update chest markers when chests data changes
  useEffect(() => {
    updateChestMarkers();
  }, [updateChestMarkers]);

  // Expose functions globally for popup buttons
  useEffect(() => {
    (window as any).collectChest = collectChest;
    (window as any).selectChestForAR = (chestId: string) => {
      const chest = chests.find((c) => c.id === chestId);
      if (chest && onChestSelect) {
        onChestSelect(chest);
      }
    };
    return () => {
      delete (window as any).collectChest;
      delete (window as any).selectChestForAR;
    };
  }, [user?.fid, chests, onChestSelect]);

  return (
    <div className="w-full h-[70vh] relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 z-10 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Getting your location...</p>
          </div>
        </div>
      )}
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-xl shadow-lg"
      />
    </div>
  );
}
