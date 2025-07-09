import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { BitrefillClient } from '@/lib/bitrefill'
import { RewardService } from '@/lib/rewardService'

// Initialize Bitrefill client
const bitrefill = new BitrefillClient({
  clientId: process.env.BITREFILL_CLIENT_ID!,
  clientSecret: process.env.BITREFILL_CLIENT_SECRET!,
})

// Initialize reward service
const rewardService = new RewardService(bitrefill, {
  minCollectionsForRedemption: 3, // Require at least 3 collections to redeem
  defaultCurrency: 'USD',
  defaultGiftCardProductId: 'amazon_us', // Example product ID
})

export async function POST(request: NextRequest) {
  try {
    const { fid, email, pendingRewards } = await request.json()

    if (!fid || !email || !pendingRewards?.length) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Validate that all rewards belong to the user
    const invalidRewards = pendingRewards.filter(
      (reward: any) => reward.userId !== fid
    )
    if (invalidRewards.length > 0) {
      return NextResponse.json(
        { error: 'Invalid rewards provided' },
        { status: 400 }
      )
    }

    // Check if user has enough collections
    if (!rewardService.canRedeem(pendingRewards)) {
      return NextResponse.json(
        { error: 'Not enough collections for redemption' },
        { status: 400 }
      )
    }

    // Create redemption order
    const order = await rewardService.createRedemptionOrder(pendingRewards, email)

    // Start polling for order status
    const status = await rewardService.pollOrderStatus(order.id)

    if (status === 'success') {
      // TODO: Update database to mark rewards as redeemed
      return NextResponse.json({
        status: 'success',
        orderId: order.id,
        message: 'Rewards redeemed successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Order processing failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error redeeming rewards:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 