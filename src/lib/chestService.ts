import { prisma } from "./db";
import type { Chest, Collection } from "@prisma/client";

export interface ChestWithCollections extends Chest {
  collections: Collection[];
}

export interface NearbyChest extends Chest {
  distance: number;
  isCollected: boolean;
}

export class ChestService {
  // Find chests within a certain radius (in meters)
  async findNearbyChests(
    lat: number,
    lng: number,
    radius: number = 1000,
    userId?: number
  ): Promise<NearbyChest[]> {
    // For now, we'll use a simple distance calculation
    // In production, you'd want to use PostGIS for proper geo queries
    const chests = await prisma.chest.findMany({
      include: {
        collections: {
          where: userId ? { userId } : undefined,
        },
      },
    });

    return chests
      .map((chest) => {
        const location = chest.location as { lat: number; lng: number };
        const distance = this.calculateDistance(
          lat,
          lng,
          location.lat,
          location.lng
        );
        const isCollected = chest.collections.length > 0;

        return {
          ...chest,
          distance,
          isCollected,
        };
      })
      .filter((chest) => chest.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  // Get a specific chest by ID
  async getChestById(id: string): Promise<Chest | null> {
    return prisma.chest.findUnique({
      where: { id },
    });
  }

  // Collect a chest
  async collectChest(chestId: string, userId: number): Promise<Collection> {
    // Check if chest exists
    const chest = await this.getChestById(chestId);
    if (!chest) {
      throw new Error("Chest not found");
    }

    // Check if user already collected this chest
    const existingCollection = await prisma.collection.findFirst({
      where: {
        chestId,
        userId,
      },
    });

    if (existingCollection) {
      throw new Error("Chest already collected");
    }

    // Create collection
    return prisma.collection.create({
      data: {
        chestId,
        userId,
        status: "pending",
      },
    });
  }

  // Get user's collections
  async getUserCollections(userId: number): Promise<Collection[]> {
    return prisma.collection.findMany({
      where: { userId },
      include: {
        chest: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Get pending collections for a user
  async getPendingCollections(userId: number): Promise<Collection[]> {
    return prisma.collection.findMany({
      where: {
        userId,
        status: "pending",
      },
      include: {
        chest: true,
      },
    });
  }

  // Mark collections as redeemed
  async markCollectionsAsRedeemed(collectionIds: string[]): Promise<void> {
    await prisma.collection.updateMany({
      where: {
        id: {
          in: collectionIds,
        },
      },
      data: {
        status: "redeemed",
        redeemedAt: new Date(),
      },
    });
  }

  // Create a new chest (for seeding/admin purposes)
  async createChest(
    lat: number,
    lng: number,
    type: string,
    value: number,
    model: string
  ): Promise<Chest> {
    return prisma.chest.create({
      data: {
        location: { lat, lng },
        metadata: { type, value, model },
      },
    });
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
