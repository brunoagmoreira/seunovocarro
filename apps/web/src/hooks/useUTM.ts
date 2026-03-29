import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
}

const UTM_STORAGE_KEY = 'kairos_utm_params';

export function useUTM() {
  const searchParams = useSearchParams();
  const [utmParams, setUtmParams] = useState<UTMParams>({
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    referrer: null,
  });

  useEffect(() => {
    // Client-side initialization
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem(UTM_STORAGE_KEY) : null;
    let currentParams = utmParams;

    if (stored) {
      currentParams = JSON.parse(stored);
      setUtmParams(currentParams);
    }

    // Check for UTM params in URL
    const utm_source = searchParams.get('utm_source');
    const utm_medium = searchParams.get('utm_medium');
    const utm_campaign = searchParams.get('utm_campaign');
    const utm_term = searchParams.get('utm_term');
    const utm_content = searchParams.get('utm_content');

    // If any UTM param is present in URL, update storage
    if (utm_source || utm_medium || utm_campaign || utm_term || utm_content) {
      const newParams: UTMParams = {
        utm_source: utm_source || currentParams.utm_source,
        utm_medium: utm_medium || currentParams.utm_medium,
        utm_campaign: utm_campaign || currentParams.utm_campaign,
        utm_term: utm_term || currentParams.utm_term,
        utm_content: utm_content || currentParams.utm_content,
        referrer: (typeof document !== 'undefined' ? document.referrer : null) || currentParams.referrer,
      };
      
      setUtmParams(newParams);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(newParams));
      }
    } else if (!currentParams.referrer && typeof document !== 'undefined' && document.referrer) {
      // Capture referrer if no UTMs but we have a referrer
      const newParams = { ...currentParams, referrer: document.referrer };
      setUtmParams(newParams);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(newParams));
      }
    }
  }, [searchParams]);

  return utmParams;
}

export function getStoredUTM(): UTMParams {
  if (typeof window === 'undefined') {
    return { utm_source: null, utm_medium: null, utm_campaign: null, utm_term: null, utm_content: null, referrer: null };
  }
  const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    referrer: null,
  };
}
