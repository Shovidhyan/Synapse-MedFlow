import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const en = {
    translation: {
        navbar: {
            getStarted: "Get Started"
        },
        auth: {
            backToRole: "Back to Role Selection",
            signIn: "Sign In",
            signUp: "Sign Up",
            doctorSignInDesc: "Enter your credentials to access your doctor portal",
            doctorSignUpDesc: "Sign up to create your doctor account",
            patientSignInDesc: "Enter your credentials to access your patient portal",
            patientSignUpDesc: "Sign up to create your patient account",
            staffSignInDesc: "Enter your credentials to access your staff portal",
            staffSignUpDesc: "Sign up to create your staff account",
            caretakerSignInDesc: "Enter your credentials to access your caretaker portal",
            caretakerSignUpDesc: "Sign up to create your caretaker account",
            caregiverSignInDesc: "Enter your credentials to access your caregiver portal",
            caregiverSignUpDesc: "Sign up to create your caregiver account",
            email: "Email",
            emailPlaceholder: "name@example.com",
            password: "Password",
            processing: "Processing...",
            noAccount: "Don't have an account? ",
            hasAccount: "Already have an account? ",
            loginSuccess: "Successfully logged in as ",
            signupSuccess: " account created! Welcome to Synapse MedFlow.",
            authFailed: "Authentication failed"
        },
        login: {
            title: "Welcome to Synapse MedFlow",
            subtitle: "Select your role to access your personalized portal",
            patient: "Patient",
            patientDesc: "View your health records, schedule appointments, and connect with doctors.",
            doctor: "Doctor",
            doctorDesc: "Manage patients, view AI insights, and conduct telehealth visits.",
            staff: "Monitoring Staff",
            staffDesc: "Monitor patient vitals, manage alerts, and coordinate care.",
            caretaker: "Caretaker",
            caretakerDesc: "Monitor and manage care for your registered dependents.",
            caregiver: "Caregiver",
            caregiverDesc: "Track assigned patients, log visits, and report status updates."
        },
        dashboard: {
            greeting: "Good Morning",
            summary: "Here's your daily health summary",
            today: "Today",
            overview: "Overview",
            appointments: "Appointments",
            aiJobs: "AI Jobs",
            overallStatus: "Overall Status",
            good: "Good",
            medications: "Medications",
            takenCount: "{{taken}}/{{total}} taken",
            symptoms: "Symptoms",
            noneReported: "None reported",
            liveVitals: "Live Vitals",
            vitalsTrend: "Vitals Trend (Today)",
            weeklyAdherence: "Weekly Adherence",
            todaysMedication: "Today's Medication",
            taken: "Taken",
            pending: "Pending",
            bookAppointment: "Book an Appointment",
            aiIntelligence: "AI Intelligence",
            heartRate: "Heart Rate",
            temperature: "Temperature",
            bloodPressure: "Blood Pressure",
            predictedBloodSugar: "Predicted Blood Sugar",
            status: "Status",
            aiTrendAnalysis: "AI Trend Analysis",
            recentTrend: "Recent Trend (Model Inference)",
            downloadReport: "Download Health Report",
            exportDesc: "Export your real-time vitals history as a CSV file by date range",
            startDate: "Start Date",
            endDate: "End Date",
            downloadCsv: "Download CSV",
            selectDoctor: "Select Doctor",
            appointmentType: "AppointmentType",
            online: "Online",
            inPerson: "In-person",
            selectDate: "Select Date",
            availableSlots: "Available Slots",
            book: "Book",
            selectTimeSlot: "Select a time slot",
            appointmentConfirmed: "Appointment Confirmed!",
            onlineConsultation: "Online Consultation",
            inPersonVisit: "In-person Visit",
            bookAnother: "Book Another"
        }
    }
};

