import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle, Heart, Activity, Wind, Droplets,
    CheckCircle2, Clock, Phone, Calendar, Video, MapPin,
    User as UserIcon, Pill, ShieldAlert, ChevronDown, ChevronUp
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import HealthScoreRing from '@/components/HealthScoreRing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { patients, medications } from '@/data/mockData';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, parse, isBefore } from 'date-fns';
import Papa from 'papaparse';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1onX4d0uegSEX9fn9Zz3UpLy_FaDqW7aOt-d-2BoUX8k/export?format=csv&gid=0';

const vitalIconMap: Record<string, React.ElementType> = {
    Heart,
    Activity,
    Wind,
    Droplets,
};

const riskBadge: Record<string, string> = {
    'stable': 'bg-success/10 text-success border-success/20',
    'monitor': 'bg-warning/10 text-warning border-warning/20',
    'high-risk': 'bg-critical/10 text-critical border-critical/20',
};

const CaretakerDashboard = () => {
    // Use high-risk patient (Karthik) as the "assigned" patient for this caretaker
    const [patient, setPatient] = useState(patients[0]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [showPastAppts, setShowPastAppts] = useState(false);
    const [liveVitals, setLiveVitals] = useState(patients[0].vitals);

    // Fetch live vitals from spreadsheet
    useEffect(() => {
        Papa.parse(SHEET_URL, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                const valid = data.filter(r => r.HR && r.SpO2 && r.Temp && r.HR !== 'N/A');
                if (valid.length > 0) {
                    const last = valid[valid.length - 1];
                    const tempC = parseFloat(last.Temp);
                    const tempF = ((tempC * 9 / 5) + 32).toFixed(1);
                    setLiveVitals([
                        { label: 'Heart Rate', value: last.HR, unit: 'bpm', icon: 'Heart', status: parseInt(last.HR) > 100 ? 'warning' : 'normal', trend: valid.slice(-7).map((d: any) => parseInt(d.HR)) },
                        { label: 'Blood Pressure', value: '158/95', unit: 'mmHg', icon: 'Activity', status: 'critical', trend: [145, 150, 155, 158, 160, 158, 158] },
                        { label: 'Glucose', value: '210', unit: 'mg/dL', icon: 'Droplets', status: 'critical', trend: [180, 190, 200, 205, 210, 208, 210] },
                        { label: 'SpO₂', value: last.SpO2, unit: '%', icon: 'Wind', status: parseInt(last.SpO2) < 95 ? 'warning' : 'normal', trend: valid.slice(-7).map((d: any) => parseInt(d.SpO2)) },
                    ]);
                }
            }
        });
    }, []);

    // Fetch appointments
    useEffect(() => {
        const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    const now = new Date();
    const upcomingAppts = appointments.filter(app => {
        try {
            return !isBefore(parse(app.timeSlot, 'hh:mm a', new Date(app.date)), now);
        } catch { return true; }
    });
    const pastAppts = appointments.filter(app => {
        try {
            return isBefore(parse(app.timeSlot, 'hh:mm a', new Date(app.date)), now);
        } catch { return false; }
    });

    // Generate alerts from critical/warning vitals
    const alerts = liveVitals
        .filter(v => v.status === 'critical' || v.status === 'warning')
        .map(v => ({
            label: v.label,
            value: `${v.value} ${v.unit}`,
            severity: v.status as 'critical' | 'warning',
            message: v.status === 'critical'
                ? `${v.label} is critically outside the safe range — please act immediately.`
                : `${v.label} is elevated and needs monitoring.`,
        }));

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-20 pb-16 px-4">
                <div className="container mx-auto max-w-4xl space-y-6">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
                        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Caretaker Dashboard</h1>
                        <p className="text-muted-foreground">Monitoring: <span className="font-semibold text-foreground">{patient.name}</span></p>
                    </motion.div>

                    {/* 1. Patient Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-5"
                    >
                        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground shrink-0">
                            {patient.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-heading text-xl font-bold text-foreground">{patient.name}</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">{patient.age} years • {patient.condition}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={cn('text-xs font-bold px-3 py-1 rounded-full border', riskBadge[patient.riskLevel])}>
                                    {patient.riskLevel.replace('-', ' ').toUpperCase()}
                                </span>
                                <span className="text-xs text-muted-foreground">Last checked: {patient.lastChecked}</span>
                            </div>
                        </div>
                        <HealthScoreRing score={patient.healthScore} size={90} />
                    </motion.div>

                    {/* 2. Latest Readings */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-5"
                    >
                        <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" /> Latest Readings
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {liveVitals.map(vital => {
                                const Icon = vitalIconMap[vital.icon] || Activity;
                                const colors: Record<string, string> = {
                                    normal: 'text-success bg-success/10 border-success/20',
                                    warning: 'text-warning bg-warning/10 border-warning/20',
                                    critical: 'text-critical bg-critical/10 border-critical/20',
                                };
                                return (
                                    <div key={vital.label} className={cn('p-4 rounded-xl border flex flex-col gap-1', colors[vital.status])}>
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
                                            <span className="text-xs font-medium opacity-70">{vital.label}</span>
                                        </div>
                                        <p className="text-xl font-bold">{vital.value}</p>
                                        <p className="text-xs opacity-60">{vital.unit}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* 3. Medication Schedule */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass-card p-5"
                    >
                        <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Pill className="w-5 h-5 text-primary" /> Today's Medication Schedule
                        </h2>
                        <div className="space-y-3">
                            {medications.map((med, idx) => (
                                <div key={idx} className={cn(
                                    'flex items-center justify-between p-3 rounded-xl border',
                                    med.taken ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', med.taken ? 'bg-success/15' : 'bg-warning/15')}>
                                            {med.taken
                                                ? <CheckCircle2 className="w-4 h-4 text-success" />
                                                : <Clock className="w-4 h-4 text-warning" />
                                            }
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">{med.name} <span className="font-normal text-muted-foreground">({med.dose})</span></p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Clock className="w-3 h-3" /> {med.time}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', med.taken ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning')}>
                                        {med.taken ? 'Taken' : 'Pending'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 4. Alerts */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-5"
                    >
                        <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-critical" /> Health Alerts
                        </h2>
                        {alerts.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-success opacity-60" />
                                <p className="text-sm">All vitals are within normal range.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alerts.map((alert, idx) => (
                                    <div key={idx} className={cn(
                                        'flex items-start gap-3 p-4 rounded-xl border',
                                        alert.severity === 'critical' ? 'bg-critical/5 border-critical/20' : 'bg-warning/5 border-warning/20'
                                    )}>
                                        <AlertTriangle className={cn('w-5 h-5 mt-0.5 shrink-0', alert.severity === 'critical' ? 'text-critical' : 'text-warning')} />
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">{alert.label}: <span className="font-bold">{alert.value}</span></p>
                                            <p className={cn('text-xs mt-0.5', alert.severity === 'critical' ? 'text-critical/80' : 'text-warning/80')}>{alert.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* 5. Emergency & Appointments */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="glass-card p-5"
                    >
                        <h2 className="font-heading text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-critical" /> Emergency & Appointments
                        </h2>

                        {/* SOS Button */}
                        <a href="tel:108" className="block mb-6">
                            <Button variant="destructive" size="lg" className="w-full text-base font-bold tracking-wide h-14 rounded-xl shadow-lg shadow-critical/30 hover:scale-[1.02] transition-transform">
                                <Phone className="w-5 h-5 mr-2" /> SOS — Call Emergency (108)
                            </Button>
                        </a>

                        {/* Upcoming Appointments */}
                        <h3 className="font-heading font-bold text-foreground mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" /> Upcoming Appointments
                        </h3>
                        {upcomingAppts.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-xl mb-4">
                                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No upcoming appointments.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 mb-4">
                                {upcomingAppts.map((app) => (
                                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-xl hover:bg-accent/50 transition-colors gap-3">
                                        <div className="flex gap-3 items-center">
                                            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
                                                <UserIcon className="w-4 h-4 text-primary-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-foreground">{app.userEmail}</p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(app.date), 'MMM d, yyyy')}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{app.timeSlot}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {app.appointmentType === 'online'
                                                ? <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20"><Video className="w-3 h-3 mr-1" /> Online</div>
                                                : <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-secondary text-secondary-foreground border border-border"><MapPin className="w-3 h-3 mr-1" /> In Person</div>
                                            }
                                            <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-success/15 text-success border border-success/20 capitalize">{app.status}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Past Appointments Collapsible */}
                        {pastAppts.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setShowPastAppts(p => !p)}
                                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
                                >
                                    {showPastAppts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    {showPastAppts ? 'Hide' : 'Show'} Past Appointments ({pastAppts.length})
                                </button>
                                {showPastAppts && (
                                    <div className="space-y-3 opacity-70">
                                        {pastAppts.map(app => (
                                            <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-xl bg-accent/30 gap-3">
                                                <div className="flex gap-3 items-center">
                                                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-foreground">{app.userEmail}</p>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(app.date), 'MMM d, yyyy')}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{app.timeSlot}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">Completed</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default CaretakerDashboard;
