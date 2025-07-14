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
const createChestIcon = (
  type: string,
  isCollected: boolean,
  isDemo: boolean = false
) => {
  const colors = {
    common: isCollected ? "#9CA3AF" : "#7C3AED",
    rare: isCollected ? "#9CA3AF" : "#F59E0B",
    epic: isCollected ? "#9CA3AF" : "#10B981",
  };

  const size = isDemo ? 48 : 40;
  const borderWidth = isDemo ? 3 : 2;
  const glowColor = isDemo ? "#F87171" : colors[type as keyof typeof colors];
  const glowSize = isDemo ? "0 0 20px" : "0 0 15px";

  return L.divIcon({
    className: "chest-marker",
    html: `
      <style>
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: ${glowSize} ${glowColor}40; }
          50% { transform: scale(1.1); box-shadow: ${glowSize} ${glowColor}80; }
          100% { transform: scale(1); box-shadow: ${glowSize} ${glowColor}40; }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      </style>
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${colors[type as keyof typeof colors]};
        border: ${borderWidth}px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${glowSize} ${glowColor}60;
        ${isCollected ? "opacity: 0.5;" : "animation: pulse 2s infinite, float 3s infinite ease-in-out;"}
        transition: all 0.3s ease;
      ">
        <span style="
          color: white;
          font-size: ${isDemo ? 24 : 20}px;
          font-weight: bold;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        ">💎</span>
        ${
          isDemo
            ? '<div style="position: absolute; top: -6px; right: -6px; background: #F87171; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">!</div>'
            : ""
        }
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
  onChestSelect?: (chest: Chest, allChests?: Chest[]) => void;
  setChests?: (chests: Chest[]) => void;
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

  // Spawn a test chest 5 meters away from user
  const spawnTestChest = () => {
    if (!userLocation) {
      alert("Please allow location access first");
      return;
    }

    // Calculate a point 5 meters north of current location
    const latOffset = 5 * 0.00000899; // ~5 meters in latitude
    const newLat = userLocation[0] + latOffset;
    const newLng = userLocation[1];

    const testChest: Chest = {
      id: `demo_${Date.now()}`,
      location: { lat: newLat, lng: newLng },
      metadata: {
        type: "common",
        value: 100,
        model: "chest.glb",
      },
      distance: 5,
      isCollected: false,
    };

    setChests((prev) => [...prev, testChest]);
    alert("Test chest spawned 5 meters north of your location!");
  };

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
          if (typeof setChests === "function") setChests(data);
        }
      } catch (error) {
        console.error("Error fetching nearby chests:", error);
      }
    },
    [user?.fid, setChests]
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
      const isDemo = chest.id.startsWith("demo_");
      const marker = L.marker([chest.location.lat, chest.location.lng], {
        icon: createChestIcon(chest.metadata.type, chest.isCollected, isDemo),
      })
        .addTo(mapInstanceRef.current!)
        .bindPopup(
          `<div class="text-center">
             <h3 class="font-semibold mb-2">${isDemo ? "🎯 Demo " : ""}Treasure Chest</h3>
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
        14
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
  }, [userLocation]);

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
        onChestSelect(chest, chests);
      }
    };
    return () => {
      delete (window as any).collectChest;
      delete (window as any).selectChestForAR;
    };
  }, [user?.fid, chests, onChestSelect]);

  return (
    <div className="w-full h-full relative">
      {/* Spawn Test Chest Button */}
      <button
        onClick={spawnTestChest}
        className="absolute top-4 right-4 z-10 glass-card hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl shadow-lg font-semibold text-sm flex items-center gap-2 group transition-all duration-200"
        title="Spawn a test chest 5m away (for testing only)"
      >
        <span className="text-lg group-hover:scale-110 transition-transform">
          🎯
        </span>
        <span>Spawn Test Chest</span>
      </button>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="loading-spinner mb-4" />
            <p className="text-gray-600 animate-pulse">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full map-container" />

      {/* Location Permission Warning */}
      {!userLocation && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="glass-card bg-yellow-500/10 border-yellow-500/20 px-6 py-3 rounded-xl shadow-lg">
            <p className="text-yellow-700 font-medium flex items-center gap-2">
              <span className="animate-pulse">📍</span>
              Please enable location access to find nearby treasures
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
