import React from "react";
import { Button } from "@/components/ui/button";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <div className="bg-muted p-6 rounded-full mb-6">
        <WifiOff className="w-12 h-12 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">You are offline</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        It seems you've lost your internet connection. Please check your network and try again.
      </p>
      <Button onClick={() => window.location.reload()}>
        Retry Connection
      </Button>
    </div>
  );
}
