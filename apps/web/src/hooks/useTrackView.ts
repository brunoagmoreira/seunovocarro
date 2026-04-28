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
    
    // Prevent duplicate tracking in the same mounted page
    if (trackedRef.current.has(vehicleId)) return;

    const sessionKey = `snc_view_tracked_${vehicleId}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey) === '1') {
      trackedRef.current.add(vehicleId);
      return;
    }
    
    const trackView = async () => {
      try {
        const utmParams = getStoredUTM();
        const sessionId =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('snc_session_id') || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
            : null;
        if (typeof window !== 'undefined' && sessionId) {
          sessionStorage.setItem('snc_session_id', sessionId);
          sessionStorage.setItem(sessionKey, '1');
        }
        
        await fetchApi(`/vehicles/${vehicleId}/track-view`, {
          method: 'POST',
          body: {
            viewer_id: user?.id || null,
            session_id: sessionId,
            utm_source: utmParams.utm_source || null,
            utm_medium: utmParams.utm_medium || null,
            utm_campaign: utmParams.utm_campaign || null,
            utm_term: utmParams.utm_term || null,
            utm_content: utmParams.utm_content || null,
            referrer: utmParams.referrer || (typeof document !== 'undefined' ? document.referrer : null),
          },
        });
        
        trackedRef.current.add(vehicleId);
      } catch (error) {
        console.error('Error tracking view:', error);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(sessionKey);
        }
      }
    };

    void trackView();
  }, [vehicleId, user?.id]);
}
