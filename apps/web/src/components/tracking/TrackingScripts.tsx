import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

/**
 * Component that injects tracking scripts (GTM, GA, Meta Pixel) into the page
 * based on site settings from the database
 */
export function TrackingScripts() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    // Google Tag Manager
    if (settings.gtm_id) {
      // GTM Head script
      const gtmScript = document.createElement('script');
      gtmScript.id = 'gtm-script';
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${settings.gtm_id}');
      `;
      
      if (!document.getElementById('gtm-script')) {
        document.head.appendChild(gtmScript);
      }

      // GTM Body noscript
      const gtmNoscript = document.createElement('noscript');
      gtmNoscript.id = 'gtm-noscript';
      gtmNoscript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=${settings.gtm_id}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `;
      
      if (!document.getElementById('gtm-noscript')) {
        document.body.insertBefore(gtmNoscript, document.body.firstChild);
      }
    }

    // Google Analytics (gtag.js)
    if (settings.ga_id) {
      const gaScript = document.createElement('script');
      gaScript.id = 'ga-script';
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.ga_id}`;
      
      if (!document.getElementById('ga-script')) {
        document.head.appendChild(gaScript);
      }

      const gaConfigScript = document.createElement('script');
      gaConfigScript.id = 'ga-config-script';
      gaConfigScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.ga_id}');
      `;
      
      if (!document.getElementById('ga-config-script')) {
        document.head.appendChild(gaConfigScript);
      }
    }

    // Meta Pixel
    if (settings.meta_pixel_id) {
      const metaScript = document.createElement('script');
      metaScript.id = 'meta-pixel-script';
      metaScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.meta_pixel_id}');
        fbq('track', 'PageView');
      `;
      
      if (!document.getElementById('meta-pixel-script')) {
        document.head.appendChild(metaScript);
      }

      const metaNoscript = document.createElement('noscript');
      metaNoscript.id = 'meta-pixel-noscript';
      metaNoscript.innerHTML = `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${settings.meta_pixel_id}&ev=PageView&noscript=1"/>
      `;
      
      if (!document.getElementById('meta-pixel-noscript')) {
        document.head.appendChild(metaNoscript);
      }
    }

    // Cleanup function
    return () => {
      ['gtm-script', 'gtm-noscript', 'ga-script', 'ga-config-script', 'meta-pixel-script', 'meta-pixel-noscript'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, [settings]);

  return null;
}
