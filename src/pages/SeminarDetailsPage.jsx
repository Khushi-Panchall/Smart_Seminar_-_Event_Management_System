import { useRoute } from "wouter";
import { useSeminarByCollegeAndSlug } from "@/hooks/use-seminars";
import { useAuthStore } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SeminarDetailsPage() {
    const [match, params] = useRoute("/:collegeSlug/:seminarSlug");
    const collegeSlug = params?.collegeSlug || "";
    const seminarSlug = params?.seminarSlug || "";
    const { data: seminar, isLoading } = useSeminarByCollegeAndSlug(collegeSlug, seminarSlug);
    const { user, college } = useAuthStore();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin"/></div>;
    }
    if (!seminar)
        return <div className="min-h-screen flex items-center justify-center">Seminar not found</div>;

    const registerUrl = `${window.location.origin}/${collegeSlug}/${seminarSlug}/register`;
    const registrations = seminar.registrations || [];
    const canViewRegistrations = user && college && user.role === "admin" && college.id === seminar.collegeId;
    
    return (<div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-display font-bold text-slate-900">{seminar.title}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{seminar.description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Details Column */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <Calendar className="w-6 h-6"/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Date & Time</h3>
                    <p className="text-slate-600">{new Date(seminar.date).toLocaleDateString()} at {seminar.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <MapPin className="w-6 h-6"/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Venue</h3>
                    <p className="text-slate-600">{seminar.venue}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <Users className="w-6 h-6"/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Capacity</h3>
                    <p className="text-slate-600">{seminar.rows * seminar.cols} Seats Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About this Seminar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 leading-relaxed">
                  {seminar.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / QR Column */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-center">Register Now</CardTitle>
                <CardDescription className="text-center">Scan to book your seat</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <div className="p-4 bg-white border rounded-xl shadow-sm">
                  <QRCodeSVG value={registerUrl} size={200}/>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Or visit this link:</p>
                  <a href={registerUrl} className="text-sm font-medium text-blue-600 hover:underline break-all">
                    {registerUrl}
                  </a>
                </div>
                <Button className="w-full" asChild>
                  <a href={`/${collegeSlug}/${seminarSlug}/register`}>Register Here</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        {canViewRegistrations && (
          <Card>
            <CardHeader>
              <CardTitle>Registrations</CardTitle>
              <CardDescription>
                {registrations.length} registration{registrations.length === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrations.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-slate-50 z-10">
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Seat</TableHead>
                          <TableHead>Attendance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registrations.map((reg, idx) => {
                          const displayName = reg.name || reg.studentName;
                          const seatLabel = reg.seatId
                            || (reg.seatRow && reg.seatCol
                              ? `${String.fromCharCode(64 + reg.seatRow)}-${reg.seatCol}`
                              : "-");
                          return (
                            <TableRow key={reg.id}>
                              <TableCell>{idx + 1}</TableCell>
                              <TableCell>{displayName}</TableCell>
                              <TableCell>{reg.email}</TableCell>
                              <TableCell>{reg.phone}</TableCell>
                              <TableCell>{seatLabel}</TableCell>
                              <TableCell>{reg.attended ? "Yes" : "No"}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No registrations yet.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>);
}