// Tamil translations
const ta = {
    translation: {
        navbar: {
            getStarted: "தொடங்கவும்"
        },
        auth: {
            backToRole: "பங்கு தேர்வுக்கு திரும்புக",
            signIn: "உள்நுழைக",
            signUp: "பதிவு செய்க",
            doctorSignInDesc: "உங்கள் மருத்துவர் போர்ட்டலை அணுக உங்கள் சான்றுகளை உள்ளிடவும்",
            doctorSignUpDesc: "உங்கள் மருத்துவர் கணக்கை உருவாக்க பதிவு செய்யவும்",
            patientSignInDesc: "உங்கள் நோயாளிகளின் போர்ட்டலை அணுக சான்றுகளை உள்ளிடவும்",
            patientSignUpDesc: "உங்கள் நோயாளி கணக்கை உருவாக்க பதிவு செய்யவும்",
            staffSignInDesc: "உங்கள் பணியாளர் போர்ட்டலை அணுக சான்றுகளை உள்ளிடவும்",
            staffSignUpDesc: "உங்கள் பணியாளர் கணக்கை உருவாக்க பதிவு செய்யவும்",
            caretakerSignInDesc: "உங்கள் பராமரிப்பாளர் போர்ட்டலை அணுக சான்றுகளை உள்ளிடவும்",
            caretakerSignUpDesc: "உங்கள் பராமரிப்பாளர் கணக்கை உருவாக்க பதிவு செய்யவும்",
            caregiverSignInDesc: "பராமரிப்பு வழங்குநர் போர்ட்டலை அணுக சான்றுகளை உள்ளிடவும்",
            caregiverSignUpDesc: "பராமரிப்பு வழங்குநர் கணக்கை உருவாக்க பதிவு செய்யவும்",
            email: "மின்னஞ்சல்",
            emailPlaceholder: "பெயர்@example.com",
            password: "கடவுச்சொல்",
            processing: "செயலாக்கப்படுகிறது...",
            noAccount: "கணக்கு இல்லையா? ",
            hasAccount: "ஏற்கனவே கணக்கு உள்ளதா? ",
            loginSuccess: " வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள்!",
            signupSuccess: " கணக்கு உருவாக்கப்பட்டது! Synapse MedFlow-க்கு வரவேற்கிறோம்.",
            authFailed: "உள்நுழைவு தோல்வியடைந்தது"
        },
        login: {
            title: "Synapse MedFlow-க்கு வரவேற்கிறோம்",
            subtitle: "உங்கள் தனிப்பயனாக்கப்பட்ட போர்ட்டலை அணுக உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்",
            patient: "நோயாளி",
            patientDesc: "உங்கள் சுகாதாரப் பதிவுகளைக் காண்க, மருத்துவ சந்திப்புகளைத் திட்டமிடுக.",
            doctor: "மருத்துவர்",
            doctorDesc: "நோயாளிகளை நிர்வகிக்கவும் மற்றும் டிஜிட்டல் ஆலோசனைகளை வழங்கவும்.",
            staff: "கண்காணிப்பு பணியாளர்கள்",
            staffDesc: "நோயாளியின் முக்கியத் தரவுகளை கண்காணிக்கவும் மற்றும் எச்சரிக்கைகளை நிர்வகிக்கவும்.",
            caretaker: "பராமரிப்பாளர்",
            caretakerDesc: "உங்கள் சார்ந்தவர்களின் பராமரிப்பைக் கண்காணித்து நிர்வகிக்கவும்.",
            caregiver: "பராமரிப்பு வழங்குநர்",
            caregiverDesc: "ஒதுக்கப்பட்ட நோயாளிகளைக் கண்காணித்து வருகைகளைப் பதியவும்."
        },
        dashboard: {
            greeting: "காலை வணக்கம்",
            summary: "உங்கள் தினசரி சுகாதார சுருக்கம் இதோ",
            today: "இன்று",
            overview: "கண்ணோட்டம்",
            appointments: "சந்திப்புகள்",
            aiJobs: "செயற்கை நுண்ணறிவு பணிகள்",
            overallStatus: "ஒட்டுமொத்த நிலை",
            good: "நன்று",
            medications: "மருந்துகள்",
            takenCount: "{{taken}}/{{total}} எடுக்கப்பட்டது",
            symptoms: "அறிகுறிகள்",
            noneReported: "எதுவும் பதிவாகவில்லை",
            liveVitals: "நேரடி உடல் நிலை",
            vitalsTrend: "உடல் நிலை போக்கு (இன்று)",
            weeklyAdherence: "வாராந்திர பின்பற்றுதல்",
            todaysMedication: "இன்றைய மருந்துகள்",
            taken: "எடுக்கப்பட்டது",
            pending: "நிலுவையில் உள்ளது",
            bookAppointment: "சந்திப்பை பதிவு செய்ய",
            aiIntelligence: "செயற்கை நுண்ணறிவு",
            heartRate: "இதய துடிப்பு",
            temperature: "வெப்பநிலை",
            bloodPressure: "இரத்த அழுத்தம்",
            predictedBloodSugar: "கணிக்கப்பட்ட இரத்த சர்க்கரை",
            status: "நிலை",
            aiTrendAnalysis: "செயற்கை நுண்ணறிவு போக்கு பகுப்பாய்வு",
            recentTrend: "சமீபத்திய போக்கு (கணினி கணிப்பு)",
            downloadReport: "சுகாதார அறிக்கையை பதிவிறக்க",
            exportDesc: "உங்கள் நிகழ்நேர உடல் நிலை வரலாற்றை தேதி வரம்பின்படி CSV ஆக ஏற்றுமதி செய்க",
            startDate: "தொடக்க தேதி",
            endDate: "முடிவு தேதி",
            downloadCsv: "CSV பதிவிறக்க",
            selectDoctor: "மருத்துவரைத் தேர்ந்தெடுக்கவும்",
            appointmentType: "சந்திப்பு வகை",
            online: "ஆன்லைன்",
            inPerson: "நேரடி",
            selectDate: "தேதியைத் தேர்ந்தெடுக்கவும்",
            availableSlots: "கிடைக்கக்கூடிய நேரங்கள்",
            book: "பதிவு செய்",
            selectTimeSlot: "நேரத்தைத் தேர்ந்தெடுக்கவும்",
            appointmentConfirmed: "சந்திப்பு உறுதிசெய்யப்பட்டது!",
            onlineConsultation: "ஆன்லைன் ஆலோசனை",
            inPersonVisit: "நேரடி வருகை",
            bookAnother: "மேலும் ஒன்றை பதிவு செய்"
        }
    }
};

