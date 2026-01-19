import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    // Client-side only check
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      
      // 1. Cleanup: Unregister ALL existing service workers to fix the "White Screen"
      // caused by previous broken configurations.
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        const unregisterPromises = registrations.map((registration) => {
          console.log("Unregistering old SW:", registration);
          return registration.unregister();
        });

        // 2. Safe Registration: Once cleanup is done, register the new safe SW
        Promise.all(unregisterPromises).then(() => {
          // Small delay to ensure browser cleans up
          setTimeout(() => {
            navigator.serviceWorker
              .register("/sw.js")
              .then((registration) => {
                console.log("Safe SW registered:", registration);
                
                // Optional: Check for updates
                registration.onupdatefound = () => {
                  const installingWorker = registration.installing;
                  if (installingWorker == null) {
                    return;
                  }
                  installingWorker.onstatechange = () => {
                    if (installingWorker.state === "installed") {
                      if (navigator.serviceWorker.controller) {
                        console.log("New content is available; please refresh.");
                      } else {
                        console.log("Content is cached for offline use.");
                      }
                    }
                  };
                };
              })
              .catch((error) => {
                console.error("SW registration failed:", error);
              });
          }, 100);
        });
      });
    }
  }, []);

  return null;
}
