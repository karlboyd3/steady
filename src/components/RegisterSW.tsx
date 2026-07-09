"use client";

import { useEffect } from "react";

/** Registers the service worker (production only) for offline/installable PWA. */
export function RegisterSW() {
  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    )
      return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration failed — app still works online */
      });
    };
    // The window `load` event has usually already fired by the time this effect
    // runs (React hydrates after load), so register right away in that case;
    // otherwise wait for load.
    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);
  return null;
}
