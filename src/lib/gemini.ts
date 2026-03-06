import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Gemini AI client only if the API key is present
export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getHealthInsight = async (vitalsData: any) => {
    if (!ai) {
        throw new Error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    const prompt = `
You are an expert AI health assistant. You are reviewing the recent vitals of a patient.
Based on the following vital signs, provide a short, encouraging, and easy-to-understand health insight or recommendation for the patient.
Keep the insight concise (2-3 sentences max) and user-friendly. Do NOT give medical diagnoses; rather, focus on wellness and general observations.

Recent Vitals:
${JSON.stringify(vitalsData, null, 2)}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Error fetching insight from Gemini:', error);
        throw error;
    }
};

export const getSugarTrendInsight = async (sugarData: number[]) => {
    if (!ai) {
        throw new Error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    const prompt = `
You are an expert AI health assistant. You are reviewing a patient's recent predicted blood sugar (glucose) levels over time.
The data points are given in chronological order (oldest to newest):
[${sugarData.join(', ')}]

Based on this trend, provide a very short, specific, and encouraging insight (1-2 sentences).
Tell the user if their sugar level is trending smaller, staying stable, or getting bigger, and what that might mean for them today.
Keep the tone friendly and do not provide medical diagnoses.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Error fetching sugar trend insight from Gemini:', error);
        throw error;
    }
};

export const getCaringAdvice = async (vitalsData: any) => {
    if (!ai) {
        throw new Error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    const prompt = `
You are an empathetic, world-class pop songwriter (like Selena Gomez). The patient is looking at their dashboard right now.
Based on the following vital signs:
${JSON.stringify(vitalsData, null, 2)}

Write a beautiful, deeply comforting 4-line rhyming song or lullaby emphasizing that they are the backbone of their family, and they must take care of their health.
Make it deeply rhythmic and poetic. Use terms of endearment and a gentle tone. 
DO NOT give medical advice or list their vitals. Just pure emotional support and motivation for their well-being.
DO NOT include any labels like "Verse 1" or "Chorus". Just provide the 4 lines of lyrics separated by commas or periods so a text-to-speech engine reads it with a rhythmic pause.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Error fetching caring advice from Gemini:', error);
        throw error;
    }
};
