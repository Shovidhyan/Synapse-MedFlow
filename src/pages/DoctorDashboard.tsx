import { motion } from 'framer-motion';
import { AlertTriangle, Download, Search, TrendingDown, TrendingUp, Bell, Calendar, Video, MapPin, User as UserIcon, Clock, PhoneCall, Ambulance, Syringe, MessageSquareWarning, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import VitalCard from '@/components/VitalCard';
import HealthScoreRing from '@/components/HealthScoreRing';
import { Button } from '@/components/ui/button';
import { patients } from '@/data/mockData';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { format, isBefore, parse } from 'date-fns';
import { toast } from 'sonner';
import Papa from 'papaparse';
import RegisterStaffModal from '@/components/RegisterStaffModal';
import PrescriptionModal from '@/components/PrescriptionModal';
import { Pill } from 'lucide-react';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1onX4d0uegSEX9fn9Zz3UpLy_FaDqW7aOt-d-2BoUX8k/export?format=csv&gid=0';

const riskBadge = {
  'stable': 'bg-success/10 text-success',
  'monitor': 'bg-warning/10 text-warning',
  'high-risk': 'bg-critical/10 text-critical',
};

const DoctorDashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [actionsHistory, setActionsHistory] = useState<any[]>([]);
  const [livePatients, setLivePatients] = useState(patients);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  useEffect(() => {
    // Listen to real-time appointments collection
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));

    const unsubscribeAppointments = onSnapshot(q, (querySnapshot) => {
      const liveApps = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAppointments(liveApps);
    });

    // Listen to real-time actions collection
    const actionsQ = query(collection(db, 'actions'), orderBy('timestamp', 'desc'));
    const unsubscribeActions = onSnapshot(actionsQ, (querySnapshot) => {
      const liveActions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActionsHistory(liveActions);
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeActions();
    };
  }, []);

  // Fetch real-time data from spreadsheet for Alex (Live Mock Patient)
  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        // Validate required fields
        const validData = data.filter(r => r.HR && r.SpO2 && r.Temp && r.HR !== 'N/A');

        if (validData.length > 0) {
          const lastRecord = validData[validData.length - 1];
          const tempC = parseFloat(lastRecord.Temp);
          const tempF = ((tempC * 9 / 5) + 32).toFixed(1);

          setLivePatients(prev => {
            const updated = [...prev];

            // Re-map the first patient to be "Alex" (Live Data)
            updated[0] = {
              ...updated[0],
              name: "Alex",
              avatar: "AL",
              lastChecked: "Just now",
              healthScore: 88,
              riskLevel: parseFloat(tempF) > 99 || parseInt(lastRecord.HR) > 100 ? 'monitor' : 'stable',
              vitals: [
                { label: 'Heart Rate', value: lastRecord.HR, unit: 'bpm', icon: 'Heart', status: 'normal', trend: validData.slice(-7).map(d => parseInt(d.HR)) },
                { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: 'Activity', status: 'normal', trend: [118, 122, 119, 125, 120, 121, 120] },
                { label: 'Temperature', value: tempF, unit: '°F', icon: 'Activity', status: parseFloat(tempF) > 99 ? 'warning' : 'normal', trend: validData.slice(-7).map(d => parseFloat(((parseFloat(d.Temp) * 9 / 5) + 32).toFixed(1))) },
                { label: 'SpO₂', value: lastRecord.SpO2, unit: '%', icon: 'Wind', status: 'normal', trend: validData.slice(-7).map(d => parseInt(d.SpO2)) },
              ]
            } as any;

            // If selected is currently the first guy, update it
            if (selectedPatient.id === updated[0].id) {
              setSelectedPatient(updated[0]);
            }

            return updated;
          });
        }
      }
    });
  }, [selectedPatient.id]);

  const sortedPatients = [...livePatients].sort((a, b) => a.healthScore - b.healthScore);
  const filteredPatients = sortedPatients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highRiskCount = livePatients.filter((p) => p.riskLevel === 'high-risk').length;
  const criticalAlerts = livePatients
    .filter((p) => p.riskLevel === 'high-risk')
    .map((p) => ({
      patient: p.name,
      message: `Health score dropped to ${p.healthScore}. Immediate attention needed.`,
    }));

  // Separate appointments by Upcoming vs Past based on time slot
  const now = new Date();

  const upcomingAppointments = appointments.filter((app) => {
    try {
      // app.date is ISO string, app.timeSlot is "10:30 AM"
      const appDate = new Date(app.date);
      // Parse the '02:00 PM' format onto the application date
      const combinedDateTime = parse(app.timeSlot, 'hh:mm a', appDate);
      return !isBefore(combinedDateTime, now);
    } catch {
      return true; // Fallback to upcoming if parsing fails
    }
  });

  const pastAppointments = appointments.filter((app) => {
    try {
      const appDate = new Date(app.date);
      const combinedDateTime = parse(app.timeSlot, 'hh:mm a', appDate);
      return isBefore(combinedDateTime, now);
    } catch {
      return false;
    }
  });

  const addActionToFirebase = async (actionText: string, description: string) => {
    try {
      await addDoc(collection(db, 'actions'), {
        patientName: selectedPatient.name,
        patientId: selectedPatient.id,
        action: actionText,
        description: description,
        timestamp: new Date().toISOString(),
        doctorId: auth.currentUser?.uid || 'unknown'
      });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };

  const handleAction = async (action: string) => {
    const desc = `Action has been logged and corresponding team notified.`;
    toast.success(`${action} initiated for ${selectedPatient.name}`, {
      description: desc,
    });
    await addActionToFirebase(action, desc);
  };

  const handlePrescribe = async (tablet: string, timing: string, sessions: string[]) => {
    const actionText = 'Prescription Issued';
    const desc = `${tablet} - ${timing} food (${sessions.join(', ')})`;
    toast.success(`${actionText} for ${selectedPatient.name}`, {
      description: desc,
    });
    await addActionToFirebase(actionText, desc);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
          >
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                Clinical Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">{livePatients.length} patients • {highRiskCount} high risk</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" /> Export Reports
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="critical" size="sm" className="relative cursor-pointer">
                    <Bell className="w-4 h-4 mr-1" /> Alerts
                    {criticalAlerts.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-critical text-critical-foreground text-[10px] font-bold flex items-center justify-center">
                        {criticalAlerts.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center gap-2 text-critical">
                    <AlertTriangle className="w-4 h-4" /> Critical Patient Alerts
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {criticalAlerts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No critical alerts at the moment.
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                      {criticalAlerts.map((alert, i) => (
                        <DropdownMenuItem key={i} className="flex flex-col items-start p-3 focus:bg-critical/5 cursor-pointer">
                          <span className="font-bold text-sm text-foreground">{alert.patient}</span>
                          <span className="text-xs text-muted-foreground mt-1">{alert.message}</span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <RegisterStaffModal />
            </div>
          </motion.div>

          <Tabs defaultValue="patients">
            <TabsList className="mb-6">
              <TabsTrigger value="patients">Patient Roster</TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-1.5 relative">
                <Calendar className="w-4 h-4" /> Appointments
                {upcomingAppointments.length > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-critical px-1 text-[10px] font-bold text-critical-foreground">
                    {upcomingAppointments.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-1.5 ml-2">
                <MessageSquareWarning className="w-4 h-4" /> Action History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patients">

              {/* Critical Alerts */}
              {criticalAlerts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card border-critical/30 bg-critical/5 p-4 mb-6"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-critical mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-heading font-bold text-sm text-critical">Critical Alerts</p>
                      {criticalAlerts.map((alert, i) => (
                        <p key={i} className="text-sm text-foreground">
                          <span className="font-semibold">{alert.patient}:</span> {alert.message}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid lg:grid-cols-[340px,1fr] gap-6">
                {/* Patient List */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-4 overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search patients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                    Sorted by risk (highest first)
                  </p>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={cn(
                          'w-full text-left p-3 rounded-xl transition-all duration-200 border',
                          selectedPatient.id === patient.id
                            ? 'bg-accent border-primary/20 shadow-sm'
                            : 'border-transparent hover:bg-muted'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                            {patient.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm text-foreground truncate">{patient.name}</p>
                              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2', riskBadge[patient.riskLevel])}>
                                {patient.healthScore}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{patient.condition}</p>
                            <p className="text-[10px] text-muted-foreground">{patient.lastChecked}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Patient Detail */}
                <motion.div
                  key={selectedPatient.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Patient Header */}
                  <div className="glass-card p-5 flex flex-col sm:flex-row sm:items-start md:items-center gap-5 justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground shrink-0">
                        {selectedPatient.avatar}
                      </div>
                      <div>
                        <h2 className="font-heading text-xl font-bold text-foreground">{selectedPatient.name}</h2>
                        <p className="text-sm text-muted-foreground">{selectedPatient.age} years • {selectedPatient.condition}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={cn('text-xs font-bold px-3 py-1 rounded-full', riskBadge[selectedPatient.riskLevel])}>
                            {selectedPatient.riskLevel.replace('-', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">Last checked: {selectedPatient.lastChecked}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {selectedPatient.riskLevel !== 'stable' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="critical" className="shadow-lg shadow-critical/20 animate-pulse-light">
                              Take Action
                              <ChevronDown className="w-4 h-4 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Emergency Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleAction('Ambulance Dispatched')} className="text-critical focus:text-critical cursor-pointer">
                              <Ambulance className="w-4 h-4 mr-2" />
                              Dispatch Ambulance
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Family Alert Sent')} className="cursor-pointer">
                              <MessageSquareWarning className="w-4 h-4 mr-2" />
                              Alert Family Member
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Medication Adjusted')} className="cursor-pointer">
                              <Syringe className="w-4 h-4 mr-2" />
                              Adjust Medication
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('Direct Call Initiated')} className="cursor-pointer">
                              <PhoneCall className="w-4 h-4 mr-2" />
                              Call Patient
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowPrescriptionModal(true)} className="cursor-pointer text-primary focus:text-primary">
                              <Pill className="w-4 h-4 mr-2" />
                              Issue Prescription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      <PrescriptionModal
                        open={showPrescriptionModal}
                        onOpenChange={setShowPrescriptionModal}
                        patientName={selectedPatient.name}
                        onPrescribe={handlePrescribe}
                      />

                      <div className="hidden sm:block">
                        <HealthScoreRing score={selectedPatient.healthScore} size={80} />
                      </div>
                    </div>
                  </div>

                  {/* Vitals */}
                  <div>
                    <h3 className="font-heading font-bold text-foreground mb-3">Current Vitals</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {selectedPatient.vitals.map((vital) => (
                        <VitalCard key={vital.label} {...vital} compact />
                      ))}
                    </div>
                  </div>

                  {/* Adherence & Stats */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="glass-card p-5">
                      <h3 className="font-heading font-bold text-foreground mb-3">Medication Adherence</h3>
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20">
                          <svg viewBox="0 0 80 80" className="-rotate-90 w-full h-full">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                            <circle
                              cx="40" cy="40" r="34"
                              fill="none"
                              stroke={selectedPatient.adherence >= 80 ? 'hsl(var(--success))' : selectedPatient.adherence >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--critical))'}
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 34}`}
                              strokeDashoffset={`${2 * Math.PI * 34 * (1 - selectedPatient.adherence / 100)}`}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center font-heading font-bold text-lg text-foreground">
                            {selectedPatient.adherence}%
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {selectedPatient.adherence >= 80 ? 'Good compliance' : selectedPatient.adherence >= 60 ? 'Needs improvement' : 'Poor compliance — alert sent'}
                          </p>
                          {selectedPatient.adherence < 80 && (
                            <div className="flex items-center gap-1 mt-1 text-warning">
                              <TrendingDown className="w-3.5 h-3.5" />
                              <span className="text-xs font-semibold">Declining trend</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-5">
                      <h3 className="font-heading font-bold text-foreground mb-3">Health Score Breakdown</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Vitals Stability', value: selectedPatient.healthScore > 70 ? 85 : 45 },
                          { label: 'Medication Adherence', value: selectedPatient.adherence },
                          { label: 'Symptom Reports', value: selectedPatient.healthScore > 60 ? 90 : 55 },
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="font-semibold text-foreground">{item.value}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={cn(
                                  'h-full rounded-full',
                                  item.value >= 80 ? 'bg-success' : item.value >= 60 ? 'bg-warning' : 'bg-critical'
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="appointments">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h2 className="font-heading text-xl font-bold text-foreground mb-6">Current Appointments</h2>

                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No current appointments found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((app) => (
                      <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-accent/50 transition-colors gap-4">

                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shrink-0">
                            <UserIcon className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-heading font-bold text-foreground">{app.userEmail}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {format(new Date(app.date), 'MMM d, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {app.timeSlot}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                          {app.appointmentType === 'online' ? (
                            <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                              <Video className="w-3.5 h-3.5 mr-1" /> Online
                            </div>
                          ) : (
                            <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
                              <MapPin className="w-3.5 h-3.5 mr-1" /> In Person
                            </div>
                          )}
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-success/15 text-success border border-success/20 capitalize">
                            {app.status}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

                {/* Past Appointments Section */}
                {pastAppointments.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-border/50">
                    <h2 className="font-heading text-xl font-bold text-foreground mb-6 opacity-80">Past Appointments</h2>
                    <div className="space-y-4 opacity-70">
                      {pastAppointments.map((app) => (
                        <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl bg-accent/30 gap-4">

                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <UserIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-heading font-bold text-foreground">{app.userEmail}</p>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {format(new Date(app.date), 'MMM d, yyyy')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {app.timeSlot}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                            {app.appointmentType === 'online' ? (
                              <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                                <Video className="w-3.5 h-3.5 mr-1" /> Online
                              </div>
                            ) : (
                              <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                                <MapPin className="w-3.5 h-3.5 mr-1" /> In Person
                              </div>
                            )}
                            <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground capitalize">
                              Completed
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="actions">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h2 className="font-heading text-xl font-bold text-foreground mb-6">Action History</h2>

                {actionsHistory.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No actions have been logged yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {actionsHistory.map((actionLog) => (
                      <div key={actionLog.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-accent/50 transition-colors gap-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shrink-0">
                            {actionLog.action.includes('Prescription') ? (
                              <Pill className="w-6 h-6 text-primary-foreground" />
                            ) : (
                              <MessageSquareWarning className="w-6 h-6 text-primary-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-heading font-bold text-foreground">{actionLog.action}</p>
                            <p className="text-sm text-foreground mt-0.5"><span className="font-medium">Patient:</span> {actionLog.patientName}</p>
                            <p className="text-xs text-muted-foreground mt-1">{actionLog.description}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {format(new Date(actionLog.timestamp), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
