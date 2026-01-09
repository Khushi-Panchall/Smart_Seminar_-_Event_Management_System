import { useState, useEffect } from "react";
import { useAuthStore } from "@/hooks/use-auth";
import { useVerifyTicket } from "@/hooks/use-registrations";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Scan, CheckCircle, XCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function GuardDashboard() {
    const { user, college } = useAuthStore();
    const { mutate: verify, isPending } = useVerifyTicket();
    const { toast } = useToast();
    const [scanResult, setScanResult] = useState({ status: null, message: '' });
    const [scannerError, setScannerError] = useState(null);

    useEffect(() => {
        // Only init scanner if no result is currently shown
        if (scanResult.status) return;

        let html5QrCode;
        const startScanner = async () => {
            try {
                // Use a small timeout to ensure DOM is ready
                await new Promise(r => setTimeout(r, 100));
                
                html5QrCode = new Html5Qrcode("reader");
                
                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText) => {
                        // Stop scanning temporarily while verifying
                        html5QrCode.pause();
                        handleVerify(decodedText, html5QrCode);
                    },
                    (errorMessage) => {
                        // ignore frame parse errors
                    }
                );
            } catch (err) {
                console.error("Error starting scanner:", err);
                setScannerError("Camera permission denied or camera not available.");
            }
        };

        startScanner();

        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(console.error);
                html5QrCode.clear();
            }
        };
    }, [scanResult.status]);

    const handleVerify = (uniqueId, scannerInstance) => {
        verify(uniqueId, {
            onSuccess: (data) => {
                // Stop scanner completely on success to show result
                if (scannerInstance) {
                    scannerInstance.stop().then(() => scannerInstance.clear()).catch(console.error);
                }
                setScanResult({
                    status: 'success',
                    message: 'Valid Ticket',
                    details: data.registration
                });
                toast({ title: "Verified", description: "Access Granted", className: "bg-green-500 text-white" });
            },
            onError: (err) => {
                // Stop scanner completely on error to show result
                if (scannerInstance) {
                    scannerInstance.stop().then(() => scannerInstance.clear()).catch(console.error);
                }
                setScanResult({
                    status: 'error',
                    message: err.message || "Invalid Ticket"
                });
                toast({ title: "Access Denied", description: err.message, variant: "destructive" });
            }
        });
    };
    const resetScanner = () => {
        setScanResult({ status: null, message: '' });
    };
    if (!user || !college)
        return <div>Access Denied</div>;
    return (<div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="max-w-md mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-display">Ticket Scanner</h1>
          <p className="text-muted-foreground">Scan attendee QR codes for entry</p>
        </div>

        <Card className="overflow-hidden border-2 border-slate-200">
          <CardContent className="p-0 min-h-[500px] flex flex-col bg-black relative">
            {scanResult.status === null ? (
              <div className="relative flex-1 w-full h-full flex flex-col">
                {scannerError ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-white p-6 text-center">
                     <XCircle className="w-12 h-12 text-red-500 mb-4"/>
                     <p className="text-lg font-medium text-red-400 mb-2">Camera Access Error</p>
                     <p className="text-sm text-slate-400 max-w-xs mx-auto">{scannerError}</p>
                     <Button 
                       variant="outline" 
                       className="mt-6 bg-white/10 text-white hover:bg-white/20 border-white/20"
                       onClick={() => window.location.reload()}
                     >
                       Retry Camera
                     </Button>
                  </div>
                ) : (
                  <>
                    <div id="reader" className="w-full h-full overflow-hidden [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />
                    
                    {/* Scanner Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 overflow-hidden">
                        
                        {/* Scanning Frame with dark backdrop via shadow */}
                        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                            {/* Corners */}
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-lg shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-lg shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-lg shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-lg shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            
                            {/* Scanning Line Animation */}
                            <div className="absolute w-full h-1 bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-scanner-line opacity-80"></div>
                        </div>

                        <p className="mt-12 text-white/90 font-medium text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 z-20">
                          Align QR code within the frame
                        </p>
                    </div>
                    
                    <style>{`
                      @keyframes scanner-line {
                        0% { top: 0; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 100%; opacity: 0; }
                      }
                      .animate-scanner-line {
                        animation: scanner-line 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                      }
                    `}</style>
                  </>
                )}
              </div>
            ) : (<div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 bg-slate-50">
                 {scanResult.status === 'success' ? (<>
                     <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                       <CheckCircle className="w-12 h-12"/>
                     </div>
                     <div className="text-center">
                       <h2 className="text-2xl font-bold text-green-700">Access Granted</h2>
                       <p className="text-lg font-medium mt-2">{scanResult.details?.studentName}</p>
                       <p className="text-muted-foreground">
                         Seat: Row {scanResult.details?.seatRow} - {scanResult.details?.seatCol}
                       </p>
                     </div>
                   </>) : (<>
                     <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                       <XCircle className="w-12 h-12"/>
                     </div>
                     <div className="text-center">
                       <h2 className="text-2xl font-bold text-red-700">Access Denied</h2>
                       <p className="text-lg font-medium mt-2">{scanResult.message}</p>
                     </div>
                   </>)}
                 
                 <Button size="lg" onClick={resetScanner} className="w-full">
                   <Scan className="w-4 h-4 mr-2"/> Scan Next
                 </Button>
               </div>)}
            
            {isPending && (<div className="absolute inset-0 bg-white/80 backdrop-blur flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary"/>
              </div>)}
          </CardContent>
        </Card>
      </main>
    </div>);
}
