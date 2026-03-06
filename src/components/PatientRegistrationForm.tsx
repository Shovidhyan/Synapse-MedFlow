import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Pill, CheckCircle2, HeartPulse, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// TODO: Paste your Google Apps Script Web App URL here
const MACRO_URL = 'https://script.google.com/macros/s/AKfycbzEMxOM9p2oCZ2CIiMhS_eYDHiRgWYdWMHIi2XXn-CZyPWacCQTjtQd6YZ7c7O5TG-Z/exec';

const PatientRegistrationForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [condition, setCondition] = useState('');
    const [prescription, setPrescription] = useState('30 tablets');
    const [reminderDays, setReminderDays] = useState('30');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!MACRO_URL) {
            toast.error('Google Sheets App Script URL is missing. Check sample.txt for setup instructions.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(MACRO_URL, {
                method: 'POST',
                // 'no-cors' is often required when posting to Google Apps Script from a browser
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    condition,
                    prescription,
                    reminderDays: parseInt(reminderDays, 10)
                }),
            });

            // With no-cors, we can't actually read the response, so we assume success if it didn't throw
            setSuccess(true);
            toast.success('Patient registered and saved to Google Sheets!');

            // Reset form
            setName('');
            setEmail('');
            setCondition('');
            setPrescription('30 tablets');
            setReminderDays('30');

            setTimeout(() => setSuccess(false), 3000);

        } catch (error) {
            console.error(error);
            toast.error('Failed to save to Google Sheets.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
        >
            <div className="glass-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground shrink-0">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-heading text-xl font-bold text-foreground">Register New Patient</h2>
                        <p className="text-sm text-muted-foreground">Syncs directly to your Google Sheet</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Patient Name</label>
                        <Input
                            placeholder="e.g. Rahul Sharma"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="patient@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Medical Condition</label>
                        <div className="relative">
                            <HeartPulse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="e.g. Hypertension, Diabetes"
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Prescription</label>
                            <div className="relative">
                                <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="e.g. 30 tablets"
                                    value={prescription}
                                    onChange={(e) => setPrescription(e.target.value)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Remind For (Days)</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={reminderDays}
                                    onChange={(e) => setReminderDays(e.target.value)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={loading}>
                        {loading ? (
                            'Saving to Sheet...'
                        ) : success ? (
                            <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved Successfully</>
                        ) : (
                            'Register Patient'
                        )}
                    </Button>
                </form>
            </div>
        </motion.div>
    );
};

export default PatientRegistrationForm;
