import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BitrefillClient } from "@/lib/bitrefill";
import { RewardService } from "@/lib/rewardService";

// Initialize Bitrefill client
const bitrefill = new BitrefillClient({
  clientId: process.env.BITREFILL_CLIENT_ID!,
  clientSecret: process.env.BITREFILL_CLIENT_SECRET!,
});

// Initialize reward service
const rewardService = new RewardService(bitrefill, {
  minCollectionsForRedemption: 3, // Require at least 3 collections to redeem
  defaultCurrency: "USD",
  defaultGiftCardProductId: "amazon_us", // Example product ID
});

export async function POST(request: NextRequest) {
  try {
    const { fid, email } = await request.json();

    if (!fid || !email) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get user's pending collections
    const pendingCollections = await rewardService.getPendingCollections(fid);

    if (pendingCollections.length === 0) {
      return NextResponse.json(
        { error: "No pending collections found" },
        { status: 400 }
      );
    }

    // Check if user has enough collections
    if (!rewardService.canRedeem(pendingCollections)) {
      return NextResponse.json(
        { error: "Not enough collections for redemption" },
        { status: 400 }
      );
    }

    // Create redemption order
    const order = await rewardService.createRedemptionOrder(
      pendingCollections,
      email
    );

    // Start polling for order status
    const status = await rewardService.pollOrderStatus(order.id);

    if (status === "success") {
      // Mark collections as redeemed
      const collectionIds = pendingCollections.map((c) => c.id);
      await rewardService.markCollectionsAsRedeemed(collectionIds);

      return NextResponse.json({
        status: "success",
        orderId: order.id,
        message: "Rewards redeemed successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Order processing failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error redeeming rewards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
