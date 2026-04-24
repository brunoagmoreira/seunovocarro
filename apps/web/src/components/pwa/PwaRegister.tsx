"use client";

import { useEffect } from "react";

/**
 * Registra o service worker em produção (evita cache agressivo no `next dev`).
 * Para testar localmente: `next build && next start` ou `NEXT_PUBLIC_PWA_DEV=1 next dev`.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const allowDev =
      process.env.NODE_ENV === "development" &&
      process.env.NEXT_PUBLIC_PWA_DEV === "1";

    if (process.env.NODE_ENV !== "production" && !allowDev) return;

    const register = () => {
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          reg.addEventListener("updatefound", () => {
            const next = reg.installing;
            if (!next) return;
            next.addEventListener("statechange", () => {
              if (next.state === "installed" && navigator.serviceWorker.controller) {
                window.dispatchEvent(new CustomEvent("snc-sw-updated"));
              }
            });
          });
        })
        .catch(() => {});
    };

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
