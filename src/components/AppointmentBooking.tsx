import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, MapPin, CheckCircle2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, addDays, startOfWeek, isSameDay, isBefore, parse } from 'date-fns';
import { toast } from 'sonner';
import { addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useTranslation } from 'react-i18next';

const doctors = [
  { id: '1', name: 'Dr. Priya Sharma', specialty: 'Endocrinologist', avatar: 'PS' },
  { id: '2', name: 'Dr. James Lee', specialty: 'Cardiologist', avatar: 'JL' },
  { id: '3', name: 'Dr. Sarah Khan', specialty: 'Nephrologist', avatar: 'SK' },
];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM',
];

type AppointmentType = 'online' | 'in-person';

const AppointmentBooking = () => {
  const { t } = useTranslation();
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('online');
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookedSlotsToday, setBookedSlotsToday] = useState<string[]>([]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  // Fetch real taken slots from Firebase when doctor or date changes
  useEffect(() => {
    // We only care about matching the specific doctor AND exactly the selected date
    const formattedSelectedDate = selectedDate.toISOString();

    // Instead of complex exact string matching which is brittle on ISO strings (time drift),
    // we fetch appointments for the doctor and manually filter by the YYYY-MM-DD.
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', selectedDoctor.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slotsTakenInCurrentDate: string[] = [];
      const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

      snapshot.forEach(doc => {
        const data = doc.data();
        // compare dates strictly by day
        const appointmentDateString = format(new Date(data.date), 'yyyy-MM-dd');
        if (appointmentDateString === selectedDateString) {
          slotsTakenInCurrentDate.push(data.timeSlot);
        }
      });

      setBookedSlotsToday(slotsTakenInCurrentDate);
    });

    return () => unsubscribe();
  }, [selectedDoctor.id, selectedDate]);

  const availableSlots = timeSlots.filter((slot) => {
    if (bookedSlotsToday.includes(slot)) return false;

    // Prevent booking slots that have already passed earlier today
    if (isSameDay(selectedDate, today)) {
      try {
        const slotTime = parse(slot, 'hh:mm a', new Date());
        if (isBefore(slotTime, new Date())) {
          return false;
        }
      } catch {
        // Proceed if parsing fails
      }
    }
    return true;
  });

  const handleBook = async () => {
    if (!selectedSlot || !auth.currentUser) {
      toast.error('Please log in to book an appointment');
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        appointmentType,
        date: selectedDate.toISOString(),
        timeSlot: selectedSlot,
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      };

      await addDoc(collection(db, 'appointments'), appointmentData);

      setBooked(true);
      toast.success('Appointment booked successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBooked(false);
    setSelectedSlot(null);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {booked ? (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground mb-2">{t('dashboard.appointmentConfirmed')}</h3>
            <p className="text-muted-foreground mb-4">
              {selectedDoctor.name} • {format(selectedDate, 'EEEE, MMM d')} at {selectedSlot}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
              {appointmentType === 'online' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              {appointmentType === 'online' ? t('dashboard.onlineConsultation') : t('dashboard.inPersonVisit')}
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={handleReset}>{t('dashboard.bookAnother')}</Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="booking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Doctor Selection */}
            <div>
              <h3 className="font-heading font-bold text-sm text-foreground mb-3">{t('dashboard.selectDoctor')}</h3>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {doctors.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => { setSelectedDoctor(doc); setSelectedSlot(null); }}
                    className={cn(
                      'glass-card-hover p-3 flex items-center gap-3 min-w-[200px] border-2 transition-colors',
                      selectedDoctor.id === doc.id ? 'border-primary/40' : 'border-transparent'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                      {doc.avatar}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Appointment Type */}
            <div>
              <h3 className="font-heading font-bold text-sm text-foreground mb-3">{t('dashboard.appointmentType')}</h3>
              <div className="flex gap-3">
                {[
                  { type: 'online' as AppointmentType, icon: Video, label: t('dashboard.online') },
                  { type: 'in-person' as AppointmentType, icon: MapPin, label: t('dashboard.inPerson') },
                ].map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => setAppointmentType(opt.type)}
                    className={cn(
                      'glass-card-hover flex items-center gap-2 px-4 py-2.5 border-2 transition-colors',
                      appointmentType === opt.type ? 'border-primary/40' : 'border-transparent'
                    )}
                  >
                    <opt.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Week */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-sm text-foreground">{t('dashboard.selectDate')}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekStart(addDays(weekStart, -7))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeekStart(addDays(weekStart, 7))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const isPast = day < today && !isSameDay(day, today);
                  const isSelected = isSameDay(day, selectedDate);
                  return (
                    <button
                      key={day.toISOString()}
                      disabled={isPast}
                      onClick={() => { setSelectedDate(day); setSelectedSlot(null); }}
                      className={cn(
                        'flex flex-col items-center py-2.5 rounded-xl text-center transition-all',
                        isPast && 'opacity-30 cursor-not-allowed',
                        isSelected ? 'gradient-primary text-primary-foreground shadow-md' : 'hover:bg-accent',
                      )}
                    >
                      <span className="text-[10px] font-medium uppercase">{format(day, 'EEE')}</span>
                      <span className="text-lg font-bold font-heading">{format(day, 'd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <h3 className="font-heading font-bold text-sm text-foreground mb-3">
                {t('dashboard.availableSlots')} — {format(selectedDate, 'MMM d')}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'py-2.5 px-3 rounded-lg text-sm font-medium transition-all border',
                      selectedSlot === slot
                        ? 'gradient-primary text-primary-foreground border-transparent shadow-md'
                        : 'border-border hover:border-primary/30 text-foreground hover:bg-accent'
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Book Button */}
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              disabled={!selectedSlot}
              onClick={handleBook}
            >
              <Calendar className="w-4 h-4" />
              {selectedSlot
                ? `${t('dashboard.book')} ${selectedDoctor.name.split(' ')[1]} — ${format(selectedDate, 'MMM d')} at ${selectedSlot}`
                : t('dashboard.selectTimeSlot')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentBooking;
