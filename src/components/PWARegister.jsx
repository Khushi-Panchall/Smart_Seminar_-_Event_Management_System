import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Register service worker immediately to avoid waiting for load event in SPA if already loaded
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  }, []);

  return null;
}
