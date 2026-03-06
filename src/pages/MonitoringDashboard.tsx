import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, UserPlus, Clock, Video, MapPin, User as UserIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PatientRegistrationForm from '@/components/PatientRegistrationForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import Papa from 'papaparse';
import { patients } from '@/data/mockData';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Ufkonhk5rxI9ZypQtH2JSDgoqFPSGGO6yHzcE5wFkH8/export?format=csv&gid=0';

const MonitoringDashboard = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [registeredPatients, setRegisteredPatients] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'highRisk' | 'all'>('highRisk');

    useEffect(() => {
        // Listen to real-time appointments collection
        const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const liveApps = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAppointments(liveApps);
        });

        const fetchRegisteredPatients = async () => {
            try {
                const response = await fetch(SHEET_URL);
                const csvData = await response.text();

                Papa.parse(csvData, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (result) => {
                        const formatted = result.data
                            .filter((row: any) => row.Name)
                            .map((row: any, index: number) => ({
                                id: `reg-${index}`,
                                name: row.Name,
                                condition: row.Condition || row.Prescription || 'Recently Registered',
                                riskLevel: 'monitor',
                                healthScore: '-',
                                adherence: '-',
                                avatar: row.Name.substring(0, 2).toUpperCase()
                            }));
                        setRegisteredPatients(formatted.reverse()); // Show newest first
                    }
                });
            } catch (error) {
                console.error('Error fetching registered patients:', error);
            }
        };

        fetchRegisteredPatients();
        // Refresh every 30 seconds
        const interval = setInterval(fetchRegisteredPatients, 30000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    // Combine and sort all patients by risk level
    const riskWeights: Record<string, number> = {
        'high-risk': 3,
        'monitor': 2,
        'stable': 1
    };

    const allPatientsSorted = [...patients, ...registeredPatients].sort((a, b) => {
        const weightA = riskWeights[a.riskLevel] || 0;
        const weightB = riskWeights[b.riskLevel] || 0;
        if (weightB !== weightA) return weightB - weightA;
        const scoreA = typeof a.healthScore === 'number' ? a.healthScore : 100;
        const scoreB = typeof b.healthScore === 'number' ? b.healthScore : 100;
        return scoreA - scoreB;
    });

    const displayedPatients = viewMode === 'highRisk'
        ? allPatientsSorted.filter(p => p.riskLevel === 'high-risk')
        : allPatientsSorted;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-20 pb-12 px-4">
                <div className="container mx-auto max-w-5xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
                    >
                        <div>
                            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                                Monitoring Staff Dashboard
                            </h1>
                            <p className="text-muted-foreground mt-1">Manage priority patients and registrations</p>
                        </div>
                    </motion.div>

                    <Tabs defaultValue="overview">
                        <TabsList className="mb-6">
                            <TabsTrigger value="overview" className="flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4" /> Priority Monitor
                            </TabsTrigger>
                            <TabsTrigger value="add-patient" className="flex items-center gap-1.5">
                                <UserPlus className="w-4 h-4" /> Register Patient
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* High Risk Patients Section */}
                                <div className="glass-card p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-2 text-critical">
                                            <AlertTriangle className="w-5 h-5" />
                                            <h2 className="font-heading text-xl font-bold">Priority Monitor</h2>
                                        </div>

                                        <div className="flex items-center p-1 bg-muted/50 rounded-lg shrink-0">
                                            <button
                                                onClick={() => setViewMode('highRisk')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'highRisk' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                High Priority
                                            </button>
                                            <button
                                                onClick={() => setViewMode('all')}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                All Patients
                                            </button>
                                        </div>
                                    </div>

                                    {displayedPatients.length === 0 ? (
                                        <div className="text-center py-6 text-muted-foreground">
                                            No high-risk patients currently requiring attention.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {displayedPatients.map((patient) => (
                                                <div key={patient.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl gap-4 ${patient.riskLevel === 'high-risk' ? 'bg-critical/5 border-critical/20' : 'bg-background hover:bg-accent/50 border-border transition-colors'}`}>
                                                    <div className="flex gap-4 items-center">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${patient.riskLevel === 'high-risk' ? 'bg-critical/20 text-critical' : 'bg-primary/20 text-primary'}`}>
                                                            <span className="text-sm font-bold">{patient.avatar}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-heading font-bold text-foreground">{patient.name}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{patient.condition}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="text-right">
                                                            <p className="text-xs text-muted-foreground">Health Score</p>
                                                            <p className="font-bold text-critical">{patient.healthScore}</p>
                                                        </div>
                                                        <div className="text-right border-l pl-4 border-critical/20">
                                                            <p className="text-xs text-muted-foreground">Adherence</p>
                                                            <p className="font-bold text-warning">{patient.adherence}%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Appointments Section */}
                                <div className="glass-card p-6">
                                    <div className="flex items-center gap-2 mb-6 text-primary">
                                        <Calendar className="w-5 h-5" />
                                        <h2 className="font-heading text-xl font-bold">Upcoming Appointments</h2>
                                    </div>

                                    {appointments.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                            <p>No appointments booked yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {appointments.map((app) => (
                                                <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-accent/50 transition-colors gap-4">
                                                    <div className="flex gap-4 items-center">
                                                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
                                                            <UserIcon className="w-5 h-5 text-primary-foreground" />
                                                        </div>
                                                        <div>
                                                            <p className="font-heading font-bold text-foreground">{app.userEmail}</p>
                                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
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
                                </div>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="add-patient">
                            <div className="py-6">
                                <PatientRegistrationForm />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default MonitoringDashboard;
