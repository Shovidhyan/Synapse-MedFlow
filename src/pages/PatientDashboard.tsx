import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Sun, CheckCircle, XCircle, Clock, CalendarPlus, Sparkles, Play, Square, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import VitalCard from '@/components/VitalCard';
import AppointmentBooking from '@/components/AppointmentBooking';
import { Button } from '@/components/ui/button';
import { currentVitals, medications, weeklyAdherenceData, vitalsTrendData } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Papa from 'papaparse';
import { format } from 'date-fns';
import ReportDownloader from '@/components/ReportDownloader';
import AiHealthInsight from '@/components/AiHealthInsight';
import SugarLevelChart from '@/components/SugarLevelChart';
import { useTranslation } from 'react-i18next';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1onX4d0uegSEX9fn9Zz3UpLy_FaDqW7aOt-d-2BoUX8k/export?format=csv&gid=0';

const PatientDashboard = () => {
  const { t } = useTranslation();
  const takenCount = medications.filter((m) => m.taken).length;
  const totalCount = medications.length;

  const [rawVitals, setRawVitals] = useState<any[]>([]);
  const [liveCurrentVitals, setLiveCurrentVitals] = useState(currentVitals);
  const [liveVitalsTrend, setLiveVitalsTrend] = useState(vitalsTrendData);

  // Fetch real-time data from spreadsheet
  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        // Validate required fields
        const validData = data.filter(r => r.HR && r.SpO2 && r.Temp && r.HR !== 'N/A');

        setRawVitals(validData);

        if (validData.length > 0) {
          const lastRecord = validData[validData.length - 1];
          const tempC = parseFloat(lastRecord.Temp);
          const tempF = ((tempC * 9 / 5) + 32).toFixed(1);

          // Merge live payload on top of mock baseline UI structure
          const updatedVitals = currentVitals.map(v => {
            if (v.label === 'Heart Rate') return { ...v, value: lastRecord.HR };
            if (v.label === 'SpO₂') return { ...v, value: lastRecord.SpO2 };
            return v;
          });

          updatedVitals[2] = {
            label: 'Temperature',
            value: tempF,
            unit: '°F',
            icon: 'Activity',
            status: parseFloat(tempF) > 99 ? 'warning' : 'normal',
            trend: validData.slice(-7).map(d => parseFloat(((parseFloat(d.Temp) * 9 / 5) + 32).toFixed(1)))
          };

          setLiveCurrentVitals(updatedVitals as any);

          // Update latest 15 values for Chart
          const newTrend = validData.slice(-15).map(d => ({
            time: format(new Date(d.time), 'HH:mm'),
            hr: parseInt(d.HR, 10),
            bp: 120, // stationary mock
            glucose: 100, // stationary mock
            spo2: parseInt(d.SpO2, 10)
          }));

          setLiveVitalsTrend(newTrend);
        }
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
          >
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                {t('dashboard.greeting')}, Alex 👋
              </h1>
              <p className="text-muted-foreground mt-1">{t('dashboard.summary')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-1" /> {t('dashboard.today')}
              </Button>
              <Button variant="outline" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="mb-6 flex overflow-x-auto w-full justify-start pb-2 hide-scrollbar">
              <TabsTrigger value="overview" className="whitespace-nowrap">{t('dashboard.overview')}</TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-1.5 whitespace-nowrap">
                <CalendarPlus className="w-3.5 h-3.5" /> {t('dashboard.appointments')}
              </TabsTrigger>
              <TabsTrigger value="ai-jobs" className="flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5" /> {t('dashboard.aiJobs')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">

              {/* Daily Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-5 mb-6 flex flex-wrap items-center gap-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.overallStatus')}</p>
                    <p className="font-heading font-bold text-success">{t('dashboard.good')}</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-border hidden sm:block" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.medications')}</p>
                  <p className="font-heading font-bold text-foreground">{t('dashboard.takenCount', { taken: takenCount, total: totalCount })}</p>
                </div>
                <div className="h-8 w-px bg-border hidden sm:block" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.symptoms')}</p>
                  <p className="font-heading font-bold text-foreground">{t('dashboard.noneReported')}</p>
                </div>
              </motion.div>

              {/* Live Vitals */}
              <h2 className="font-heading text-lg font-bold text-foreground mb-4 mt-6">{t('dashboard.liveVitals')}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {liveCurrentVitals.map((vital) => (
                  <VitalCard key={vital.label} {...vital} />
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Vitals Trend */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-5"
                >
                  <h3 className="font-heading font-bold text-foreground mb-4">{t('dashboard.vitalsTrend')}</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={liveVitalsTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Line type="monotone" dataKey="hr" stroke="hsl(var(--critical))" strokeWidth={2} dot={false} name="Heart Rate" />
                      <Line type="monotone" dataKey="spo2" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="SpO₂" />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Weekly Adherence */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card p-5"
                >
                  <h3 className="font-heading font-bold text-foreground mb-4">{t('dashboard.weeklyAdherence')}</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weeklyAdherenceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="adherence" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Medication Schedule */}
              <h2 className="font-heading text-lg font-bold text-foreground mb-4">{t('dashboard.todaysMedication')}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {medications.map((med, i) => (
                  <motion.div
                    key={`${med.name}-${med.time}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="glass-card p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${med.taken ? 'bg-success/10' : 'bg-muted'}`}>
                        {med.taken ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{med.name} — {med.dose}</p>
                        <p className="text-xs text-muted-foreground">{med.time}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${med.taken ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {med.taken ? t('dashboard.taken') : t('dashboard.pending')}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Report Downloader Component */}
              <ReportDownloader data={rawVitals} />
            </TabsContent>

            <TabsContent value="appointments">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="font-heading text-lg font-bold text-foreground mb-5">{t('dashboard.bookAppointment')}</h2>
                <AppointmentBooking />
              </motion.div>
            </TabsContent>

            <TabsContent value="ai-jobs">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <h2 className="font-heading text-lg font-bold text-foreground">{t('dashboard.aiIntelligence')}</h2>
                </div>

                {/* AI Health Insight */}
                <AiHealthInsight vitals={liveCurrentVitals} />

                {/* Sugar Level Tracking */}
                <SugarLevelChart />
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
