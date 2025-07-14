"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { X, MapPin, Navigation, Camera, ArrowLeft } from "lucide-react";
import DirectionalArrow from "./DirectionalArrow";

interface Chest {
  lat: number;
  lng: number;
  type: "common" | "rare" | "epic";
  isCollected?: boolean;
}

interface ARViewProps {
  chests: Chest[];
  selectedChest: any;
  onBack?: () => void;
  onSpawnChest?: (chest: Chest) => void;
}

// Dynamic import for AR.js to avoid SSR issues
const ARScene = dynamic(() => import("./ARScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p>Loading AR...</p>
      </div>
    </div>
  ),
});

export default function ARView({
  chests = [],
  selectedChest,
  onBack,
  onSpawnChest,
}: ARViewProps) {
  const [hasCamera, setHasCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isNearChest, setIsNearChest] = useState(false);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [bearingToChest, setBearingToChest] = useState<number | null>(null);
  const [arrowAngle, setArrowAngle] = useState<number | null>(null);
  const [isSuperNearChest, setIsSuperNearChest] = useState(false);
  const [abandonOverride, setAbandonOverride] = useState(false);

  // Calculate bearing between two points
  function calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    return ((θ * 180) / Math.PI + 360) % 360; // in degrees
  }

  // Listen for device orientation (compass heading)
  useEffect(() => {
    function handleOrientation(event: DeviceOrientationEvent) {
      // event.absolute is more reliable, but fallback to event.alpha
      let heading = event.alpha;
      // iOS uses webkitCompassHeading
      // @ts-ignore
      if (typeof event.webkitCompassHeading === "number") {
        // @ts-ignore
        heading = event.webkitCompassHeading;
      }
      if (typeof heading === "number") {
        setDeviceHeading(heading);
      }
    }
    window.addEventListener(
      "deviceorientationabsolute",
      handleOrientation,
      true
    );
    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation
      );
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  // Update bearing to chest whenever user or chest location changes
  useEffect(() => {
    if (userLocation && selectedChest) {
      const bearing = calculateBearing(
        userLocation.lat,
        userLocation.lng,
        selectedChest.lat || selectedChest.location?.lat,
        selectedChest.lng || selectedChest.location?.lng
      );
      setBearingToChest(bearing);
    }
  }, [userLocation, selectedChest]);

  // Update arrow angle whenever device heading or bearing changes
  useEffect(() => {
    if (deviceHeading !== null && bearingToChest !== null) {
      let angle = bearingToChest - deviceHeading;
      // Normalize to [-180, 180]
      if (angle > 180) angle -= 360;
      if (angle < -180) angle += 360;
      setArrowAngle(angle);
    }
  }, [deviceHeading, bearingToChest]);

  useEffect(() => {
    // Check for camera access
    if (typeof navigator !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {
          setHasCamera(true);
          setIsLoading(false);
        })
        .catch(() => {
          setHasCamera(false);
          setIsLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    let watchId: number | null = null;
    if (navigator.geolocation && selectedChest) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Calculate distance to chest if chest location is provided
          const dist = calculateDistance(
            latitude,
            longitude,
            selectedChest.lat || selectedChest.location?.lat,
            selectedChest.lng || selectedChest.location?.lng
          );
          setDistance(dist);
          setIsNearChest(dist <= 50); // Within 50 meters
          setIsSuperNearChest(dist <= 5); // Within 5 meters
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    }
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [selectedChest]);

  // Helper: calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find closest chest
  const closestChest = userLocation
    ? chests.reduce(
        (closest, chest) => {
          const dist = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            chest.lat || chest.location?.lat,
            chest.lng || chest.location?.lng
          );
          if (!closest) return { chest, dist };
          return dist < closest.dist ? { chest, dist } : closest;
        },
        null as null | { chest: any; dist: number }
      )?.chest
    : selectedChest;

  // Helper: get bearing from user to chest
  const getBearing = (chest: any) => {
    if (!userLocation || deviceHeading === null) return 0;
    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    const lat2 = chest.lat || chest.location?.lat;
    const lon2 = chest.lng || chest.location?.lng;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    let bearing = ((θ * 180) / Math.PI + 360) % 360;
    let angle = bearing - deviceHeading;
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;
    return angle;
  };

  // Main arrow: closest chest (unless abandonOverride)
  const mainChest =
    abandonOverride || !closestChest || closestChest === selectedChest
      ? selectedChest
      : closestChest;
  const secondaryChest =
    !abandonOverride && closestChest && closestChest !== selectedChest
      ? selectedChest
      : null;

  const requestCamera = () => {
    if (typeof navigator !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {
          setHasCamera(true);
          setIsLoading(false);
        })
        .catch((e) => {
          console.error("Error requesting camera:", e);
          alert("Failed to enable camera. Please check browser settings.");
        });
    }
  };

  // Helper to spawn a chest 0.5m ahead of user
  const spawnChestAhead = () => {
    if (!userLocation || deviceHeading === null || !onSpawnChest) return;
    const R = 6371e3; // Earth radius in meters
    const d = 0.5; // 0.5 meter
    const θ = (deviceHeading * Math.PI) / 180;
    const φ1 = (userLocation.lat * Math.PI) / 180;
    const λ1 = (userLocation.lng * Math.PI) / 180;
    const φ2 = Math.asin(
      Math.sin(φ1) * Math.cos(d / R) +
        Math.cos(φ1) * Math.sin(d / R) * Math.cos(θ)
    );
    const λ2 =
      λ1 +
      Math.atan2(
        Math.sin(θ) * Math.sin(d / R) * Math.cos(φ1),
        Math.cos(d / R) - Math.sin(φ1) * Math.sin(φ2)
      );
    const newLat = (φ2 * 180) / Math.PI;
    const newLng = (λ2 * 180) / Math.PI;
    onSpawnChest({
      lat: newLat,
      lng: newLng,
      type: selectedChest?.type || selectedChest?.metadata?.type || "common",
      isCollected: false,
    });
  };

  return (
    <div className="relative w-full h-full">
      {/* Spawn Chest Button */}
      <button
        onClick={spawnChestAhead}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-40 glass-card bg-green-600/80 hover:bg-green-700/90 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        Spawn Chest Nearby
      </button>
      {/* Camera Permission Warning */}
      {!hasCamera && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-card max-w-md text-center p-8">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Camera Access Required</h3>
            <p className="text-gray-400 mb-6">
              Please allow camera access to experience the AR treasure hunt.
            </p>
            <button onClick={requestCamera} className="btn-primary w-full">
              Enable Camera
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner border-white mb-4" />
            <p className="text-white/80 animate-pulse">Initializing AR...</p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-30 glass-card hover:bg-white/20 p-3 rounded-full shadow-lg transition-all duration-200"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </button>

      {/* Chest Info Card */}
      <div className="absolute top-4 right-4 z-30 glass-card p-4 rounded-xl shadow-lg max-w-[200px]">
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`w-3 h-3 rounded-full ${getBadgeColor(selectedChest?.type || selectedChest?.metadata?.type)}`}
          />
          <h3 className="font-semibold text-white capitalize">
            {(selectedChest?.type || selectedChest?.metadata?.type) ?? ""} Chest
          </h3>
        </div>
        <p className="text-sm text-white/60">
          {selectedChest?.isCollected
            ? "Already collected"
            : "Ready to collect"}
        </p>
      </div>

      {/* AR Scene */}
      <ARScene chests={chests} userLocation={userLocation} />

      {/* Main Directional Arrow */}
      {mainChest && (
        <DirectionalArrow
          distance={
            userLocation
              ? calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  mainChest.lat || mainChest.location?.lat,
                  mainChest.lng || mainChest.location?.lng
                )
              : 0
          }
          angle={getBearing(mainChest)}
          isNearChest={false}
        />
      )}

      {/* Secondary Directional Arrow (bottom-left, animated) */}
      {secondaryChest && (
        <div className="fixed bottom-8 left-8 z-40 transition-transform duration-300 animate-bounce-in">
          <DirectionalArrow
            distance={
              userLocation
                ? calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    secondaryChest.lat || secondaryChest.location?.lat,
                    secondaryChest.lng || secondaryChest.location?.lng
                  )
                : 0
            }
            angle={getBearing(secondaryChest)}
            isNearChest={false}
          />
        </div>
      )}

      {/* Abandon Button */}
      {secondaryChest && (
        <button
          onClick={() => setAbandonOverride(true)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass-card bg-yellow-500/90 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg shadow-lg font-semibold"
        >
          Abandon closer chest and continue to selected chest
        </button>
      )}

      {/* Distance Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        {distance !== null && (
          <div className="glass-card px-4 py-2 rounded-full shadow-lg">
            <p className="text-white text-sm">{Math.round(distance)}m away</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for chest type colors
function getBadgeColor(type: string) {
  switch (type) {
    case "common":
      return "bg-[var(--primary)]";
    case "rare":
      return "bg-[var(--accent)]";
    case "epic":
      return "bg-[var(--secondary)]";
    default:
      return "bg-gray-400";
  }
}
