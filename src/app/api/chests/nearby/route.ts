import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ChestService } from "@/lib/chestService";

const chestService = new ChestService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const userId = searchParams.get("userId");

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Missing lat/lon parameters" },
        { status: 400 }
      );
    }

    const chests = await chestService.findNearbyChests(
      parseFloat(lat),
      parseFloat(lon),
      1000, // 1km radius
      userId ? parseInt(userId) : undefined
    );

    return NextResponse.json(chests);
  } catch (error) {
    console.error("Error fetching nearby chests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
