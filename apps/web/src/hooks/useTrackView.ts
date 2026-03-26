import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getStoredUTM } from '@/hooks/useUTM';
import { fetchApi } from '@/lib/api';

/**
 * Hook to track vehicle page views
 * Records a view only once per session per vehicle
 * Also increments the view_count on the vehicle via NestJS
 * Captures UTM parameters from the session
 */
export function useTrackView(vehicleId: string | undefined) {
  const { user } = useAuth();
  const trackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!vehicleId) return;
    
    // Prevent duplicate tracking in the same session
    if (trackedRef.current.has(vehicleId)) return;
    
    const trackView = async () => {
      try {
        const utmParams = getStoredUTM();
        
        await fetchApi(`/vehicles/${vehicleId}/track-view`, {
          method: 'POST',
          body: JSON.stringify({
            viewer_id: user?.id || null,
            utm_source: utmParams.utm_source || null,
            utm_medium: utmParams.utm_medium || null,
            utm_campaign: utmParams.utm_campaign || null,
            utm_term: utmParams.utm_term || null,
            utm_content: utmParams.utm_content || null,
            referrer: utmParams.referrer || null,
          })
        });
        
        trackedRef.current.add(vehicleId);
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    const timer = setTimeout(trackView, 1000);
    return () => clearTimeout(timer);
  }, [vehicleId, user?.id]);
}
