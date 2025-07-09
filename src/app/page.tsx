'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ARView from '@/components/ARView';

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
});

interface Treasure {
  id: string;
  position: [number, number];
  collected: boolean;
}

export default function Home() {
  const [treasures, setTreasures] = useState<Treasure[]>([
    {
      id: '1',
      position: [40.7128, -74.0060], // Example location
      collected: false,
    },
    {
      id: '2',
      position: [40.7138, -74.0065], // Example location
      collected: false,
    },
  ]);
  
  const [selectedTreasure, setSelectedTreasure] = useState<string | null>(null);
  const [showAR, setShowAR] = useState(false);

  const handleTreasureClick = (id: string) => {
    setSelectedTreasure(id);
    setShowAR(true);
  };

  const handleCollectTreasure = () => {
    if (selectedTreasure) {
      setTreasures(treasures.map(t => 
        t.id === selectedTreasure ? { ...t, collected: true } : t
      ));
      setShowAR(false);
      setSelectedTreasure(null);
    }
  };

  return (
    <main className="min-h-screen p-4">
      <h1 className="mb-4 text-2xl font-bold">BitQuest</h1>
      
      <div className="rounded-lg border shadow-lg">
        <Map
          treasureLocations={treasures}
          onTreasureClick={handleTreasureClick}
        />
      </div>

      <ARView
        isVisible={showAR}
        onCollect={handleCollectTreasure}
      />
    </main>
  );
}
