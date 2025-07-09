const BITREFILL_API_BASE = 'https://api.bitrefill.com/v1'

export interface BitrefillConfig {
  clientId: string
  clientSecret: string
}

export interface OrderPayment {
  address: string
  lightningInvoice?: string
  satoshiPrice: number
  altcoinCode: string
}

export interface OrderResponse {
  id: string
  email: string
  expired: boolean
  value: string
  product: string
  price: number
  partialPayment: boolean
  userRef: string | null
  status: 'unpaid' | 'paid' | 'success' | 'error'
  payment?: OrderPayment
}

export interface GiftCardOrder {
  amount: number
  currency: string
  email: string
  productId: string
  refundEmail?: string
  webhookUrl?: string
}

export class BitrefillClient {
  private config: BitrefillConfig

  constructor(config: BitrefillConfig) {
    this.config = config
  }

  private getAuthHeader() {
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')
    return `Basic ${credentials}`
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${BITREFILL_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`Bitrefill API error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  // Get available gift cards
  async getInventory() {
    return this.makeRequest('/inventory/gift-cards')
  }

  // Create a gift card order
  async createGiftCardOrder(order: GiftCardOrder): Promise<OrderResponse> {
    return this.makeRequest('/order', {
      method: 'POST',
      body: JSON.stringify(order),
    })
  }

  // Check order status
  async checkOrderStatus(orderId: string): Promise<OrderResponse> {
    return this.makeRequest(`/order/${orderId}`)
  }

  // Purchase with account balance
  async purchaseWithBalance(orderId: string) {
    return this.makeRequest(`/purchase/${orderId}`, {
      method: 'POST',
    })
  }

  // Get account balance
  async getAccountBalance() {
    return this.makeRequest('/account/balance')
  }

  // Get order history
  async getOrderHistory() {
    return this.makeRequest('/orders')
  }
} 