import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, Heart, BarChart3, ArrowRight, Shield, Lock, Cloud, Users, Calendar, Pill } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <header className="absolute top-0 w-full z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20">
          <img src={logo} alt="Synapse MedFlow Logo" className="h-8 w-auto object-contain" />
          <span className="font-heading font-bold text-xl text-foreground">Synapse MedFlow</span>
        </div>
        <Link to="/login">
          <Button variant="default" className="font-semibold">Get Started</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-28 lg:min-h-[90vh] lg:flex lg:items-center px-4 overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/src/assets/hero-nursing.jpg')" }}
        >
          <div className="absolute inset-0 bg-white/70" />
        </div>

        <div className="container relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-6"
          >
            <Activity className="w-3.5 h-3.5" />
            Intelligent Patient Monitoring
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-5"
          >
            Connecting Vitals, Medication, and Care —{' '}
            <span className="text-gradient-primary">Seamlessly.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Real-time monitoring, smart alerts, and actionable insights for better chronic care management.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            <Link to="/login">
              <Button variant="hero" size="lg">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="hero-outline" size="lg">Book Appointment</Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6"
          >
            {[
              { icon: Lock, label: 'End-to-end Encryption' },
              { icon: Shield, label: 'HIPAA Compliant' },
              { icon: Cloud, label: 'Secure Cloud' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="w-4 h-4 text-primary" />
                {item.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-b border-border">
        <div className="container mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '10K+', label: 'Patients Monitored' },
            { value: '500+', label: 'Healthcare Providers' },
            { value: '99.9%', label: 'Uptime' },
            { value: '24/7', label: 'Real-time Alerts' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-heading text-2xl md:text-3xl font-bold text-gradient-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-3">Everything You Need</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">One platform for vitals, medications, appointments, and clinical decisions.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Heart, title: 'Live Vitals', desc: 'Heart rate, BP, glucose & SpO₂ in real time.' },
              { icon: BarChart3, title: 'Risk Scoring', desc: 'AI-powered health scores for clinical decisions.' },
              { icon: Pill, title: 'Medication Tracking', desc: 'Schedules, reminders, and adherence reports.' },
              { icon: Calendar, title: 'Appointments', desc: 'Book and manage appointments with ease.' },
              { icon: Users, title: 'Role-based Access', desc: 'Doctor, patient, caregiver, and staff views.' },
              { icon: Activity, title: 'Smart Alerts', desc: 'Instant notifications for critical changes.' },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card-hover p-6"
              >
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-3">
                  <feat.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1">{feat.title}</h3>
                <p className="text-sm text-muted-foreground">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="glass-card p-10 text-center gradient-primary rounded-2xl">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
              Ready to transform patient care?
            </h2>
            <p className="text-primary-foreground/80 mb-6">Join thousands of healthcare professionals using Synapse MedFlow.</p>
            <Link to="/login">
              <Button variant="default" size="lg" className="bg-white text-primary hover:bg-gray-100 border-0 font-semibold shadow-md">
                Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-sm text-foreground">Synapse MedFlow</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Synapse MedFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
