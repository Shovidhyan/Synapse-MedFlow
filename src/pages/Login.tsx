import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, User, Heart, ClipboardList, ArrowUpRight } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useTranslation } from 'react-i18next';

const roles = [
  {
    icon: Stethoscope,
    id: 'doctor',
    path: '/auth?role=doctor',
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'hover:shadow-blue-500/25',
    border: 'hover:border-blue-400/50',
    accent: 'hover:bg-blue-500/5',
  },
  {
    icon: User,
    id: 'patient',
    path: '/auth?role=patient',
    gradient: 'from-emerald-500 to-teal-400',
    glow: 'hover:shadow-emerald-500/25',
    border: 'hover:border-emerald-400/50',
    accent: 'hover:bg-emerald-500/5',
  },
  {
    icon: Heart,
    id: 'caregiver',
    path: '/auth?role=caregiver',
    gradient: 'from-rose-500 to-pink-400',
    glow: 'hover:shadow-rose-500/25',
    border: 'hover:border-rose-400/50',
    accent: 'hover:bg-rose-500/5',
  },
  {
    icon: ClipboardList,
    id: 'staff',
    path: '/auth?role=staff',
    gradient: 'from-violet-500 to-indigo-400',
    glow: 'hover:shadow-violet-500/25',
    border: 'hover:border-violet-400/50',
    accent: 'hover:bg-violet-500/5',
  },
];

// Floating bubbles
const bubbles = [
  { size: 500, x: -120, y: -100, color: 'bg-blue-400/10', delay: 0, dur: 14 },
  { size: 350, x: '65%', y: -80, color: 'bg-violet-400/10', delay: 2, dur: 18 },
  { size: 220, x: '75%', y: '55%', color: 'bg-emerald-400/10', delay: 1, dur: 12 },
  { size: 280, x: '5%', y: '60%', color: 'bg-rose-400/10', delay: 3, dur: 16 },
  { size: 180, x: '40%', y: '75%', color: 'bg-cyan-400/10', delay: 1.5, dur: 20 },
];

const Login = () => {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">

      {/* Floating background bubbles */}
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${b.color} blur-3xl pointer-events-none`}
          style={{ width: b.size, height: b.size, left: b.x, top: b.y }}
          animate={{ y: [0, -28, 0], x: [0, 14, 0] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Minimal top bar */}
      <div className="relative z-10 flex items-center px-8 pt-6">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Synapse MedFlow" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-heading font-bold text-foreground">
            Synapse <span className="text-primary">MedFlow</span>
          </span>
        </div>
      </div>

      {/* Centred content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
            {t('login.title')}
          </h1>
          <p className="text-muted-foreground">{t('login.subtitle')}</p>
        </motion.div>

        {/* 4 cards in one horizontal row */}
        <div className="grid grid-cols-4 gap-5 w-full max-w-6xl">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={role.path}
                className={`group relative flex flex-col p-8 h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm ${role.border} ${role.accent} ${role.glow} hover:shadow-2xl transition-all duration-300 overflow-hidden`}
              >
                {/* Subtle gradient overlay on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300`} />

                {/* Arrow */}
                <ArrowUpRight className="absolute top-5 right-5 w-4 h-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg mb-6`}>
                  <role.icon className="w-7 h-7 text-white" />
                </div>

                {/* Text */}
                <h3 className="font-heading text-xl font-bold text-foreground mb-3">{t(`login.${role.id}` as any)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`login.${role.id}Desc` as any)}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Access is restricted to authorised personnel only.
        </p>

      </div>
    </div>
  );
};

export default Login;
