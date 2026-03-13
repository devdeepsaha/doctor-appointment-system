import React, { useState } from 'react';

const DoctorAdmin = ({ slots, bookings, onAdd, onDelete, onLogout, onCompleteBooking }) => {
  const [activeTab, setActiveTab] = useState('schedule'); 
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [bulkTime, setBulkTime] = useState({ start: "09:00", end: "17:00" });
  
  // Custom Date Range Mass Population
  const [bulkDateRange, setBulkDateRange] = useState({ start: "2026-10-01", end: "2026-10-31" });
  
  // Calendar View Mode (Month vs Week)
  const [viewMode, setViewMode] = useState('month'); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ date: "", time: "10:00" });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // October 2026 Setup
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startOffset = 4; // Oct 1 2026 is a Thursday

  // --- LOGIC: MASS SLOT GENERATOR ---
  const handleMassAdd = () => {
    if (!bulkDateRange.start || !bulkDateRange.end) return alert("Please select both start and end dates.");
    
    const startDate = new Date(bulkDateRange.start);
    const endDate = new Date(bulkDateRange.end);
    const newSlots = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayName = dayLabels[currentDate.getDay()];
      
      if (selectedDays.includes(dayName)) {
        const formattedDate = `${dayName} ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`;
        newSlots.push({
          id: Math.random().toString(36).substr(2, 9),
          date: formattedDate,
          time: formatTime(bulkTime.start),
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (newSlots.length > 0) {
      onAdd(newSlots);
      alert(`Successfully added ${newSlots.length} slots!`);
    } else {
      alert("No matching days found in that date range.");
    }
  };

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m} ${ampm}`;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // Calendar Cell Generation
  let calendarCells = [];
  for (let i = 0; i < startOffset; i++) calendarCells.push(null); 
  daysInMonth.forEach(d => calendarCells.push(d));
  const displayedCells = viewMode === 'week' ? calendarCells.slice(0, 7) : calendarCells;

  return (
    <div className="flex h-screen w-full bg-background text-on-surface overflow-hidden font-body relative">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Sidebar Navigation */}
      {/* CHANGED: Set bg-white explicitly for mobile and solid bg-surface-container for desktop */}
      <aside className={`fixed lg:relative z-50 w-72 bg-white lg:bg-surface-container border-r border-outline-variant/10 flex flex-col h-full shrink-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined">health_metrics</span>
              </div>
              <div>
                <h1 className="font-headline font-extrabold text-xl tracking-tight leading-none">MedBook</h1>
                <p className="font-label text-[10px] text-on-surface-variant tracking-widest uppercase mt-1">Admin Panel</p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <nav className="space-y-2">
            <button 
              onClick={() => handleTabChange('schedule')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${
                activeTab === 'schedule' 
                ? 'bg-primary-fixed text-on-primary-fixed font-semibold shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-container-high font-medium'
              }`}
            >
              <span className="material-symbols-outlined">calendar_today</span>
              <span className="text-sm">Schedule Management</span>
            </button>
            <button 
              onClick={() => handleTabChange('patients')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${
                activeTab === 'patients' 
                ? 'bg-primary-fixed text-on-primary-fixed font-semibold shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-container-high font-medium'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'patients' ? "'FILL' 1" : "'FILL' 0" }}>group</span>
              <span className="text-sm">Patient Directory</span>
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6 md:p-8 space-y-4">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-error-container/20 hover:text-error hover:border-error-container transition-all font-bold text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Exit Dashboard
          </button>
          <div className="p-4 bg-surface-container-low rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">DT</div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">Dr. Thorne</p>
              <p className="text-xs text-on-surface-variant truncate">Chief Dentist</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-secondary/5 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
        
        {/* Header */}
        <header className="h-16 md:h-20 bg-white/70 backdrop-blur-xl border-b border-outline-variant/10 flex items-center justify-between px-4 md:px-10 sticky top-0 z-10">
          <div className="flex items-center gap-3 md:gap-6 flex-1">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="font-headline font-bold text-lg text-on-surface hidden sm:block uppercase tracking-wider text-xs">
              {activeTab === 'schedule' ? 'Clinic Schedule' : 'Patient Records'}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors relative">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              {bookings.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>}
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
          
          {activeTab === 'schedule' ? (
            <>
              {/* --- SCHEDULE TAB --- */}
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6 mb-4 md:mb-6">
                
                {/* Mass Generator Card */}
                <div className="lg:col-span-8 bg-surface-container-lowest p-5 md:p-6 rounded-[1.5rem] border border-outline-variant/10 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-headline font-bold text-on-surface leading-tight">Mass Slot Generator</h3>
                      <p className="text-[10px] md:text-xs text-on-surface-variant">Populate specific days across any date span</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] md:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">Active Weekdays</label>
                        <div className="flex flex-wrap gap-1.5">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <button 
                              key={day}
                              onClick={() => selectedDays.includes(day) ? setSelectedDays(selectedDays.filter(d => d !== day)) : setSelectedDays([...selectedDays, day])}
                              className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all border ${
                                selectedDays.includes(day) 
                                ? 'bg-primary text-white border-primary shadow-sm' 
                                : 'bg-surface-container text-on-surface-variant border-outline-variant/10'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] md:text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">Fixed Start Time</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[16px]">schedule</span>
                          <input 
                            type="time" 
                            value={bulkTime.start}
                            onChange={(e) => setBulkTime({...bulkTime, start: e.target.value})}
                            className="w-full pl-10 pr-3 py-2 bg-surface-container-low border-none rounded-lg text-xs md:text-sm font-bold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 flex flex-col justify-end">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="text-[9px] font-bold text-on-surface-variant uppercase mb-1 block">From</label>
                           <input 
                              type="date" 
                              value={bulkDateRange.start}
                              onChange={(e) => setBulkDateRange({...bulkDateRange, start: e.target.value})}
                              className="w-full px-3 py-2 bg-surface-container-low border-none rounded-lg text-xs font-bold focus:ring-2 focus:ring-primary/20" 
                            />
                        </div>
                        <div>
                           <label className="text-[9px] font-bold text-on-surface-variant uppercase mb-1 block">To</label>
                           <input 
                              type="date" 
                              value={bulkDateRange.end}
                              onChange={(e) => setBulkDateRange({...bulkDateRange, end: e.target.value})}
                              className="w-full px-3 py-2 bg-surface-container-low border-none rounded-lg text-xs font-bold focus:ring-2 focus:ring-primary/20" 
                            />
                        </div>
                      </div>
                      <button 
                        onClick={handleMassAdd}
                        className="w-full py-3 bg-primary text-on-primary rounded-lg font-headline font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all text-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">bolt</span>
                        Populate Schedule
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <div className="flex-1 bg-surface-container-low p-5 rounded-[1.5rem] border border-outline-variant/5 flex flex-col justify-between">
                    <h4 className="text-on-surface-variant font-bold text-[10px] uppercase tracking-widest">Live Stats</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-headline font-extrabold text-on-surface">{bookings.length}</p>
                          <p className="text-[10px] font-medium text-on-surface-variant">Confirmed Visits</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container"><span className="material-symbols-outlined">analytics</span></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-headline font-extrabold text-primary">{slots.length}</p>
                          <p className="text-[10px] font-medium text-on-surface-variant">Empty Slots</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary"><span className="material-symbols-outlined">event_available</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Calendar Interface */}
              <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/10 rounded-[1.5rem] overflow-hidden shadow-sm">
                <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-b border-outline-variant/10 bg-surface/40 gap-4">
                  <h2 className="text-xl font-headline font-bold text-on-surface">October 2026</h2>
                  <div className="flex p-1 bg-surface-container-high rounded-lg w-full sm:w-auto">
                    <button onClick={() => setViewMode('month')} className={`flex-1 sm:px-6 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'month' ? 'bg-white shadow-md text-on-surface' : 'text-on-surface-variant'}`}>Month</button>
                    <button onClick={() => setViewMode('week')} className={`flex-1 sm:px-6 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'week' ? 'bg-white shadow-md text-on-surface' : 'text-on-surface-variant'}`}>Week</button>
                  </div>
                </div>
                
                <div className="w-full overflow-x-auto no-scrollbar">
                  <div className="min-w-[700px] w-full grid grid-cols-7">
                    {dayLabels.map(day => (
                      <div key={day} className="py-3 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">{day}</div>
                    ))}
                    
                    {displayedCells.map((d, index) => {
                      if (d === null) return <div key={`empty-${index}`} className="min-h-[110px] bg-surface-container-low/20 border-r border-b border-outline-variant/5"></div>;

                      const fullDate = `${dayLabels[new Date(2026, 9, d).getDay()]} ${d} Oct`;
                      const daySlots = slots.filter(s => s.date === fullDate);
                      const dayBookings = bookings.filter(b => b.date === fullDate);

                      return (
                        <div 
                          key={d} 
                          onClick={() => { setModalData({...modalData, date: fullDate}); setIsModalOpen(true); }}
                          className="min-h-[110px] p-2.5 bg-white border-r border-b border-outline-variant/5 hover:bg-surface-container-low transition-all cursor-pointer group flex flex-col"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-on-surface">{d}</span>
                            {dayBookings.length > 0 && <span className="px-1.5 py-0.5 rounded bg-secondary/10 text-secondary text-[8px] font-extrabold uppercase">{dayBookings.length} Booked</span>}
                          </div>
                          
                          <div className="flex flex-col gap-1.5 overflow-hidden">
                            {daySlots.slice(0, 3).map(s => (
                              <div key={s.id} className="group/chip flex items-center justify-between px-2 py-1 bg-primary-fixed text-on-primary-fixed text-[9px] font-bold rounded-lg border border-primary/5">
                                <span className="truncate">{s.time}</span>
                                <span onClick={(e) => { e.stopPropagation(); onDelete(s.id); }} className="material-symbols-outlined text-[12px] opacity-0 group-hover/chip:opacity-100 hover:text-error transition-all">close</span>
                              </div>
                            ))}
                            {daySlots.length > 3 && <p className="text-[8px] text-outline text-center font-bold mt-1">+{daySlots.length - 3} more</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* --- PATIENTS TAB --- */
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h4 className="font-headline font-bold text-2xl">Patient Directory</h4>
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold border border-primary/10">Active Records: {bookings.length}</span>
              </div>

              <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-primary/5 border border-outline-variant/10">
                <div className="w-full overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-surface-container-low/50">
                        <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Patient Details</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Clinical Status</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Reported Symptom</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {bookings.slice().reverse().map(p => (
                        <tr key={p.id} className={`transition-all ${p.completed ? 'bg-surface-container-lowest opacity-50' : 'hover:bg-surface-container-low'}`}>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-2xl bg-surface-container-highest flex items-center justify-center font-headline font-bold text-primary text-lg">
                                {/* FIXED: Checking for both patient_name and name keys */}
                                {(p.patient_name || p.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className={`font-bold text-sm ${p.completed ? 'line-through text-outline' : 'text-on-surface'}`}>{p.patient_name || p.name}</p>
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">{p.date} @ {p.time}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold border ${
                               p.completed ? 'bg-surface-variant text-on-surface-variant border-outline-variant/20' : 'bg-secondary/10 text-secondary border-secondary/10'
                             }`}>
                               {!p.completed && <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>}
                               {p.completed ? 'COMPLETED' : 'UPCOMING'}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-xs font-semibold text-on-surface max-w-[200px] truncate">{p.problem}</p>
                            <p className="text-[10px] text-on-surface-variant font-medium">{p.phone}</p>
                          </td>
                          <td className="px-8 py-6 text-right">
                            {p.completed ? (
                               <span className="material-symbols-outlined text-green-500">verified</span>
                            ) : (
                               <button 
                                 onClick={() => onCompleteBooking(p.id)}
                                 className="w-10 h-10 rounded-full border-2 border-outline-variant hover:border-green-500 hover:text-green-500 transition-all flex items-center justify-center bg-white shadow-sm hover:shadow-md"
                               >
                                 <span className="material-symbols-outlined">check</span>
                               </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {bookings.length === 0 && (
                  <div className="py-32 text-center flex flex-col items-center opacity-30">
                    <span className="material-symbols-outlined text-6xl mb-4">folder_managed</span>
                    <p className="font-headline font-bold text-xl">No Clinical Records Found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal: Single Slot Add */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-white/60">
              <h3 className="text-2xl font-headline font-bold mb-2">Create Single Slot</h3>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-8">{modalData.date}</p>
              <input 
                type="time" 
                value={modalData.time} 
                onChange={(e) => setModalData({...modalData, time: e.target.value})} 
                className="w-full p-4 bg-surface-container-low border-none rounded-2xl mb-10 font-headline font-bold text-2xl text-center focus:ring-4 focus:ring-primary/10 transition-all" 
              />
              <div className="flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-on-surface-variant hover:text-on-surface">Cancel</button>
                <button 
                  onClick={() => { onAdd([{ id: Math.random().toString(36).substr(2, 9), date: modalData.date, time: formatTime(modalData.time) }]); setIsModalOpen(false); }} 
                  className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Save Slot
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorAdmin;