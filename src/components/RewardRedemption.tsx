'use client'

import { useState } from 'react'
import { PendingReward } from '@/lib/rewardService'

interface RewardRedemptionProps {
  fid: number
  pendingRewards: PendingReward[]
  onSuccess: (orderId: string) => void
  onError: (error: Error) => void
}

export default function RewardRedemption({
  fid,
  pendingRewards,
  onSuccess,
  onError
}: RewardRedemptionProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const totalValue = pendingRewards.reduce((sum, reward) => sum + reward.value, 0)
  const canRedeem = pendingRewards.length >= 3 // Minimum 3 collections required

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canRedeem || !email || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fid,
          email,
          pendingRewards,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to redeem rewards')
      }

      const { orderId } = await response.json()
      onSuccess(orderId)
    } catch (error) {
      console.error('Error redeeming rewards:', error)
      onError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">Reward Redemption</h2>
      
      <div className="mb-6">
        <h3 className="mb-2 font-semibold">Pending Rewards</h3>
        <ul className="mb-4 space-y-2">
          {pendingRewards.map((reward) => (
            <li
              key={reward.chestId}
              className="flex items-center justify-between rounded bg-gray-50 p-2"
            >
              <span>Chest #{reward.chestId}</span>
              <span className="font-medium">${reward.value.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        
        <div className="mb-4 flex items-center justify-between border-t border-gray-200 pt-4">
          <span className="font-semibold">Total Value:</span>
          <span className="text-xl font-bold">${totalValue.toFixed(2)}</span>
        </div>

        {!canRedeem && (
          <p className="mb-4 text-sm text-red-600">
            Collect at least 3 chests to redeem rewards
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email for Gift Card Delivery
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            placeholder="Enter your email"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!canRedeem || !email || isLoading}
          className={`w-full rounded-lg px-4 py-2 text-white ${
            canRedeem && email && !isLoading
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'cursor-not-allowed bg-gray-400'
          }`}
        >
          {isLoading ? 'Processing...' : 'Redeem Rewards'}
        </button>
      </form>
    </div>
  )
} 