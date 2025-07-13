import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RewardService } from "@/lib/rewardService";
import { BitrefillClient } from "@/lib/bitrefill";

// Initialize Bitrefill client
const bitrefill = new BitrefillClient({
  clientId: process.env.BITREFILL_CLIENT_ID!,
  clientSecret: process.env.BITREFILL_CLIENT_SECRET!,
});

// Initialize reward service
const rewardService = new RewardService(bitrefill, {
  minCollectionsForRedemption: 3,
  defaultCurrency: "USD",
  defaultGiftCardProductId: "amazon_us",
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const pendingCollections = await rewardService.getPendingCollections(
      parseInt(userId)
    );
    const totalValue = rewardService.calculateTotalValue(pendingCollections);

    return NextResponse.json({
      pendingCollections,
      totalValue,
      canRedeem: rewardService.canRedeem(pendingCollections),
    });
  } catch (error) {
    console.error("Error fetching pending rewards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
