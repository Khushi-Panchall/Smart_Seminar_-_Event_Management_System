import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  QrCode, 
  FileCheck, 
  Clock, 
  Cloud, 
  Lock,
  Building2,
  Settings,
  UserCheck
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.svg" alt="SSEMS" className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl">SSEMS</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Register College</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white text-center px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            🚀 Smart Event Management
          </div>
          <div className="flex justify-center mb-8">
            <img src="/logo-full.png" alt="SSEMS - Smart Seminar & Event Management System" className="h-auto max-w-[600px] w-full" />
          </div>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            A Secure, QR-Based Seminar & Event Management Platform for Colleges. Streamline registrations, automate seating, and track attendance in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-lg">
                Login to Dashboard
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="px-8 h-12 text-lg bg-white">
                Register New College
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why SSEMS Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why SSEMS?</h2>
            <p className="text-slate-600">Transforming seminar management from chaos to clarity</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Problem */}
            <div className="p-8 rounded-2xl bg-red-50 border border-red-100">
              <h3 className="text-xl font-bold text-red-600 mb-6">The Problem</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-red-900/80">
                  <span className="text-red-500">•</span>
                  Manual paper-based registration causes long queues
                </li>
                <li className="flex items-start gap-3 text-red-900/80">
                  <span className="text-red-500">•</span>
                  No real-time visibility of seat availability
                </li>
                <li className="flex items-start gap-3 text-red-900/80">
                  <span className="text-red-500">•</span>
                  Attendance tracking is time-consuming and error-prone
                </li>
                <li className="flex items-start gap-3 text-red-900/80">
                  <span className="text-red-500">•</span>
                  Difficult to manage multiple events and halls
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="p-8 rounded-2xl bg-blue-50 border border-blue-100">
              <h3 className="text-xl font-bold text-blue-600 mb-6">The Solution</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-blue-900/80">
                  <div className="mt-1"><ShieldCheck className="w-4 h-4 text-blue-600" /></div>
                  Digital registration with instant confirmation
                </li>
                <li className="flex items-start gap-3 text-blue-900/80">
                  <div className="mt-1"><Users className="w-4 h-4 text-blue-600" /></div>
                  Visual seat selection with live updates
                </li>
                <li className="flex items-start gap-3 text-blue-900/80">
                  <div className="mt-1"><QrCode className="w-4 h-4 text-blue-600" /></div>
                  QR-based instant attendance verification
                </li>
                <li className="flex items-start gap-3 text-blue-900/80">
                  <div className="mt-1"><Calendar className="w-4 h-4 text-blue-600" /></div>
                  Centralized multi-hall, multi-event management
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Powerful Features */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-slate-600">Everything you need to manage seminars and events efficiently</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <FeatureCard 
              icon={<Building2 className="w-6 h-6 text-blue-600" />}
              title="Multi-College Support"
              desc="Manage multiple colleges with sub-admins and independent admin control"
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-blue-600" />}
              title="Role-Based Access"
              desc="SuperAdmin, Admin, Guard, and Student roles with granular permissions"
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6 text-blue-600" />}
              title="Smart Seat Allocation"
              desc="Visual grid-based and hall-based seating with real-time availability"
            />
            <FeatureCard 
              icon={<QrCode className="w-6 h-6 text-blue-600" />}
              title="QR Code for Attendees"
              desc="Unique QR codes for each registration enabling quick verification"
            />
            <FeatureCard 
              icon={<FileCheck className="w-6 h-6 text-blue-600" />}
              title="PDF Ticket Generation"
              desc="Automatic professional PDF tickets with all event details"
            />
            <FeatureCard 
              icon={<Clock className="w-6 h-6 text-blue-600" />}
              title="Real-Time Attendance"
              desc="Live attendance tracking and analytics for every seminar"
            />
            <FeatureCard 
              icon={<Cloud className="w-6 h-6 text-blue-600" />}
              title="Cloud Database"
              desc="Secure, scalable Firestore database with real-time sync"
            />
            <FeatureCard 
              icon={<Lock className="w-6 h-6 text-blue-600" />}
              title="Secure Authentication"
              desc="College-specific secure login with robust authentication"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-600">A streamlined process from registration to attendance</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <StepCard number="1" icon={<Building2 />} title="College Registration" desc="SuperAdmin registers new college into the system" />
            <StepCard number="2" icon={<Settings />} title="Setup Halls & Seminars" desc="Admin creates seminar halls and schedules events" />
            <StepCard number="3" icon={<QrCode />} title="QR Code Generation" desc="System auto-generates unique QR code for each seminar" />
            <StepCard number="4" icon={<UserCheck />} title="Student Registration" desc="Students register and select their preferred seats" />
            <StepCard number="5" icon={<FileCheck />} title="Ticket Download" desc="PDF ticket with QR code auto-downloaded instantly" />
            <StepCard number="6" icon={<ShieldCheck />} title="Attendance Verification" desc="Guard scans QR for real-time attendance" />
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Technology Stack</h2>
            <p className="text-slate-600">Built with modern, reliable, and scalable technologies</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
            <TechGroup title="Frontend" items={['React.js', 'Vite', 'Tailwind CSS', 'Shadcn/UI']} />
            <TechGroup title="Backend & Cloud" items={['Firebase Firestore', 'Cloud Functions']} />
            <TechGroup title="Deployment & Tools" items={['Vercel', 'GitHub', 'QR Generation', 'PDF Generation']} />
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <p className="text-slate-600">The minds behind SSEMS</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <TeamCard name="Project Lead" role="Full Stack Developer" desc="System Architecture & Integration" />
            <TeamCard name="Frontend Developer" role="UI/UX Specialist" desc="React & Tailwind Design Systems" />
            <TeamCard name="Backend Developer" role="Database Engineer" desc="Firebase & Cloud Infrastructure" />
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="py-20 bg-slate-900 text-white text-center px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-6">Start Using SSEMS Today</h2>
          <p className="text-slate-300 mb-10 max-w-2xl mx-auto">
            Transform your college's seminar and event management with our secure, efficient, and modern platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-8">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-slate-800 px-8">
                Register Your College
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Copyright */}
      <footer className="py-6 bg-slate-950 text-slate-500 text-sm border-t border-slate-900">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs text-white font-bold">SS</div>
            <span>SSEMS</span>
          </div>
          <p>© 2026 Smart Seminar & Event Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ number, icon, title, desc }) {
  return (
    <div className="flex gap-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
        {number}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <p className="text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function TechGroup({ title, items }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 w-full md:w-64">
      <h3 className="font-bold text-center mb-4">{title}</h3>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((item, i) => (
          <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function TeamCard({ name, role, desc }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
        <Users className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="font-bold text-lg mb-1">{name}</h3>
      <p className="text-blue-600 text-sm font-medium mb-2">{role}</p>
      <p className="text-slate-500 text-xs">{desc}</p>
    </div>
  );
}
