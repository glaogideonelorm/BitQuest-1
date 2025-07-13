"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Hero from "@/components/Hero";
import ARView from "@/components/ARView";
import RewardRedemption from "@/components/RewardRedemption";
import { motion } from "framer-motion";
import { X, Camera } from "lucide-react";

// Import Map component dynamically to avoid SSR issues
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [isQuestMode, setIsQuestMode] = useState(false);
  const [isArMode, setIsArMode] = useState(false);
  const [selectedChest, setSelectedChest] = useState<any>(null);

  const startQuest = (e) => {
    e.preventDefault();
    setIsQuestMode(true);
    setIsArMode(false);
  };

  const handleChestSelect = (chest) => {
    setSelectedChest(chest);
    setIsArMode(true);
  };

  const handleChestCollect = async () => {
    if (!selectedChest) return;

    // This will be handled by the AR component
    // The actual collection happens in the Map component
    alert("Chest collected! Check your map to see the updated status.");
  };

  if (isQuestMode) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="w-full h-full relative">
          <button
            onClick={() => setIsQuestMode(false)}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white"
          >
            <X size={24} />
          </button>

          {!isArMode ? (
            <>
              <Map onChestSelect={handleChestSelect} />
              <button
                onClick={() => setIsArMode(true)}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 btn-primary inline-flex items-center gap-2 text-lg"
              >
                <Camera size={20} />
                Switch to AR View
              </button>
            </>
          ) : (
            <ARView
              chestType={selectedChest?.metadata?.type}
              onCollect={handleChestCollect}
              isCollected={selectedChest?.isCollected}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <Hero onStartQuest={startQuest} />

      {/* Map Section */}
      <section id="map" className="py-16 bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
              Explore Nearby Treasures
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Find virtual treasure chests in your area. Each chest contains
              exciting Bitrefill rewards waiting to be claimed!
            </p>
            <div className="h-[70vh] rounded-xl overflow-hidden">
              <Map />
            </div>
          </motion.div>
        </div>
      </section>

      {/* AR View Section */}
      <section id="ar-view" className="py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
                  Augmented Reality Treasure Hunt
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Use your phone's camera to locate and collect virtual treasure
                  chests in the real world. It's like Pokémon GO, but with real
                  rewards!
                </p>
                <div className="card bg-[var(--primary)] text-white">
                  <h3 className="text-xl font-semibold mb-4">How to Collect</h3>
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <span className="font-bold">1.</span>
                      <span>Find a chest on the map</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">2.</span>
                      <span>Walk to its location</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">3.</span>
                      <span>Open your camera</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold">4.</span>
                      <span>Collect the treasure!</span>
                    </li>
                  </ol>
                </div>
              </div>
              <div className="relative">
                <ARView />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rewards Section */}
      <section id="rewards" className="py-16 bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
              Claim Your Rewards
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Turn your collected treasures into real Bitrefill rewards. Get
              gift cards, mobile top-ups, and more!
            </p>
            <RewardRedemption />
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-12 text-center">
              How BitQuest Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card">
                <div className="h-12 w-12 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-bold mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-4">Explore</h3>
                <p className="text-gray-600">
                  Open the map to find nearby treasure chests. Each chest
                  contains different types of rewards.
                </p>
              </div>
              <div className="card">
                <div className="h-12 w-12 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-bold mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-4">Hunt</h3>
                <p className="text-gray-600">
                  Walk to the chest's location and use your phone's camera to
                  find and collect it in AR.
                </p>
              </div>
              <div className="card">
                <div className="h-12 w-12 bg-[var(--primary)] rounded-full flex items-center justify-center text-white font-bold mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-4">Redeem</h3>
                <p className="text-gray-600">
                  Exchange your collected treasures for Bitrefill gift cards and
                  other exciting rewards.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--primary)]">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">
              Ready to Start Your Quest?
            </h2>
            <p className="text-xl mb-12">
              Join the treasure hunt and earn amazing rewards!
            </p>
            <a
              href="#map"
              onClick={startQuest}
              className="inline-flex items-center px-8 py-3 border-2 border-white text-lg font-semibold rounded-lg text-white hover:bg-white hover:text-[var(--primary)] transition-colors duration-200"
            >
              Start Now
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