// Hindi translations
const hi = {
    translation: {
        navbar: {
            getStarted: "शुरू करें"
        },
        auth: {
            backToRole: "भूमिका चयन पर वापस जाएं",
            signIn: "लॉग इन करें",
            signUp: "साइन अप करें",
            doctorSignInDesc: "अपने डॉक्टर पोर्टल तक पहुंचने के लिए क्रेडेंशियल दर्ज करें",
            doctorSignUpDesc: "अपना डॉक्टर खाता बनाने के लिए साइन अप करें",
            patientSignInDesc: "अपने मरीज पोर्टल तक पहुंचने के लिए क्रेडेंशियल दर्ज करें",
            patientSignUpDesc: "अपना मरीज खाता बनाने के लिए साइन अप करें",
            staffSignInDesc: "अपने स्टाफ पोर्टल तक पहुंचने के लिए क्रेडेंशियल दर्ज करें",
            staffSignUpDesc: "अपना स्टाफ खाता बनाने के लिए साइन अप करें",
            caretakerSignInDesc: "अपने केयरटेकर पोर्टल तक पहुंचने के लिए क्रेडेंशियल दर्ज करें",
            caretakerSignUpDesc: "अपना केयरटेकर खाता बनाने के लिए साइन अप करें",
            caregiverSignInDesc: "अपने केयरगिवर पोर्टल तक पहुंचने के लिए क्रेडेंशियल दर्ज करें",
            caregiverSignUpDesc: "अपना केयरगिवर खाता बनाने के लिए साइन अप करें",
            email: "ईमेल",
            emailPlaceholder: "नाम@example.com",
            password: "पासवर्ड",
            processing: "प्रसंस्करण...",
            noAccount: "क्या आपका कोई खाता नहीं है? ",
            hasAccount: "क्या आपके पास पहले से खाता है? ",
            loginSuccess: " के रूप में सफलतापूर्वक लॉग इन किया गया!",
            signupSuccess: " खाता बनाया गया! Synapse MedFlow में आपका स्वागत है।",
            authFailed: "प्रमाणीकरण विफल"
        },
        login: {
            title: "Synapse MedFlow में आपका स्वागत है",
            subtitle: "अपने व्यक्तिगत पोर्टल तक पहुंचने के लिए अपनी भूमिका का चयन करें",
            patient: "मरीज़",
            patientDesc: "अपने स्वास्थ्य रिकॉर्ड देखें और अपॉइंटमेंट बुक करें।",
            doctor: "डॉक्टर",
            doctorDesc: "मरीजों का प्रबंधन करें और ऑनलाइन परामर्श संचालित करें।",
            staff: "निगरानी कर्मचारी",
            staffDesc: "मरीज़ के महत्वपूर्ण संकेतों की निगरानी करें और अलर्ट प्रबंधित करें।",
            caretaker: "केयरटेकर",
            caretakerDesc: "अपने आश्रितों की देखभाल की निगरानी और प्रबंधन करें।",
            caregiver: "केयरगिवर",
            caregiverDesc: "सौंपे गए मरीजों को ट्रैक करें, यात्राएं लॉग करें।"
        },
        dashboard: {
            greeting: "शुभ प्रभात",
            summary: "यहाँ आपका दैनिक स्वास्थ्य सारांश है",
            today: "आज",
            overview: "अवलोकन",
            appointments: "नियुक्तियाँ",
            aiJobs: "एआई कार्य",
            overallStatus: "समग्र स्थिति",
            good: "अच्छा",
            medications: "दवाएं",
            takenCount: "{{taken}}/{{total}} लिया गया",
            symptoms: "लक्षण",
            noneReported: "कोई रिपोर्ट नहीं",
            liveVitals: "लाइव महत्वपूर्ण डेटा",
            vitalsTrend: "डेटा रुझान (आज)",
            weeklyAdherence: "साप्ताहिक अनुपालन",
            todaysMedication: "आज की दवा",
            taken: "लिया गया",
            pending: "लंबित",
            bookAppointment: "अपॉइंटमेंट बुक करें",
            aiIntelligence: "एआई इंटेलिजेंस",
            heartRate: "हृदय गति",
            temperature: "तापमान",
            bloodPressure: "रक्तचाप",
            predictedBloodSugar: "अनुमानित रक्त शर्करा",
            status: "स्थिति",
            aiTrendAnalysis: "एआई रुझान विश्लेषण",
            recentTrend: "हालिया रुझान (मॉडल अनुमान)",
            downloadReport: "स्वास्थ्य रिपोर्ट डाउनलोड करें",
            exportDesc: "दिनांक सीमा के अनुसार अपने रीयल-टाइम महत्वपूर्ण इतिहास को सीएसवी फ़ाइल के रूप में निर्यात करें",
            startDate: "प्रारंभ तिथि",
            endDate: "अंतिम तिथि",
            downloadCsv: "सीएसवी डाउनलोड करें",
            selectDoctor: "डॉक्टर चुनें",
            appointmentType: "नियुक्ति का प्रकार",
            online: "ऑनलाइन",
            inPerson: "व्यक्तिगत रूप से",
            selectDate: "तारीख चुनें",
            availableSlots: "उपलब्ध स्लॉट",
            book: "बुक",
            selectTimeSlot: "एक समय स्लॉट चुनें",
            appointmentConfirmed: "अपॉइंटमेंट की पुष्टि हो गई!",
            onlineConsultation: "ऑनलाइन परामर्श",
            inPersonVisit: "व्यक्तिगत मुआयना",
            bookAnother: "एक और बुक करें"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en,
            ta,
            hi
        },
        lng: "en", // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
