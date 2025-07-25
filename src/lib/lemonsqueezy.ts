// Simple Lemon Squeezy integration without SDK dependencies

// Store checkout URLs
export const lemonsqueezy = {
  // Checkout URLs for each plan
  checkoutUrls: {
    basic: import.meta.env.VITE_LEMON_BASIC_URL || 'https://checkout.lemonsqueezy.com/buy/basic-variant',
    pro: import.meta.env.VITE_LEMON_PRO_URL || 'https://checkout.lemonsqueezy.com/buy/pro-variant'
  },

  // Get checkout URL with user data
  getCheckoutUrl: (plan: 'basic' | 'pro', userId: string): string => {
    const baseUrl = lemonsqueezy.checkoutUrls[plan];

    // Add user ID as custom data
    const url = new URL(baseUrl);
    url.searchParams.append('checkout[custom][user_id]', userId);
    url.searchParams.append('checkout[custom][plan]', plan);

    return url.toString();
  }
};

// Types for webhook events
export interface LemonSqueezyEvent {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
      plan?: 'basic' | 'pro';
    };
  };
  data: {
    attributes: {
      status: string;
      renews_at?: string;
      variant_name?: string;
    };
  };
}

// Process webhook events
export const handleSubscriptionEvent = (event: LemonSqueezyEvent) => {
  try {
    // Handle different subscription events
    switch (event.meta.event_name) {
      case 'subscription_created':
        // New subscription created
        return {
          userId: event.meta.custom_data?.user_id,
          plan: event.meta.custom_data?.plan || 'basic',
          status: 'active'
        };

      case 'subscription_updated':
        // Subscription updated
        return {
          userId: event.meta.custom_data?.user_id,
          plan: event.meta.custom_data?.plan || 'basic',
          status: event.data.attributes.status
        };

      case 'subscription_cancelled':
        // Subscription cancelled
        return {
          userId: event.meta.custom_data?.user_id,
          plan: 'free',
          status: 'cancelled'
        };

      default:
        return null;
    }
  } catch (error) {
    console.error('Error processing Lemon Squeezy event:', error);
    return null;
  }
};
