import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useSeminarByCollegeAndSlug } from "@/hooks/use-seminars";
import { useRegistrations, useCreateRegistration } from "@/hooks/use-registrations";
import { SeatingGrid, getRowLabel } from "@/components/SeatingGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function SeatSelectionPage() {
    const [match, params] = useRoute("/:collegeSlug/:seminarSlug/seats");
    const collegeSlug = params?.collegeSlug || "";
    const seminarSlug = params?.seminarSlug || "";
    const { data: seminar, isLoading: seminarLoading } = useSeminarByCollegeAndSlug(collegeSlug, seminarSlug);
    // Once we have seminar, fetch registrations scoped to its college
    const { data: registrations, isLoading: regsLoading } = useRegistrations(seminar?.collegeId || 0, seminar?.id || 0);
    const { mutate: register, isPending } = useCreateRegistration();
    const { toast } = useToast();
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [ticketData, setTicketData] = useState(null);
    const [step, setStep] = useState("seat");
    const [studentData, setStudentData] = useState(null);
    const [, setLocation] = useLocation();

    useEffect(() => {
        const savedData = localStorage.getItem(`registration_${collegeSlug}_${seminarSlug}`);
        if (savedData) {
            setStudentData(JSON.parse(savedData));
        }
        else {
            setLocation(`/${collegeSlug}/${seminarSlug}/register`);
        }
    }, [collegeSlug, seminarSlug, setLocation]);

    const handleSeatSelect = (row, col) => {
        setSelectedSeat({ row, col });
    };

    const handleRegister = () => {
        if (!selectedSeat || !seminar || !studentData) {
            toast({ title: "Error", description: "Missing information. Please restart registration.", variant: "destructive" });
            return;
        }

        register({
            collegeId: seminar.collegeId,
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
                localStorage.removeItem(`registration_${collegeSlug}_${seminarSlug}`);
                
                // Send Email via Backend API
                const formattedDate = new Date(seminar.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const seatLabel = `${getRowLabel(selectedSeat.row)}-${selectedSeat.col}`;

                fetch('/api/send-ticket', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        student_name: studentData.studentName,
                        student_email: studentData.email,
                        seminar_name: seminar.title,
                        seminar_date: formattedDate,
                        hall_name: seminar.venue,
                        seat_number: seatLabel,
                        ticket_id: data.uniqueId
                    })
                })
                .then(res => res.json())
                .then(result => {
                    if (result.success) {
                        toast({ 
                            title: "Registration Successful", 
                            description: "Ticket downloaded. Confirmation email with PDF sent!" 
                        });
                    } else {
                        console.error("Email failed:", result.message);
                        toast({ 
                            title: "Registration Successful", 
                            description: "Ticket downloaded. Email delivery failed, please check spam or contact support.",
                            variant: "default" // Not destructive because registration succeeded
                        });
                    }
                })
                .catch(err => {
                    console.error("Email API error:", err);
                    toast({ 
                        title: "Registration Successful", 
                        description: "Ticket downloaded. Email system is temporarily unavailable.",
                        variant: "default" 
                    });
                });

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
              <Button asChild><a href={`/${collegeSlug}/${seminarSlug}/register`}>Go to Registration</a></Button>
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
                    <a href={`/${collegeSlug}/${seminarSlug}/register`}><ArrowLeft className="w-4 h-4 mr-2"/> Back to Details</a>
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
