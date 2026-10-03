import { GoogleGenAI, Type } from '@google/genai';
import userModel from '../models/userModel.js';

// must match the speciality strings used in doctorModel / frontend filters
const SPECIALITIES = ['General physician', 'Gynecologist', 'Dermatologist', 'Pediatricians', 'Neurologist', 'Gastroenterologist'];
const URGENCY = ['low', 'moderate', 'high'];

const SYSTEM_PROMPT = `You are the symptom triage assistant for CareSync, a doctor appointment booking app.
Your only job is to suggest which kind of specialist the patient should book.
Rules:
- "speciality" and "alternative" MUST be exactly one of: ${SPECIALITIES.join(', ')}.
- Use "Pediatricians" when the patient is a child (under 16), "Gynecologist" for pregnancy, menstrual or female reproductive concerns.
- If unsure, choose "General physician".
- Do NOT diagnose, do NOT name diseases with certainty, do NOT recommend medicines or dosages.
- Set "emergency" to true for red-flag symptoms such as chest pain, difficulty breathing, stroke signs (face drooping, slurred speech, sudden weakness), severe bleeding, loss of consciousness, seizures, suicidal thoughts, or severe allergic reaction.
- "reason": 1-2 short, simple sentences explaining why this specialist fits.
- "tips": up to 3 short, safe self-care tips while waiting (e.g. rest, stay hydrated). No medicines.
- If the text is not about health symptoms, set "valid" to false.`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        valid: { type: Type.BOOLEAN },
        speciality: { type: Type.STRING, enum: SPECIALITIES },
        alternative: { type: Type.STRING, enum: SPECIALITIES },
        urgency: { type: Type.STRING, enum: URGENCY },
        emergency: { type: Type.BOOLEAN },
        reason: { type: Type.STRING },
        tips: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['valid', 'speciality', 'urgency', 'emergency', 'reason', 'tips'],
};

const calculateAge = (dob) => {
    const birth = new Date(dob);
    if (isNaN(birth)) return null;
    const age = new Date().getFullYear() - birth.getFullYear();
    return age >= 0 && age < 130 ? age : null;
}

let ai;
const getClient = () => {
    if (!ai) ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return ai;
}

// free tier often returns 503 (overloaded) or 429 (rate limit) - retry, then switch to the fallback model
const generateWithRetry = async (request, attempts = 2) => {
    const models = [process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite', process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.8-flash']
    let lastError
    for (const model of models) {
        for (let i = 1; i <= attempts; i++) {
            try {
                return await getClient().models.generateContent({ ...request, model })
            } catch (error) {
                if (![429, 500, 503].includes(error.status)) throw error
                lastError = error
                if (i < attempts) await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }
    }
    throw lastError
}

// API to recommend a speciality from patient symptoms
const symptomCheck = async (req, res) => {
    try {
        const { userId, duration } = req.body;
        const symptoms = (req.body.symptoms || '').trim();

        if (symptoms.length < 10) {
            return res.json({ success: false, message: "Please describe your symptoms in a bit more detail" })
        }
        if (symptoms.length > 500) {
            return res.json({ success: false, message: "Please keep the description under 500 characters" })
        }
        if (!process.env.GEMINI_API_KEY) {
            return res.json({ success: false, message: "AI service is not configured" })
        }

        const user = await userModel.findById(userId).select('dob gender')
        const age = user ? calculateAge(user.dob) : null
        const gender = user && user.gender !== 'Not Selected' ? user.gender : 'unknown'

        const prompt = `Patient age: ${age ?? 'unknown'}
Patient gender: ${gender}
Duration: ${duration || 'not specified'}
Symptoms: ${symptoms}`

        const response = await generateWithRetry({
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: 'application/json',
                responseSchema,
                temperature: 0.2,
            },
        })

        const data = JSON.parse(response.text)

        if (!data.valid) {
            return res.json({ success: false, message: "That doesn't look like a description of symptoms. Please try again." })
        }

        // never trust model output blindly
        const result = {
            speciality: SPECIALITIES.includes(data.speciality) ? data.speciality : 'General physician',
            alternative: SPECIALITIES.includes(data.alternative) && data.alternative !== data.speciality ? data.alternative : null,
            urgency: URGENCY.includes(data.urgency) ? data.urgency : 'moderate',
            emergency: data.emergency === true,
            reason: String(data.reason || '').slice(0, 400),
            tips: Array.isArray(data.tips) ? data.tips.slice(0, 3).map(t => String(t).slice(0, 150)) : [],
        }

        res.json({ success: true, result })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "AI service is busy right now, please try again shortly" })
    }
}

export { symptomCheck }
