import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// TODO: Replace with actual database query
const MOCK_CHESTS = [
  {
    id: '1',
    location: {
      lat: 40.7128,
      lng: -74.0060
    },
    metadata: {
      type: 'common',
      value: 5,
      model: 'wooden_chest'
    }
  },
  {
    id: '2',
    location: {
      lat: 40.7580,
      lng: -73.9855
    },
    metadata: {
      type: 'rare',
      value: 10,
      model: 'golden_chest'
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing lat/lon parameters' },
        { status: 400 }
      )
    }

    // TODO: Implement actual nearby chest search using PostGIS
    // For now, return mock data
    return NextResponse.json(MOCK_CHESTS)
  } catch (error) {
    console.error('Error fetching nearby chests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 