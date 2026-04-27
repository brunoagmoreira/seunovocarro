// Tracking utilities for GA4 and Meta Pixel

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

interface VehicleInfo {
  vehicleId: string;
  vehicleName: string;
  value?: number;
  currency?: string;
}

/**
 * Send a generic event to GA4
 */
export function trackGA4Event(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/**
 * Send a generic event to Meta Pixel
 */
export function trackMetaEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
}

/**
 * Send a custom event to Meta Pixel
 */
export function trackMetaCustomEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }
}

/**
 * Track a lead generation event (GA4 + Meta Pixel)
 * Use when: WhatsApp contact, chat started, proposal sent
 */
export function trackLead(source: 'whatsapp' | 'chat' | 'proposal', vehicleInfo: VehicleInfo) {
  const { vehicleId, vehicleName, value, currency = 'BRL' } = vehicleInfo;

  // GA4: generate_lead event
  trackGA4Event('generate_lead', {
    source,
    content_id: vehicleId,
    content_name: vehicleName,
    value,
    currency,
  });

  // Meta Pixel: Lead event
  trackMetaEvent('Lead', {
    content_ids: [vehicleId],
    content_name: vehicleName,
    content_type: 'vehicle',
    value,
    currency,
  });
}

/**
 * Track when user views a vehicle detail page (GA4 + Meta Pixel)
 */
export function trackViewContent(vehicleInfo: VehicleInfo) {
  const { vehicleId, vehicleName, value, currency = 'BRL' } = vehicleInfo;

  // GA4: view_item event
  trackGA4Event('view_item', {
    items: [
      {
        item_id: vehicleId,
        item_name: vehicleName,
        price: value,
      },
    ],
    value,
    currency,
  });

  // Meta Pixel: ViewContent event
  trackMetaEvent('ViewContent', {
    content_ids: [vehicleId],
    content_name: vehicleName,
    content_type: 'vehicle',
    value,
    currency,
  });

  // Meta Pixel: custom event requested by business
  trackMetaCustomEvent('ViewVeiculo', {
    content_ids: [vehicleId],
    content_name: vehicleName,
    content_type: 'vehicle',
    value,
    currency,
  });
}

/**
 * Track when user adds a vehicle to favorites (GA4 + Meta Pixel)
 */
export function trackAddToFavorites(vehicleInfo: VehicleInfo) {
  const { vehicleId, vehicleName, value, currency = 'BRL' } = vehicleInfo;

  // GA4: add_to_wishlist event
  trackGA4Event('add_to_wishlist', {
    items: [
      {
        item_id: vehicleId,
        item_name: vehicleName,
        price: value,
      },
    ],
    value,
    currency,
  });

  // Meta Pixel: AddToWishlist event
  trackMetaEvent('AddToWishlist', {
    content_ids: [vehicleId],
    content_name: vehicleName,
    content_type: 'vehicle',
    value,
    currency,
  });
}

/**
 * Track when user initiates contact (GA4 + Meta Pixel)
 */
export function trackContact(method: 'whatsapp' | 'chat' | 'phone', vehicleInfo: VehicleInfo) {
  const { vehicleId, vehicleName } = vehicleInfo;

  // GA4: contact event
  trackGA4Event('contact', {
    method,
    content_id: vehicleId,
    content_name: vehicleName,
  });

  // Meta Pixel: Contact event
  trackMetaEvent('Contact', {
    content_ids: [vehicleId],
    content_name: vehicleName,
    content_type: 'vehicle',
  });

  if (method === 'whatsapp') {
    // Meta Pixel: custom event requested by business
    trackMetaCustomEvent('CliqueBTWpp', {
      content_ids: [vehicleId],
      content_name: vehicleName,
      content_type: 'vehicle',
    });
  }
}

/**
 * Track landing page view custom event
 */
export function trackLandingPageView() {
  trackMetaCustomEvent('viewLP');
}

/**
 * Track when a user signs up for the first time (GA4 + Meta Pixel)
 */
export function trackSignUp(method: 'email' = 'email', userType?: 'user' | 'editor') {
  // GA4: sign_up event
  trackGA4Event('sign_up', {
    method,
    user_type: userType || 'user',
  });

  // Meta Pixel: CompleteRegistration event
  trackMetaEvent('CompleteRegistration', {
    status: 'success',
    content_name: userType === 'editor' ? 'seller_registration' : 'buyer_registration',
  });
}
