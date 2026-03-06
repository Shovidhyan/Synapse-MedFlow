import { useState } from 'react';
import { Pill, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PrescriptionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientName: string;
    onPrescribe?: (tablet: string, timing: string, sessions: string[]) => void;
}

const PrescriptionModal = ({ open, onOpenChange, patientName, onPrescribe }: PrescriptionModalProps) => {
    const [tablet, setTablet] = useState('');
    const [timing, setTiming] = useState<'after' | 'before'>('after');
    const [sessions, setSessions] = useState({
        morning: false,
        afternoon: false,
        evening: false,
    });

    const handleToggleSession = (session: keyof typeof sessions) => {
        setSessions((prev) => ({ ...prev, [session]: !prev[session] }));
    };

    const handlePrescribe = () => {
        if (!tablet.trim()) {
            toast.error('Please enter a tablet or medicine name.');
            return;
        }

        const selectedSessions = Object.entries(sessions)
            .filter(([_, isSelected]) => isSelected)
            .map(([name]) => name);

        if (selectedSessions.length === 0) {
            toast.error('Please select at least one session (Morning/Afternoon/Evening).');
            return;
        }

        if (onPrescribe) {
            onPrescribe(tablet, timing, selectedSessions);
        } else {
            // Success action fallback
            toast.success(`Prescription issued for ${patientName}`, {
                description: `${tablet} - ${timing} food (${selectedSessions.join(', ')})`,
            });
        }

        // Reset and close
        setTablet('');
        setTiming('after');
        setSessions({ morning: false, afternoon: false, evening: false });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Pill className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="font-heading text-xl">Issue Prescription</DialogTitle>
                    <DialogDescription>
                        Prescribe medication for <span className="font-semibold text-foreground">{patientName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">Tablet / Medicine Name</label>
                        <Input
                            placeholder="e.g. Paracetamol 500mg"
                            value={tablet}
                            onChange={(e) => setTablet(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">Meal Timing</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setTiming('before')}
                                className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${timing === 'before'
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-transparent border-border text-muted-foreground hover:bg-accent/50'
                                    }`}
                            >
                                Before Food
                            </button>
                            <button
                                onClick={() => setTiming('after')}
                                className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${timing === 'after'
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-transparent border-border text-muted-foreground hover:bg-accent/50'
                                    }`}
                            >
                                After Food
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" /> Intake Sessions
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['morning', 'afternoon', 'evening'].map((session) => (
                                <button
                                    key={session}
                                    onClick={() => handleToggleSession(session as keyof typeof sessions)}
                                    className={`py-3 px-2 rounded-xl border text-sm font-medium capitalize transition-all flex flex-col items-center gap-1 ${sessions[session as keyof typeof sessions]
                                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                        : 'bg-accent/30 border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                                        }`}
                                >
                                    {session}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handlePrescribe} className="gap-2">
                        <Pill className="w-4 h-4" /> Issue Prescription
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PrescriptionModal;
