import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { BitrefillClient } from '@/lib/bitrefill'

const bitrefill = new BitrefillClient({
  clientId: process.env.BITREFILL_CLIENT_ID!,
  clientSecret: process.env.BITREFILL_CLIENT_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-bitrefill-signature')
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // TODO: Verify webhook signature when Bitrefill provides documentation

    const payload = await request.json()
    const { orderId, status, giftCard } = payload

    // Verify order exists
    const order = await bitrefill.checkOrderStatus(orderId)
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Handle different status updates
    switch (status) {
      case 'success':
        // TODO: Store gift card details in database
        // TODO: Send email to user with gift card code
        console.log('Gift card issued:', giftCard)
        break

      case 'error':
        // TODO: Handle failed orders
        // TODO: Notify user of failure
        console.error('Order failed:', orderId)
        break

      case 'expired':
        // TODO: Handle expired orders
        // TODO: Return rewards to user's pending balance
        console.error('Order expired:', orderId)
        break

      default:
        console.log('Unhandled order status:', status)
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 