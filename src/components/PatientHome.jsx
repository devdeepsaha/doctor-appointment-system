import React, { useState, useEffect } from 'react';
import BookingModal from './Chat/BookingModal';

const PatientHome = ({ availableSlots, bookings, onBook, onCancelBooking }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [autoStartVoice, setAutoStartVoice] = useState(false);
  const [isMyAppointmentsOpen, setIsMyAppointmentsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextAppt = bookings
    .filter(b => !b.completed)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary/20 min-h-screen pb-32 md:pb-0">
      
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled ? 'glass-effect border-outline-variant/15 py-3' : 'bg-transparent border-transparent py-5'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>dentistry</span>
            <span className="font-headline text-lg md:text-xl font-bold">MedBook Dental</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-on-surface-variant text-sm font-bold hover:text-primary transition-colors" href="#treatments">Treatments</a>
            <button onClick={() => setIsMyAppointmentsOpen(true)} className="text-on-surface-variant text-sm font-bold hover:text-primary transition-colors relative">
              My Appointments
              {bookings.length > 0 && <span className="absolute -top-2 -right-3 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{bookings.length}</span>}
            </button>
          </div>
          <button 
            onClick={() => { setAutoStartVoice(false); setIsBookingOpen(true); }}
            className="bg-primary text-on-primary px-5 py-2 md:px-6 md:py-2.5 rounded-full font-bold shadow-md hover:opacity-90 transition-all text-xs md:text-sm"
          >
            Book Visit
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-24 md:pt-40 space-y-16 md:space-y-32">
        
        {/* Hero Section: Desktop Asymmetric / Mobile Rounded */}
        <section className="grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 md:col-span-7 space-y-6">
             <span className="inline-block py-1.5 px-4 rounded-full bg-secondary-container text-on-secondary-container text-[10px] md:text-xs font-bold tracking-wider">AI-POWERED CLINIC</span>
            <h1 className="font-headline text-5xl md:text-7xl leading-tight text-on-surface">
              Your smile, <br/><span className="italic text-primary underline decoration-primary/10">restored</span> in harmony.
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
              Experience dental care as a peaceful retreat. Manage your health with the ease of a spa visit.
            </p>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => { setAutoStartVoice(false); setIsBookingOpen(true); }}
                className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all hover:bg-surface-container-high shadow-sm"
              >
                Book Now
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Desktop Only: Animated Chat Preview */}
          <div className="hidden md:flex col-span-5 relative justify-center">
            <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-outline-variant/10 w-full max-w-[400px]">
              <div className="flex flex-col gap-6">
                <div className="flex justify-end">
                  <div className="bg-primary text-white p-4 rounded-2xl rounded-br-sm text-sm shadow-md">
                    I need a checkup next Tuesday.
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-surface-container-low text-on-surface p-4 rounded-2xl rounded-bl-sm text-sm border border-outline-variant/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Assistant</span>
                    </div>
                    Checking schedule... I have 9:30 AM available. Shall I book it?
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-1.5 h-8">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1 h-4 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl -z-10"></div>
          </div>

          {/* Mobile Only: Voice CTA Card */}
          <div className="md:hidden col-span-12">
            <section 
              onClick={() => { setAutoStartVoice(true); setIsBookingOpen(true); }}
              className="relative bg-gradient-to-br from-primary to-primary-container p-6 rounded-2xl shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-body font-semibold text-on-primary text-xl">Start Voice Booking</h3>
                  <p className="text-on-primary/80 text-sm">Simply say "I need a cleaning"</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-tertiary-fixed voice-orb-glow flex items-center justify-center text-tertiary border-4 border-white/20">
                  <span className="material-symbols-outlined text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* Dashboard Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-headline text-3xl">Upcoming Appointments</h3>
            {bookings.length > 0 && <button onClick={() => setIsMyAppointmentsOpen(true)} className="text-primary font-bold text-sm">View all visits</button>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appointment Card */}
            <div className={`p-6 rounded-[2rem] flex flex-col justify-between min-h-[280px] transition-all border ${nextAppt ? 'bg-white border-outline-variant/10 shadow-xl shadow-primary/5' : 'bg-surface-container-low border-dashed border-outline-variant/30'}`}>
              {nextAppt ? (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                      <span className="font-bold tracking-wide uppercase text-xs">Confirmed Session</span>
                    </div>
                    <h2 className="font-headline text-3xl">{nextAppt.problem}</h2>
                    <div className="flex items-center gap-6 pt-2">
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Date</span>
                        <span className="font-bold text-lg">{nextAppt.date}</span>
                      </div>
                      <div className="w-px h-8 bg-outline-variant/30"></div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">Time</span>
                        <span className="font-bold text-lg">{nextAppt.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-6 border-t border-outline-variant/10">
                    <img className="w-10 h-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150" alt="Dr Miller"/>
                    <div>
                      <p className="font-bold text-sm">Dr. Sarah Miller</p>
                      <p className="text-[10px] text-on-surface-variant font-medium">Senior Clinical Lead</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                  <span className="material-symbols-outlined text-4xl">event_available</span>
                  <p className="italic text-sm">You have no upcoming sessions.</p>
                  <button onClick={() => setIsBookingOpen(true)} className="text-primary font-bold text-xs underline uppercase tracking-widest">Schedule now</button>
                </div>
              )}
            </div>

            {/* Quick Actions Bento */}
            <div className="grid grid-cols-2 gap-6">
              <a href="#treatments" className="bg-surface-container-low p-8 rounded-[2rem] flex flex-col justify-between group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-outline-variant/10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">dentistry</span>
                </div>
                <div>
                  <h4 className="font-headline text-xl">Treatments</h4>
                  <p className="text-on-surface-variant text-xs font-medium">View our care menu</p>
                </div>
              </a>
              <div className="bg-surface-container-low p-8 rounded-[2rem] flex flex-col justify-between group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-outline-variant/10">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container/50 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">location_on</span>
                </div>
                <div>
                  <h4 className="font-headline text-xl">Our Clinic</h4>
                  <p className="text-on-surface-variant text-xs font-medium">Visit our sanctuary</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Treatments Grid */}
        <section id="treatments" className="space-y-12 scroll-mt-32">
          <div className="text-center md:text-left space-y-4">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">Excellence</span>
            <h3 className="font-headline text-4xl md:text-5xl">Our Treatments</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-lg">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80" alt="Cosmetic"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10">
                <h3 className="text-white font-headline text-3xl mb-2">Cosmetic Dentistry</h3>
                <p className="text-white/70 text-sm leading-relaxed">Transform your aesthetic with porcelain veneers, professional whitening, and laser bonding.</p>
              </div>
            </div>
            <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-lg">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80" alt="Orthodontics"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10">
                <h3 className="text-white font-headline text-3xl mb-2">Orthodontics</h3>
                <p className="text-white/70 text-sm leading-relaxed">Modern alignment solutions featuring Invisalign® clear aligners and biocompatible systems.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Editorial Section */}
        <section className="bg-surface-container-low rounded-[3rem] p-12 overflow-hidden relative">
          <div className="relative z-10 grid grid-cols-12 gap-12">
            <div className="col-span-12 md:col-span-5 flex flex-col justify-center space-y-8">
              <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">Our Sanctuary</span>
              <h2 className="font-headline text-4xl md:text-5xl leading-tight">Beyond the Chair.</h2>
              <p className="text-on-surface-variant leading-relaxed text-lg">
                We believe dental care should be an act of self-care. Our suites feature aromatherapy, curated soundscapes, and climate-controlled comfort.
              </p>
              <button className="text-on-surface font-bold flex items-center gap-3 group hover:text-primary transition-colors text-lg">
                Take a Virtual Tour
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">play_circle</span>
              </button>
            </div>
            <div className="hidden md:grid col-span-7 grid-cols-2 gap-6">
              <img className="w-full h-80 object-cover rounded-[2rem] shadow-lg" src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80" alt="Clinic"/>
              <img className="w-full h-80 object-cover rounded-[2rem] mt-12 shadow-lg" src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80" alt="Clinic 2"/>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        </section>

        {/* Emergency Call-to-Action */}
        <section className="bg-error-container/20 border border-error/10 p-8 md:p-12 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="font-headline text-3xl text-on-error-container">Urgent Care Needed?</h3>
            <p className="text-on-error-container/70 text-lg">Our clinical team is on standby 24/7 for dental emergencies.</p>
          </div>
          <button className="w-full md:w-auto bg-error px-10 py-5 rounded-2xl text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-error/20 active:scale-95 transition-all text-lg">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
            Call 1-800-DENTIST
          </button>
        </section>
      </main>

      {/* Shared Footer Components (Mobile Nav + Site Footer) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-outline-variant/10 px-6 py-3 pb-8 md:hidden">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <a href="#" className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
          </a>
          <a href="#treatments" className="flex flex-col items-center gap-1 text-on-surface-variant/60 font-bold">
            <span className="material-symbols-outlined">medical_services</span>
            <span className="text-[10px] uppercase tracking-widest">Care</span>
          </a>
          <button onClick={() => setIsMyAppointmentsOpen(true)} className="flex flex-col items-center gap-1 text-on-surface-variant/60 font-bold relative">
            <span className="material-symbols-outlined">description</span>
            <span className="text-[10px] uppercase tracking-widest">Visits</span>
            {bookings.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white"></span>}
          </button>
          <a href="/admin" className="flex flex-col items-center gap-1 text-on-surface-variant/60 font-bold">
            <span className="material-symbols-outlined">lock</span>
            <span className="text-[10px] uppercase tracking-widest">Staff</span>
          </a>
        </div>
      </nav>

      {/* Extended FAB: Desktop Only */}
      <button 
        onClick={() => { setAutoStartVoice(true); setIsBookingOpen(true); }}
        className="fixed bottom-10 right-10 hidden md:flex items-center gap-4 bg-primary text-on-primary h-16 pl-6 pr-8 rounded-[1.25rem] shadow-2xl hover:bg-primary-container transition-all voice-orb-glow transform hover:-translate-y-2 z-40"
      >
        <span className="material-symbols-outlined text-2xl animate-pulse">mic</span>
        <span className="font-bold tracking-wide">Voice Assistant</span>
      </button>

      {/* Main Branding Footer */}
      <footer className="bg-surface-container-low px-8 py-20 mt-32 border-t border-outline-variant/10 pb-40 md:pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-6 space-y-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>dentistry</span>
              <span className="font-headline text-xl font-bold">MedBook Dental</span>
            </div>
            <p className="text-on-surface-variant max-w-sm text-sm leading-relaxed">
              Personalized dental care in a restorative environment. We are reimagining clinical excellence as a retreat for the senses.
            </p>
            <p className="text-[10px] text-outline uppercase tracking-[0.2em] font-bold">© 2026 MedBook Dental Clinic. All rights reserved.</p>
          </div>
          <div className="md:col-span-6 grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface">Practice</h4>
              <a className="text-on-surface-variant text-sm hover:text-primary transition-colors" href="#treatments">Treatments</a>
              <a className="text-on-surface-variant text-sm hover:text-primary transition-colors" href="#">Clinic Policy</a>
              <a className="text-on-surface-variant text-sm hover:text-primary transition-colors" href="/admin">Staff Login</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-xs uppercase tracking-widest text-on-surface">Connect</h4>
              <a className="text-on-surface-variant text-sm hover:text-primary transition-colors" href="#">Instagram</a>
              <a className="text-on-surface-variant text-sm hover:text-primary transition-colors" href="#">Contact Support</a>
              <a className="text-on-surface-variant text-sm hover:text-primary transition-colors" href="#">Privacy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Visits Overlay */}
      {isMyAppointmentsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative max-h-[85vh] flex flex-col border border-outline-variant/10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-headline text-3xl font-bold">My Visits</h2>
              <button onClick={() => setIsMyAppointmentsOpen(false)} className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {bookings.length === 0 ? <p className="text-center py-20 text-on-surface-variant italic opacity-60">Your visit history is empty.</p> : 
                bookings.map(b => (
                  <div key={b.id} className="p-6 bg-surface-container-low rounded-[1.5rem] border border-outline-variant/10 relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{b.date}</span>
                        <span className="font-headline text-2xl font-bold">{b.time}</span>
                      </div>
                      <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${b.completed ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-primary-container text-white'}`}>
                        {b.completed ? 'Success' : 'Confirmed'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">person</span> {b.patient_name}</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">medical_information</span> {b.problem}</p>
                    </div>
                    {!b.completed && (
                      <button onClick={() => { if(window.confirm('Cancel visit?')) onCancelBooking(b.id); }} className="mt-6 w-full py-3 bg-white text-error border border-error/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-error hover:text-white transition-all shadow-sm">Cancel Appointment</button>
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal (AI Assistant) */}
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        availableSlots={availableSlots} 
        onBook={onBook} 
        autoStartVoice={autoStartVoice} 
      />
    </div>
  );
};

export default PatientHome;