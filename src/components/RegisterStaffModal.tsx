import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { secondaryAuth, db } from '@/lib/firebase';
import { toast } from 'sonner';

const RegisterStaffModal = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegisterStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create the user in Firebase Auth using the secondary app
            // This prevents the Doctor from being automatically logged out
            const userCredential = await createUserWithEmailAndPassword(
                secondaryAuth,
                formData.email,
                formData.password
            );

            // 2. Save the user details in Firestore with 'staff' role
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                name: formData.name,
                email: formData.email,
                role: 'staff',
                createdAt: new Date().toISOString(),
            });

            toast.success('Monitoring Staff registered successfully!');
            setOpen(false);
            setFormData({ name: '', email: '', password: '' });
        } catch (error: any) {
            console.error('Error registering staff:', error);
            toast.error(error.message || 'Failed to register staff member.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Register Staff
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Register Monitoring Staff</DialogTitle>
                    <DialogDescription>
                        Create a new account for a monitoring staff member. They will be able to log in to the Staff portal using these credentials.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRegisterStaff} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. Maya Chen"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="staff@medflow.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Temporary Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Min. 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="mr-2">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Account
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RegisterStaffModal;
