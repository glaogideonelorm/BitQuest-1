"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useFarcaster } from "@/hooks/useFarcaster";

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  image: string;
}

const rewards: Reward[] = [
  {
    id: "1",
    name: "Amazon Gift Card",
    description: "$10 Amazon.com Gift Card",
    cost: 100,
    image: "https://placehold.co/200x125/ff9900/white?text=Amazon",
  },
  {
    id: "2",
    name: "Steam Wallet",
    description: "$20 Steam Wallet Code",
    cost: 200,
    image: "https://placehold.co/200x125/2a475e/white?text=Steam",
  },
  {
    id: "3",
    name: "PlayStation Store",
    description: "$25 PlayStation Store Credit",
    cost: 250,
    image: "https://placehold.co/200x125/0070d1/white?text=PlayStation",
  },
  {
    id: "4",
    name: "Xbox Gift Card",
    description: "$15 Xbox Gift Card",
    cost: 150,
    image: "https://placehold.co/200x125/107c10/white?text=Xbox",
  },
];

export default function RewardRedemption() {
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useFarcaster();

  // Fetch user's points from pending collections
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user?.fid) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/rewards/pending?userId=${user.fid}`);
        if (response.ok) {
          const data = await response.json();
          setPoints(data.totalValue || 0);
        }
      } catch (error) {
        console.error("Error fetching user points:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPoints();
  }, [user?.fid]);

  const handleRedeem = (rewardId: string) => {
    if (!user?.fid) {
      alert("Please sign in with Farcaster to redeem rewards");
      return;
    }
    setSelectedReward(rewardId);
    setShowConfirmation(true);
  };

  const confirmRedeem = async () => {
    if (!user?.fid || !selectedReward) return;

    try {
      const response = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fid: user.fid,
          email: "user@example.com", // TODO: Get user email from Farcaster profile
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Rewards redeemed successfully! Order ID: ${result.orderId}`);
        setPoints(0); // Reset points after redemption
      } else {
        const error = await response.json();
        alert(error.error || "Failed to redeem rewards");
      }
    } catch (error) {
      console.error("Error redeeming rewards:", error);
      alert("Failed to redeem rewards");
    }

    setShowConfirmation(false);
    setSelectedReward(null);
  };

  return (
    <div className="space-y-8">
      {/* Points display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] p-6 rounded-xl text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Your Points</h3>
            <p className="text-white/80">Available for redemption</p>
          </div>
          <div className="text-4xl font-bold">{points}</div>
        </div>
      </motion.div>

      {/* Rewards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {rewards.map((reward, index) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card hover:shadow-xl transition-shadow duration-200 ${
              points < reward.cost ? "opacity-50" : ""
            }`}
          >
            <img
              src={reward.image}
              alt={reward.name}
              className="w-16 h-16 mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">{reward.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[var(--primary)] font-semibold">
                {reward.cost} points
              </span>
              <button
                onClick={() => handleRedeem(reward.id)}
                disabled={points < reward.cost}
                className={`btn-primary text-sm ${
                  points < reward.cost ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Redeem
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confirmation modal */}
      {showConfirmation && selectedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-semibold mb-4">Confirm Redemption</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to redeem{" "}
              {rewards.find((r) => r.id === selectedReward)?.name}?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button onClick={confirmRedeem} className="flex-1 btn-primary">
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
