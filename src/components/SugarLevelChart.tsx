import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, Droplet, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSugarTrendInsight } from '@/lib/gemini';
import { fetchSugarData } from '@/lib/sugarPrediction';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const SugarLevelChart = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<any[]>([]);
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSugarData = async () => {
            setLoading(true);
            setError(null);

            try {
                const sugarData = await fetchSugarData();

                if (sugarData.length === 0) {
                    setLoading(false);
                    return;
                }

                // Format for Recharts
                const chartData = sugarData.map(d => ({
                    time: format(new Date(d.timestamp), 'HH:mm'),
                    glucose: d.predictedGlucose,
                    status: d.status
                }));

                setData(chartData);

                // Fetch AI trend insight
                const glucoseLevels = sugarData.map(d => d.predictedGlucose).filter(v => v !== undefined) as number[];
                if (glucoseLevels.length > 0) {
                    const aiInsight = await getSugarTrendInsight(glucoseLevels);
                    setInsight(aiInsight);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load sugar tracking data.');
            } finally {
                setLoading(false);
            }
        };

        loadSugarData();
    }, []);

    if (loading) {
        return (
            <motion.div className="glass-card p-5 mt-6 animate-pulse">
                <div className="h-6 w-1/3 bg-muted rounded mb-4"></div>
                <div className="h-48 bg-muted/30 rounded w-full"></div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div className="glass-card p-5 mt-6 border-warning/50 bg-warning/5 flex items-start gap-2 text-warning text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
            </motion.div>
        );
    }

    if (data.length === 0) return null;

    const latestData = data[data.length - 1];
    const previousData = data.length > 1 ? data[data.length - 2] : null;

    const isUp = previousData ? latestData.glucose > previousData.glucose : false;
    const isDown = previousData ? latestData.glucose < previousData.glucose : false;

    const statusColor =
        latestData.status === 'LOW' ? 'text-blue-500' :
            latestData.status === 'NORMAL' ? 'text-success' :
                latestData.status === 'HIGH' ? 'text-orange-500' :
                    'text-destructive';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5 mt-6"
        >
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                            <Droplet className="w-4 h-4 text-pink-500" />
                        </div>
                        <h3 className="font-heading font-bold text-foreground">{t('dashboard.predictedBloodSugar')}</h3>
                    </div>

                    <div className="flex items-end gap-3 mt-3">
                        <span className="text-3xl font-heading font-bold text-foreground">
                            {latestData.glucose}
                        </span>
                        <span className="text-sm text-muted-foreground mb-1">mg/dL</span>

                        {previousData && (
                            <div className={`flex items-center gap-1 text-sm mb-1 ${isUp ? 'text-warning' : isDown ? 'text-success' : 'text-muted-foreground'}`}>
                                {isUp ? <TrendingUp className="w-4 h-4" /> : isDown ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                            </div>
                        )}
                    </div>
                    <p className={`text-xs font-semibold mt-1 ${statusColor}`}>
                        {t('dashboard.status')}: {latestData.status}
                    </p>
                </div>

                {insight && (
                    <div className="md:w-1/2 bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3">
                        <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{t('dashboard.aiTrendAnalysis')}</h4>
                            <p className="text-sm text-foreground/90 leading-relaxed">{insight}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">{t('dashboard.recentTrend')}</h4>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                            formatter={(value: number) => [`${value} mg/dL`, 'Predicted Glucose']}
                            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="glucose"
                            stroke="#ec4899" // Pink to match droplet
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#ec4899", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            name="Glucose"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default SugarLevelChart;
