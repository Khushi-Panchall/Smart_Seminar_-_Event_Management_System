import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useSeminarBySlug } from "@/hooks/use-seminars";
import { useRegistrations, useCreateRegistration } from "@/hooks/use-registrations";
import { SeatingGrid, getRowLabel } from "@/components/SeatingGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, CheckCircle, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

export default function SeatSelectionPage() {
    const [match, params] = useRoute("/:slug/seats");
    const slug = params?.slug || "";
    const { data: seminar, isLoading: seminarLoading } = useSeminarBySlug(slug);
    // We need seminar ID for registrations, but we only have slug initially.
    // The hook handles fetching by slug. Once we have seminar, we can fetch registrations.
    const { data: registrations, isLoading: regsLoading } = useRegistrations(seminar?.id || 0);
    const { mutate: register, isPending } = useCreateRegistration();
    const { toast } = useToast();
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [ticketData, setTicketData] = useState(null);
    const [step, setStep] = useState("seat");
    const [studentData, setStudentData] = useState(null);
    useEffect(() => {
        const savedData = localStorage.getItem(`registration_${slug}`);
        if (savedData) {
            setStudentData(JSON.parse(savedData));
        }
        else {
            // Redirect back if no data? Or allow empty?
            // For now, let's assume they might need to go back.
        }
    }, [slug]);
    const handleSeatSelect = (row, col) => {
        setSelectedSeat({ row, col });
    };
    const handleRegister = () => {
        if (!selectedSeat || !seminar || !studentData) {
            toast({ title: "Error", description: "Missing information. Please restart registration.", variant: "destructive" });
            return;
        }
        register({
            seminarId: seminar.id,
            seatRow: selectedSeat.row,
            seatCol: selectedSeat.col,
            studentName: studentData.studentName,
            email: studentData.email,
            phone: studentData.phone,
            collegeName: studentData.collegeName,
            course: studentData.course,
            semester: studentData.semester,
        }, {
            onSuccess: async (data) => {
                setTicketData(data);
                setStep("success");
                toast({ title: "Registration Successful", description: "Your seat has been booked!" });

                // Send Email with Ticket
                try {
                    const formattedDate = new Date(seminar.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    const seatLabel = `${getRowLabel(selectedSeat.row)}-${selectedSeat.col}`;
                    
                    // Non-blocking fetch (fire and forget-ish, but we catch errors)
                    fetch('/api/send-ticket', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            studentName: studentData.studentName,
                            email: studentData.email,
                            seminarName: seminar.title,
                            date: formattedDate,
                            time: seminar.time,
                            venue: seminar.venue,
                            seatNumber: seatLabel,
                            ticketId: data.uniqueId,
                            collegeName: studentData.collegeName
                        })
                    }).then(res => {
                        if (!res.ok) throw new Error('Email API failed');
                        toast({ title: "Email Sent", description: `Ticket sent to ${studentData.email}` });
                    }).catch(err => {
                        console.error("Failed to send email:", err);
                        // We silently fail or log, as registration is already successful
                    });

                } catch (e) {
                    console.error("Email logic error:", e);
                }

                // Clear temp data
                localStorage.removeItem(`registration_${slug}`);
            },
            onError: (err) => {
                toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
                if (err.message.includes("taken")) {
                    window.location.reload();
                }
            }
        });
    };
    const downloadTicket = async () => {
        if (!ticketData || !seminar || !studentData) return;

        const doc = new jsPDF();
        const qrUrl = await QRCode.toDataURL(ticketData.uniqueId, { width: 200, margin: 1 });
        
        // Brand Colors
        const primaryColor = [30, 58, 138]; // Blue-900
        
        // Load Logo (Try to load, fallback if fails)
        let logoImg = null;
        try {
            logoImg = await loadImage('/logo-full.png');
        } catch (e) {
            console.error("Logo load failed", e);
        }

        // --- PDF Generation ---
        
        // Header Background
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, 210, 40, 'F');
        
        // Logo
        if (logoImg) {
             doc.addImage(logoImg, 'PNG', 15, 10, 40, 0); // width 40, auto height
        } else {
             doc.setTextColor(255, 255, 255);
             doc.setFontSize(20);
             doc.setFont("helvetica", "bold");
             doc.text("SSEMS", 20, 28);
        }

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Event Ticket", 190, 26, { align: "right" });

        // Event Name (Large)
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(seminar.title, 105, 60, { align: "center", maxWidth: 180 });

        // Separator
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 70, 190, 70);

        // Details Grid
        doc.setFontSize(12);
        
        const startY = 85;
        const col1X = 25;
        const col2X = 110;

        // Label Helper
        const addField = (label, value, x, y) => {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(100, 100, 100);
            doc.text(label, x, y);
            
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            doc.text(String(value), x, y + 6);
        };

        addField("Attendee Name", studentData.studentName, col1X, startY);
        addField("Seat Number", `${getRowLabel(selectedSeat?.row)}-${selectedSeat?.col}`, col2X, startY);

        addField("Date", new Date(seminar.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), col1X, startY + 20);
        addField("Time", seminar.time, col2X, startY + 20);

        addField("Venue", seminar.venue, col1X, startY + 40);
        if (studentData.collegeName) {
            addField("Institution", studentData.collegeName, col2X, startY + 40);
        }

        addField("Ticket ID", ticketData.uniqueId, col1X, startY + 60);

        // QR Code Box
        const qrY = startY + 80;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(65, qrY, 80, 90, 3, 3, 'F');
        
        doc.addImage(qrUrl, 'PNG', 75, qrY + 5, 60, 60);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Scan this QR code at the entrance", 105, qrY + 75, { align: "center" });

        // Footer
        const footerY = 280;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 105, footerY, { align: "center" });
        doc.text("Smart Seminar & Event Management System", 105, footerY + 5, { align: "center" });

        doc.save(`Ticket-${studentData.studentName.replace(/\s+/g, '_')}.pdf`);
    };
    if (seminarLoading || (seminar && regsLoading)) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin"/></div>;
    }
    if (!seminar)
        return <div>Seminar not found</div>;
    if (!studentData && step !== "success") {
        return (<div className="min-h-screen flex items-center justify-center flex-col gap-4">
              <p>No registration data found. Please start from the beginning.</p>
              <Button asChild><a href={`/${slug}/register`}>Go to Registration</a></Button>
          </div>);
    }
    return (<div className="min-h-screen bg-slate-50 py-6 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-display font-bold">{seminar.title}</h1>
          <p className="text-muted-foreground">Select your preferred seat to complete registration</p>
        </div>

        {step === "seat" && (<Card className="shadow-xl border-primary/10">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span>Select Seat</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {selectedSeat ? `${getRowLabel(selectedSeat.row)}${selectedSeat.col} (Row ${getRowLabel(selectedSeat.row)}, Seat ${selectedSeat.col})` : 'Select a seat'}
                  </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
               <SeatingGrid
                 rows={seminar.rows}
                 cols={seminar.cols}
                 rowConfig={seminar.rowConfig}
                 registrations={registrations || []}
                 selectedSeat={selectedSeat}
                 onSelectSeat={handleSeatSelect}
               />
            </CardContent>
            <CardFooter className="flex flex-col-reverse sm:flex-row justify-between gap-4 sm:gap-0">
                <Button variant="ghost" asChild className="w-full sm:w-auto">
                    <a href={`/${slug}/register`}><ArrowLeft className="w-4 h-4 mr-2"/> Back to Details</a>
                </Button>
                <Button onClick={handleRegister} disabled={!selectedSeat || isPending} className="w-full sm:w-auto">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : "Register & Download Ticket"}
                </Button>
            </CardFooter>
          </Card>)}

        {step === "success" && (<Card className="shadow-xl border-green-200 bg-green-50/50 animate-in zoom-in-95">
            <CardContent className="pt-8 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle className="w-8 h-8"/>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-green-800">Registration Confirmed!</h2>
                <p className="text-green-700">Your seat has been successfully reserved.</p>
              </div>
              
              <Button size="lg" onClick={downloadTicket} className="bg-green-600 hover:bg-green-700">
                <Download className="w-5 h-5 mr-2"/>
                Download Ticket
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Please save your ticket and present the QR code at the venue.
              </p>
            </CardContent>
          </Card>)}
      </div>
    </div>);
}
