import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { fid } = await request.json()

    if (!fid) {
      return NextResponse.json(
        { error: 'Missing fid parameter' },
        { status: 400 }
      )
    }

    // TODO: Implement actual chest collection logic with database
    // For now, return mock success response
    return NextResponse.json({
      id: crypto.randomUUID(),
      chestId: id,
      userId: fid,
      status: 'pending',
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error collecting chest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 