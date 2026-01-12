import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useSeminarBySlug } from "@/hooks/use-seminars";
import { useRegistrations, useCreateRegistration } from "@/hooks/use-registrations";
import { SeatingGrid, getRowLabel } from "@/components/SeatingGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { sendRegistrationEmail } from "@/lib/email";

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
                
                // Send Email
                const formattedDate = new Date(seminar.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const seatLabel = `${getRowLabel(selectedSeat.row)}-${selectedSeat.col}`;

                const result = await sendRegistrationEmail({
                    student_name: studentData.studentName,
                    student_email: studentData.email,
                    phone_number: studentData.phone,
                    seminar_name: seminar.title,
                    seminar_date: formattedDate,
                    hall_name: seminar.venue,
                    seat_number: seatLabel,
                    ticket_id: data.uniqueId
                });

                if (result.success) {
                    toast({ title: "Registration Successful", description: `Ticket sent to ${studentData.email}` });
                } else {
                    const isConfigError = result.error === "Missing configuration" || result.error === "Invalid configuration (placeholders)";
                    const errorMsg = isConfigError
                        ? "System Error: Email credentials missing or invalid. Check .env file."
                        : "Seat booked, but email delivery failed. Please contact support.";
                    
                    toast({ 
                        title: "Seat Booked", 
                        description: errorMsg, 
                        variant: isConfigError ? "destructive" : "default"
                    });
                }

                setStep("success");
                
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
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : "Register & Book"}
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
                <p className="text-green-600 text-sm">A confirmation email with your ticket and QR code has been sent to <b>{studentData.email}</b>.</p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Please present the QR code in your email at the venue entrance.
              </p>

              <Button variant="outline" asChild className="mt-4">
                 <a href="/">Return to Home</a>
              </Button>
            </CardContent>
          </Card>)}
      </div>
    </div>);
}
