import { useState, useEffect, useRef } from 'react';
import { Sparkles, AlertCircle, Heart, Play, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { getHealthInsight, getCaringAdvice } from '@/lib/gemini';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface AiHealthInsightProps {
    vitals: any;
}

const AiHealthInsight = ({ vitals }: AiHealthInsightProps) => {
    const { t } = useTranslation();
    const [insight, setInsight] = useState<string | null>(null);
    const [advice, setAdvice] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Audio states
    const bgmRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const fetchInsight = async () => {
            // Don't fetch if no vitals are available yet
            if (!vitals || Object.keys(vitals).length === 0) {
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch both general insight and specific caring advice in parallel
                const [insightText, adviceText] = await Promise.all([
                    getHealthInsight(vitals),
                    getCaringAdvice(vitals)
                ]);
                setInsight(insightText);
                setAdvice(adviceText);
            } catch (err: any) {
                setError(err.message || 'Failed to generate health insight.');
            } finally {
                setLoading(false);
            }
        };

        fetchInsight();
    }, [vitals]);

    const playAdvice = () => {
        if (!advice) return;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsPlaying(true);

            // Start background music
            if (bgmRef.current) {
                bgmRef.current.volume = 0.15; // soft volume
                bgmRef.current.play().catch(console.error);
            }

            // Create a single utterance but sprinkle SSML-like punctuation for rhythm
            // The browser's native TTS will naturally pause on periods.
            const songLikeText = advice.replace(/,/g, '...').replace(/\n/g, '. ... ');

            const utterance = new SpeechSynthesisUtterance(songLikeText);

            utterance.pitch = 1.3; // Higher, melodic pitch
            utterance.rate = 0.85; // Slower rate to stretch vowels

            // Try to find a high-quality female voice
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v =>
                v.name.includes('Female') ||
                v.name.includes('Zira') ||
                v.name.includes('Samantha') ||
                v.name.includes('Victoria')
            );

            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }

            utterance.onend = () => {
                setIsPlaying(false);
                if (bgmRef.current) {
                    bgmRef.current.pause();
                    bgmRef.current.currentTime = 0;
                }
            };

            utterance.onerror = (e) => {
                console.error('SpeechSynthesis error:', e);
                setIsPlaying(false);
                if (bgmRef.current) {
                    bgmRef.current.pause();
                }
            };

            // Small delay to ensure synthesis is ready
            setTimeout(() => {
                window.speechSynthesis.speak(utterance);
            }, 100);
        }
    };

    const stopAdvice = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);

            if (bgmRef.current) {
                bgmRef.current.pause();
                bgmRef.current.currentTime = 0;
            }
        }
    };

    if (!vitals || Object.keys(vitals).length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5 mb-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20"
        >
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-foreground">{t('dashboard.aiIntelligence')}</h3>
            </div>

            {loading ? (
                <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
                    <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                </div>
            ) : error ? (
                <div className="flex items-start gap-2 text-warning text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            ) : (
                <p className="text-sm text-foreground leading-relaxed">{insight}</p>
            )}

            {/* Hidden Audio Players */}
            <audio ref={bgmRef} loop src="https://actions.google.com/sounds/v1/water/lake_waves_2.ogg" />

            {/* Caring Advice Section */}
            {!loading && advice && (
                <div className="mt-6 pt-5 border-t border-border/50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Heart className="w-5 h-5 text-primary fill-primary/20" />
                            </div>
                            <p className="text-foreground font-medium italic text-sm">
                                "{advice}"
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                variant={isPlaying ? "outline" : "default"}
                                size="sm"
                                onClick={playAdvice}
                                className="gap-2"
                            >
                                <Play className="w-4 h-4" />
                                {t('dashboard.play', 'Play Song')}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={stopAdvice}
                                disabled={!isPlaying}
                                className="gap-2"
                            >
                                <Square className="w-4 h-4" /> {t('dashboard.stop', 'Stop')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AiHealthInsight;
