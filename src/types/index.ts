// Farcaster types
export interface FarcasterUser {
  fid: number;
  username: string;
  displayName?: string;
  pfp?: string;
}

// Chest types
export interface Chest {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  metadata: {
    type: string;
    value: number;
    model: string;
  };
  collectedBy?: string;
  collectedAt?: Date;
}

// Collection types
export interface Collection {
  id: string;
  chestId: string;
  userId: number; // Farcaster FID
  status: 'pending' | 'redeemed';
  createdAt: Date;
  redeemedAt?: Date;
}

// Bitrefill types
export interface BitrefillReward {
  orderId: string;
  giftCardCode: string;
  value: number;
  currency: string;
  expiresAt: Date;
} 