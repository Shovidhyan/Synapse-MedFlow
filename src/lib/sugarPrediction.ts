import Papa from 'papaparse';

const SUGAR_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1aT0qHpKQUcV7jelT12prvHdHzwuNl19_Wf_-N9F2-30/export?format=csv&gid=0';

export interface SugarDataPoint {
    timestamp: string;
    rValue: number;
    rNorm?: number;
    predictedGlucose?: number;
    status?: 'LOW' | 'NORMAL' | 'HIGH' | 'VERY HIGH';
}

export const fetchSugarData = async (): Promise<SugarDataPoint[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(SUGAR_SHEET_URL, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const rawData = results.data as any[];

                    // Parse valid data
                    let parsedData: SugarDataPoint[] = rawData
                        .filter(r => r.Timestamp && r.R)
                        .map(r => ({
                            timestamp: r.Timestamp,
                            rValue: parseFloat(r.R),
                        }))
                        .filter(r => !isNaN(r.rValue));

                    if (parsedData.length === 0) {
                        resolve([]);
                        return;
                    }

                    // Take last N rows for the trend (e.g., last 20 for chart)
                    // Based on notebook logic, normalize on the window of data
                    parsedData = parsedData.slice(-20);

                    const rValues = parsedData.map(d => d.rValue);
                    const minR = Math.min(...rValues);
                    const maxR = Math.max(...rValues);

                    const finalData = parsedData.map(d => {
                        const rNorm = maxR === minR ? 0 : (d.rValue - minR) / (maxR - minR);
                        const predictedGlucose = 90 + 50 * rNorm;

                        let status: SugarDataPoint['status'] = 'NORMAL';
                        if (predictedGlucose < 70) status = 'LOW';
                        else if (predictedGlucose <= 140) status = 'NORMAL';
                        else if (predictedGlucose <= 180) status = 'HIGH';
                        else status = 'VERY HIGH';

                        return {
                            ...d,
                            rNorm,
                            predictedGlucose: parseFloat(predictedGlucose.toFixed(1)),
                            status
                        };
                    });

                    resolve(finalData);
                } catch (err) {
                    reject(err);
                }
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};
