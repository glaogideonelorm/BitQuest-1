import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ChestService } from "@/lib/chestService";

const chestService = new ChestService();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { fid } = await request.json();

    if (!fid) {
      return NextResponse.json(
        { error: "Missing fid parameter" },
        { status: 400 }
      );
    }

    const collection = await chestService.collectChest(id, fid);

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error collecting chest:", error);

    if (error instanceof Error) {
      if (error.message === "Chest not found") {
        return NextResponse.json({ error: "Chest not found" }, { status: 404 });
      }
      if (error.message === "Chest already collected") {
        return NextResponse.json(
          { error: "Chest already collected" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
