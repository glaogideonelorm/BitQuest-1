import { BitrefillClient, GiftCardOrder } from "./bitrefill";
import { prisma } from "./db";
import { ChestService } from "./chestService";
import type { Collection } from "@prisma/client";

export interface RewardConfig {
  minCollectionsForRedemption: number;
  defaultCurrency: string;
  defaultGiftCardProductId: string;
}

export class RewardService {
  private bitrefill: BitrefillClient;
  private config: RewardConfig;
  private chestService: ChestService;

  constructor(bitrefill: BitrefillClient, config: RewardConfig) {
    this.bitrefill = bitrefill;
    this.config = config;
    this.chestService = new ChestService();
  }

  // Get pending collections for a user
  async getPendingCollections(userId: number): Promise<Collection[]> {
    return this.chestService.getPendingCollections(userId);
  }

  // Calculate total value of pending rewards
  calculateTotalValue(collections: Collection[]): number {
    return collections.reduce((total, collection) => {
      const metadata = collection.chest.metadata as { value: number };
      return total + (metadata.value || 0);
    }, 0);
  }

  // Check if user has enough collections to redeem
  canRedeem(collections: Collection[]): boolean {
    return collections.length >= this.config.minCollectionsForRedemption;
  }

  // Create a gift card order from pending rewards
  async createRedemptionOrder(collections: Collection[], userEmail: string) {
    if (!this.canRedeem(collections)) {
      throw new Error(
        `Minimum ${this.config.minCollectionsForRedemption} collections required for redemption`
      );
    }

    const totalValue = this.calculateTotalValue(collections);

    const order: GiftCardOrder = {
      amount: totalValue,
      currency: this.config.defaultCurrency,
      email: userEmail,
      productId: this.config.defaultGiftCardProductId,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/bitrefill`,
    };

    try {
      // Create the order
      const orderResponse = await this.bitrefill.createGiftCardOrder(order);

      // Store the reward record
      await prisma.bitrefillReward.create({
        data: {
          orderId: orderResponse.id,
          value: totalValue,
          currency: this.config.defaultCurrency,
          userId: collections[0].userId, // All collections should have same userId
          status: orderResponse.status,
        },
      });

      // If using account balance, complete the purchase
      if (orderResponse.status === "unpaid") {
        const balance = await this.bitrefill.getAccountBalance();
        if (balance.amount >= totalValue) {
          await this.bitrefill.purchaseWithBalance(orderResponse.id);
        }
      }

      return orderResponse;
    } catch (error) {
      console.error("Error creating redemption order:", error);
      throw error;
    }
  }

  // Poll order status until complete or error
  async pollOrderStatus(
    orderId: string,
    maxAttempts = 10
  ): Promise<"success" | "error"> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const order = await this.bitrefill.checkOrderStatus(orderId);

      // Update the reward record status
      await prisma.bitrefillReward.update({
        where: { orderId },
        data: { status: order.status },
      });

      if (order.status === "success") {
        return "success";
      }

      if (order.status === "error" || order.expired) {
        return "error";
      }

      // Wait 2 seconds before next attempt
      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error("Order status polling timeout");
  }

  // Mark collections as redeemed after successful order
  async markCollectionsAsRedeemed(collectionIds: string[]): Promise<void> {
    await this.chestService.markCollectionsAsRedeemed(collectionIds);
  }
}
