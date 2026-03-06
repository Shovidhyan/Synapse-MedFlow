import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import Papa from 'papaparse';
import { useTranslation } from 'react-i18next';

interface RecordType {
    time: string;
    Temp: string;
    HR: string;
    SpO2: string;
}

interface Props {
    data: RecordType[];
}

const ReportDownloader = ({ data }: Props) => {
    const { t } = useTranslation();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleDownload = () => {
        if (!startDate || !endDate) {
            toast.error('Please select both start and end dates');
            return;
        }

        const start = startOfDay(new Date(startDate));
        const end = endOfDay(new Date(endDate));

        const filteredData = data.filter(row => {
            const rowDate = new Date(row.time);
            if (isNaN(rowDate.getTime())) return false;
            return isWithinInterval(rowDate, { start, end });
        });

        if (filteredData.length === 0) {
            toast.warning('No records found for this date range');
            return;
        }

        const csvStr = Papa.unparse(filteredData);
        const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `vitals_report_${format(start, 'yyyy-MM-dd')}_to_${format(end, 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Report downloaded successfully!');
    };

    return (
        <div className="glass-card p-5 mt-6 border border-border">
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex shrink-0 items-center justify-center text-primary-foreground">
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-heading font-bold text-lg text-foreground">{t('dashboard.downloadReport')}</h3>
                    <p className="text-xs text-muted-foreground">{t('dashboard.exportDesc')}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full space-y-1">
                    <label className="text-xs font-medium text-foreground">{t('dashboard.startDate')}</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                    />
                </div>
                <div className="flex-1 w-full space-y-1">
                    <label className="text-xs font-medium text-foreground">{t('dashboard.endDate')}</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                    />
                </div>
                <Button onClick={handleDownload} className="w-full sm:w-auto h-10 mt-3 sm:mt-0 gap-2 font-semibold">
                    <Download className="w-4 h-4" /> {t('dashboard.downloadCsv')}
                </Button>
            </div>
        </div>
    );
};

export default ReportDownloader;
