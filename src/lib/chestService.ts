import { prisma } from "./db";
import type { Chest, Collection } from "@prisma/client";

export interface ChestWithCollections extends Chest {
  collections: Collection[];
}

export interface CollectionWithChest extends Collection {
  chest: Chest;
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
    // Get existing chests from database
    const existingChests = await prisma.chest.findMany({
      include: {
        collections: {
          where: userId ? { userId } : undefined,
        },
      },
    });

    // Calculate distances and filter by radius
    const nearbyExistingChests = existingChests
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

    // Generate additional chests if we don't have enough
    const targetChestCount = 8; // Generate 8 chests total
    const additionalChestsNeeded = Math.max(
      0,
      targetChestCount - nearbyExistingChests.length
    );

    if (additionalChestsNeeded > 0) {
      const generatedChests = this.generateRandomChests(
        lat,
        lng,
        radius,
        additionalChestsNeeded,
        userId
      );

      // Add a demo chest very close to the user for testing
      const demoChest = this.createDemoChest(lat, lng);

      return [demoChest, ...nearbyExistingChests, ...generatedChests]
        .sort((a, b) => a.distance - b.distance)
        .slice(0, targetChestCount);
    }

    // Always add demo chest even if we have enough existing chests
    const demoChest = this.createDemoChest(lat, lng);
    return [demoChest, ...nearbyExistingChests]
      .sort((a, b) => a.distance - b.distance)
      .slice(0, targetChestCount);
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
  async getPendingCollections(userId: number): Promise<CollectionWithChest[]> {
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

  // Generate random chests around a location
  private generateRandomChests(
    centerLat: number,
    centerLng: number,
    radius: number,
    count: number,
    userId?: number
  ): NearbyChest[] {
    const chests: NearbyChest[] = [];
    const chestTypes = ["common", "rare", "epic"];
    const typeWeights = [0.7, 0.25, 0.05]; // 70% common, 25% rare, 5% epic

    for (let i = 0; i < count; i++) {
      // Generate random position within radius
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radius;

      // Convert polar coordinates to lat/lng
      const latOffset = (distance * Math.cos(angle)) / 111320; // meters to degrees
      const lngOffset =
        (distance * Math.sin(angle)) /
        (111320 * Math.cos((centerLat * Math.PI) / 180));

      const chestLat = centerLat + latOffset;
      const chestLng = centerLng + lngOffset;

      // Select chest type based on weights
      const random = Math.random();
      let selectedType = "common";
      let cumulativeWeight = 0;

      for (let j = 0; j < chestTypes.length; j++) {
        cumulativeWeight += typeWeights[j];
        if (random <= cumulativeWeight) {
          selectedType = chestTypes[j];
          break;
        }
      }

      // Generate chest value based on type
      let value: number;
      switch (selectedType) {
        case "epic":
          value = Math.floor(Math.random() * 500) + 1000; // 1000-1500
          break;
        case "rare":
          value = Math.floor(Math.random() * 200) + 300; // 300-500
          break;
        default:
          value = Math.floor(Math.random() * 100) + 50; // 50-150
      }

      const chest: NearbyChest = {
        id: `generated_${Date.now()}_${i}`,
        location: { lat: chestLat, lng: chestLng },
        metadata: {
          type: selectedType,
          value,
          model: "chest.glb",
        },
        distance: this.calculateDistance(
          centerLat,
          centerLng,
          chestLat,
          chestLng
        ),
        isCollected: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        collections: [],
      };

      chests.push(chest);
    }

    return chests;
  }

  // Create a demo chest very close to the user for testing
  private createDemoChest(userLat: number, userLng: number): NearbyChest {
    // Place chest 20 meters away from user
    const distance = 20; // 20 meters
    const angle = Math.PI / 4; // 45 degrees (northeast direction)

    // Convert polar coordinates to lat/lng
    const latOffset = (distance * Math.cos(angle)) / 111320; // meters to degrees
    const lngOffset =
      (distance * Math.sin(angle)) /
      (111320 * Math.cos((userLat * Math.PI) / 180));

    const chestLat = userLat + latOffset;
    const chestLng = userLng + lngOffset;

    return {
      id: `demo_${Date.now()}`,
      location: { lat: chestLat, lng: chestLng },
      metadata: {
        type: "epic", // Make it epic for demo
        value: 1500,
        model: "chest.glb",
      },
      distance: this.calculateDistance(userLat, userLng, chestLat, chestLng),
      isCollected: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      collections: [],
    };
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
