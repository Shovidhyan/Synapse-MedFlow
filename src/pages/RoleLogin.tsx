import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

const RoleLogin = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const navigate = useNavigate();
    const location = useLocation();

    // Get role from URL query param (e.g. /auth?role=doctor)
    const searchParams = new URLSearchParams(location.search);
    const role = searchParams.get('role') || 'patient';

    const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
    const destinationPath = role === 'doctor' ? '/doctor' : role === 'staff' ? '/staff' : role === 'caretaker' ? '/caretaker' : role === 'caregiver' ? '/caregiver' : '/patient';

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success(`${t('auth.loginSuccess')}${roleDisplay}!`);
                navigate(destinationPath);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                toast.success(`${roleDisplay}${t('auth.signupSuccess')}`);
                navigate(destinationPath);
            }
        } catch (error: any) {
            toast.error(error.message || t('auth.authFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-28 pb-20 px-4">
                <div className="container mx-auto max-w-md">
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        {t('auth.backToRole')}
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary mb-5">
                            <Activity className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                            {roleDisplay} {isLogin ? t('auth.signIn') : t('auth.signUp')}
                        </h1>
                        <p className="text-muted-foreground">
                            {isLogin ? t(`auth.${role}SignInDesc` as any, { defaultValue: `Enter your credentials to access your ${role} portal` }) : t(`auth.${role}SignUpDesc` as any, { defaultValue: `Sign up to create your ${role} account` })}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6 md:p-8 rounded-2xl"
                    >
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('auth.email')}</label>
                                <Input
                                    type="email"
                                    placeholder={t('auth.emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('auth.password')}</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full mt-6" disabled={loading}>
                                {loading ? t('auth.processing') : (isLogin ? t('auth.signIn') : t('auth.signUp'))}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">
                                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                            </span>
                            <button
                                type="button"
                                className="text-primary font-medium hover:underline"
                                onClick={() => setIsLogin(!isLogin)}
                            >
                                {isLogin ? t('auth.signUp') : t('auth.signIn')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default RoleLogin;
