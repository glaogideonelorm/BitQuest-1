import { BitrefillClient, GiftCardOrder } from './bitrefill'

export interface RewardConfig {
  minCollectionsForRedemption: number
  defaultCurrency: string
  defaultGiftCardProductId: string
}

export interface PendingReward {
  userId: number // Farcaster FID
  chestId: string
  value: number
  collectedAt: Date
}

export class RewardService {
  private bitrefill: BitrefillClient
  private config: RewardConfig

  constructor(bitrefill: BitrefillClient, config: RewardConfig) {
    this.bitrefill = bitrefill
    this.config = config
  }

  // Calculate total value of pending rewards
  calculateTotalValue(pendingRewards: PendingReward[]): number {
    return pendingRewards.reduce((total, reward) => total + reward.value, 0)
  }

  // Check if user has enough collections to redeem
  canRedeem(pendingRewards: PendingReward[]): boolean {
    return pendingRewards.length >= this.config.minCollectionsForRedemption
  }

  // Create a gift card order from pending rewards
  async createRedemptionOrder(
    pendingRewards: PendingReward[],
    userEmail: string
  ) {
    if (!this.canRedeem(pendingRewards)) {
      throw new Error(`Minimum ${this.config.minCollectionsForRedemption} collections required for redemption`)
    }

    const totalValue = this.calculateTotalValue(pendingRewards)

    const order: GiftCardOrder = {
      amount: totalValue,
      currency: this.config.defaultCurrency,
      email: userEmail,
      productId: this.config.defaultGiftCardProductId,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/bitrefill`
    }

    try {
      // Create the order
      const orderResponse = await this.bitrefill.createGiftCardOrder(order)

      // If using account balance, complete the purchase
      if (orderResponse.status === 'unpaid') {
        const balance = await this.bitrefill.getAccountBalance()
        if (balance.amount >= totalValue) {
          await this.bitrefill.purchaseWithBalance(orderResponse.id)
        }
      }

      return orderResponse
    } catch (error) {
      console.error('Error creating redemption order:', error)
      throw error
    }
  }

  // Poll order status until complete or error
  async pollOrderStatus(orderId: string, maxAttempts = 10): Promise<'success' | 'error'> {
    let attempts = 0
    
    while (attempts < maxAttempts) {
      const order = await this.bitrefill.checkOrderStatus(orderId)
      
      if (order.status === 'success') {
        return 'success'
      }
      
      if (order.status === 'error' || order.expired) {
        return 'error'
      }
      
      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }
    
    throw new Error('Order status polling timeout')
  }
} 