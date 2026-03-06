import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle, Heart, Activity, Wind, Droplets,
    CheckCircle2, Clock, Phone, Calendar, Video, MapPin,
    User as UserIcon, Pill, ChevronDown, ChevronUp,
    Wifi, TrendingUp, ShieldCheck
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { patients, medications } from '@/data/mockData';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, parse, isBefore } from 'date-fns';
import Papa from 'papaparse';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1onX4d0uegSEX9fn9Zz3UpLy_FaDqW7aOt-d-2BoUX8k/export?format=csv&gid=0';

const vitalIconMap: Record<string, React.ElementType> = { Heart, Activity, Wind, Droplets };

const statusStyles: Record<string, string> = {
    normal: 'border-l-4 border-l-emerald-400 bg-emerald-50 dark:bg-emerald-950/20',
    warning: 'border-l-4 border-l-amber-400 bg-amber-50 dark:bg-amber-950/20',
    critical: 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20',
};

const statusText: Record<string, string> = {
    normal: 'text-emerald-700 dark:text-emerald-400',
    warning: 'text-amber-700 dark:text-amber-400',
    critical: 'text-red-700 dark:text-red-400',
};

const CaregiverDashboard = () => {
    const basePatient = patients[0];
    const [patient, setPatient] = useState({ ...basePatient, name: 'Alex', avatar: 'AL' });
    const [liveVitals, setLiveVitals] = useState(basePatient.vitals);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [showPastAppts, setShowPastAppts] = useState(false);
    const [isLive, setIsLive] = useState(false);

    // Live vitals from Google Sheet (refresh every 30s)
    useEffect(() => {
        const fetchSheet = () => {
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
                        setPatient(prev => ({
                            ...prev,
                            riskLevel: parseFloat(tempF) > 99 || parseInt(last.HR) > 100 ? 'monitor' : 'high-risk',
                            lastChecked: 'Just now',
                        }));
                        setIsLive(true);
                    }
                }
            });
        };
        fetchSheet();
        const interval = setInterval(fetchSheet, 30000);
        return () => clearInterval(interval);
    }, []);

    // Appointments from Firebase
    useEffect(() => {
        const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, snap => {
            setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, []);

    const now = new Date();
    const upcomingAppts = appointments.filter(app => {
        try { return !isBefore(parse(app.timeSlot, 'hh:mm a', new Date(app.date)), now); }
        catch { return true; }
    });
    const pastAppts = appointments.filter(app => {
        try { return isBefore(parse(app.timeSlot, 'hh:mm a', new Date(app.date)), now); }
        catch { return false; }
    });

    const alerts = liveVitals
        .filter(v => v.status === 'critical' || v.status === 'warning')
        .map(v => ({
            label: v.label,
            value: `${v.value} ${v.unit}`,
            severity: v.status as 'critical' | 'warning',
        }));

    const takenMeds = medications.filter(m => m.taken).length;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-20 pb-16 px-4">
                <div className="container mx-auto max-w-3xl">

                    {/* Top bar: name + live */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">You're monitoring</p>
                            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{patient.name}</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">{patient.age} yrs • {patient.condition}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 mt-1">
                            <div className={cn(
                                'flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border',
                                isLive ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                                    : 'bg-muted text-muted-foreground border-border'
                            )}>
                                <span className={cn('w-1.5 h-1.5 rounded-full', isLive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground')} />
                                {isLive ? 'Live' : 'Connecting'}
                            </div>
                            <span className="text-xs text-muted-foreground">Updated {patient.lastChecked}</span>
                        </div>
                    </motion.div>

                    {/* Quick stats row */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        className="grid grid-cols-3 gap-3 mb-5">
                        <div className="glass-card p-4 text-center">
                            <p className="text-2xl font-bold text-foreground">{patient.healthScore}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Health Score</p>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <p className={cn('text-2xl font-bold', alerts.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400')}>
                                {alerts.length}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">Active Alerts</p>
                        </div>
                        <div className="glass-card p-4 text-center">
                            <p className="text-2xl font-bold text-foreground">{takenMeds}/{medications.length}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Meds Taken</p>
                        </div>
                    </motion.div>

                    {/* ALERTS — shown prominently if any */}
                    {alerts.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                            className="mb-5 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <p className="font-semibold text-sm text-red-700 dark:text-red-400">{alerts.length} health alert{alerts.length > 1 ? 's' : ''} need attention</p>
                            </div>
                            <div className="space-y-2">
                                {alerts.map((a, i) => (
                                    <div key={i} className={cn('flex items-center justify-between px-3 py-2 rounded-lg text-sm', statusStyles[a.severity])}>
                                        <span className={cn('font-medium', statusText[a.severity])}>{a.label}</span>
                                        <span className={cn('font-bold', statusText[a.severity])}>{a.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Live Readings */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 mb-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" /> Live Readings
                            </h2>
                            {isLive && <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Auto-refreshing every 30s</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {liveVitals.map(vital => {
                                const Icon = vitalIconMap[vital.icon] || Activity;
                                return (
                                    <div key={vital.label} className={cn('p-3 rounded-lg', statusStyles[vital.status])}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className={cn('w-3.5 h-3.5', statusText[vital.status])} />
                                            <span className="text-xs text-muted-foreground">{vital.label}</span>
                                        </div>
                                        <p className={cn('text-2xl font-bold tabular-nums', statusText[vital.status])}>{vital.value}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{vital.unit}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Medications */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5 mb-5">
                        <h2 className="font-heading font-bold text-foreground flex items-center gap-2 mb-1">
                            <Pill className="w-4 h-4 text-primary" /> Medication Schedule
                        </h2>
                        <p className="text-xs text-muted-foreground mb-4">Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                        <div className="divide-y divide-border">
                            {medications.map((med, idx) => (
                                <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                                        med.taken ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-amber-100 dark:bg-amber-900/40')}>
                                        {med.taken
                                            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            : <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground">{med.name} <span className="font-normal text-muted-foreground">{med.dose}</span></p>
                                        <p className="text-xs text-muted-foreground">{med.time}</p>
                                    </div>
                                    <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full',
                                        med.taken
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400')}>
                                        {med.taken ? 'Done' : 'Pending'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Emergency + Appointments */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
                        {/* SOS */}
                        <a href="tel:108">
                            <button className="w-full h-12 mb-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-colors shadow-md shadow-red-200 dark:shadow-red-900/30">
                                <Phone className="w-4 h-4" /> Call Emergency — 108
                            </button>
                        </a>

                        <h2 className="font-heading font-bold text-foreground flex items-center gap-2 mb-4">
                            <Calendar className="w-4 h-4 text-primary" /> Appointments
                        </h2>

                        {upcomingAppts.length === 0 ? (
                            <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground border border-dashed border-border rounded-xl justify-center mb-2">
                                <ShieldCheck className="w-4 h-4 opacity-40" /> No upcoming appointments
                            </div>
                        ) : (
                            <div className="space-y-2 mb-3">
                                {upcomingAppts.map(app => (
                                    <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent/40 transition-colors">
                                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                                            <UserIcon className="w-3.5 h-3.5 text-primary-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{app.userEmail}</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(app.date), 'MMM d')} · {app.timeSlot}</p>
                                        </div>
                                        {app.appointmentType === 'online'
                                            ? <span className="text-xs font-medium text-primary flex items-center gap-1 shrink-0"><Video className="w-3 h-3" />Online</span>
                                            : <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 shrink-0"><MapPin className="w-3 h-3" />In-person</span>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {pastAppts.length > 0 && (
                            <>
                                <button
                                    onClick={() => setShowPastAppts(p => !p)}
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
                                >
                                    {showPastAppts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    {showPastAppts ? 'Hide' : 'Show'} {pastAppts.length} past appointment{pastAppts.length !== 1 ? 's' : ''}
                                </button>
                                {showPastAppts && (
                                    <div className="mt-2 space-y-2 opacity-60">
                                        {pastAppts.map(app => (
                                            <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                    <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">{app.userEmail}</p>
                                                    <p className="text-xs text-muted-foreground">{format(new Date(app.date), 'MMM d')} · {app.timeSlot}</p>
                                                </div>
                                                <span className="text-xs text-muted-foreground shrink-0">Completed</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default CaregiverDashboard;
