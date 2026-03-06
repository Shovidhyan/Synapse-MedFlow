import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logoImg from '@/assets/logo.png';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const isHome = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20">
          <img src={logoImg} alt="Synapse MedFlow Logo" className="h-8 w-auto object-contain" />
          <span className="font-heading font-bold text-xl text-foreground">
            Synapse <span className="text-gradient-primary">MedFlow</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Globe className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  className={i18n.language === lang.code ? 'bg-primary/10 font-medium' : ''}
                  onClick={() => i18n.changeLanguage(lang.code)}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/login">
            <Button variant="hero" size="sm">{t('navbar.getStarted')}</Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border/50 bg-card"
          >
            <div className="p-4 flex flex-col gap-2">
              <div className="flex gap-2 mb-2 p-1 bg-muted/50 rounded-xl justify-center">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${i18n.language === lang.code ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="hero" className="w-full">{t('navbar.getStarted')}</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
