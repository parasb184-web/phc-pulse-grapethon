// frontend/src/data/citizenFlashcards.js

export const citizenFlashcards = [
  {
    id: "fever",
    icon: "🌡️",
    title: { en: "Fever Basics", hi: "बुखार की बेसिक जानकारी" },
    bullets: {
      en: [
        "Drink water/ORS and rest.",
        "Keep a light diet.",
        "Check temperature if possible.",
      ],
      hi: [
        "पानी/ORS पिएँ और आराम करें।",
        "हल्का भोजन करें।",
        "संभव हो तो तापमान जाँचें।",
      ],
    },
    do: {
      en: ["Hydrate often", "Use light clothing", "Monitor symptoms"],
      hi: ["बार-बार पानी पिएँ", "हल्के कपड़े पहनें", "लक्षणों पर ध्यान दें"],
    },
    dont: {
      en: ["Do not overuse medicines", "Avoid self-medicating antibiotics"],
      hi: ["दवाओं का ज्यादा इस्तेमाल न करें", "एंटीबायोटिक खुद से न लें"],
    },
    visitPHC: {
      en: ["Fever persists > 2 days", "Very weak or dizzy"],
      hi: ["बुखार 2 दिन से ज्यादा रहे", "बहुत कमजोरी/चक्कर हो"],
    },
    emergency: {
      en: ["Trouble breathing", "Confusion/fainting", "Seizures"],
      hi: ["साँस में तकलीफ", "बेहोशी/बहुत उलझन", "दौरे"],
    },
  },

  {
    id: "diarrhoea",
    icon: "🚿",
    title: { en: "Diarrhoea & ORS", hi: "दस्त और ORS" },
    bullets: {
      en: [
        "ORS helps prevent dehydration.",
        "Sip ORS frequently after loose stools.",
        "Watch for dehydration signs.",
      ],
      hi: [
        "ORS शरीर में पानी की कमी रोकने में मदद करता है।",
        "दस्त के बाद थोड़ा-थोड़ा ORS पिएँ।",
        "डिहाइड्रेशन के संकेत देखें।",
      ],
    },
    do: {
      en: ["Drink ORS/water", "Continue light food", "Wash hands"],
      hi: ["ORS/पानी पिएँ", "हल्का भोजन जारी रखें", "हाथ धोएँ"],
    },
    dont: {
      en: ["Avoid street food", "Do not ignore dehydration signs"],
      hi: ["बाहर का खाना न खाएँ", "पानी की कमी के संकेत न नजरअंदाज करें"],
    },
    visitPHC: {
      en: ["Diarrhoea > 1 day", "Blood in stool", "Severe weakness"],
      hi: ["दस्त 1 दिन से ज्यादा", "पाखाने में खून", "बहुत कमजोरी"],
    },
    emergency: {
      en: ["Very less urination", "Sunken eyes", "Unconsciousness"],
      hi: ["पेशाब बहुत कम", "आँखें धँसना", "बेहोशी"],
    },
  },

  {
    id: "coughcold",
    icon: "😷",
    title: { en: "Cough/Cold Care", hi: "खांसी/जुकाम देखभाल" },
    bullets: {
      en: [
        "Rest and warm fluids may help comfort.",
        "Cover mouth while coughing; use a mask if needed.",
        "Seek help if breathing becomes difficult.",
      ],
      hi: [
        "आराम करें और गर्म तरल लें।",
        "खांसते समय मुंह ढकें; जरूरत हो तो मास्क लगाएं।",
        "साँस में दिक्कत हो तो मदद लें।",
      ],
    },
    do: {
      en: ["Warm water/fluids", "Keep distance if sick", "Hand hygiene"],
      hi: ["गर्म पानी/तरल", "बीमार हों तो दूरी रखें", "हाथ साफ रखें"],
    },
    dont: {
      en: ["Do not share bottles/towels", "Avoid smoking"],
      hi: ["बोतल/तौलिया साझा न करें", "धूम्रपान से बचें"],
    },
    visitPHC: {
      en: ["High fever with cough", "Symptoms > 3 days"],
      hi: ["खांसी के साथ तेज बुखार", "लक्षण 3 दिन से ज्यादा"],
    },
    emergency: {
      en: ["Shortness of breath", "Chest pain", "Blue lips/face"],
      hi: ["साँस फूलना", "सीने में दर्द", "होंठ/चेहरा नीला पड़ना"],
    },
  },

  {
    id: "bp",
    icon: "🩺",
    title: { en: "Blood Pressure Awareness", hi: "ब्लड प्रेशर जागरूकता" },
    bullets: {
      en: [
        "Regular BP checks help detect issues early.",
        "Lifestyle changes can support BP control.",
        "Follow doctor advice if already on medicines.",
      ],
      hi: [
        "नियमित BP जाँच से समस्या जल्दी पता चलती है।",
        "जीवनशैली सुधार BP में मदद करता है।",
        "यदि दवा चल रही है तो डॉक्टर की सलाह मानें।",
      ],
    },
    do: {
      en: ["Walk/exercise", "Reduce excess salt", "Sleep well"],
      hi: ["टहलना/व्यायाम", "नमक कम करें", "अच्छी नींद लें"],
    },
    dont: {
      en: ["Do not stop prescribed medicines suddenly"],
      hi: ["डॉक्टर की दवा अचानक बंद न करें"],
    },
    visitPHC: {
      en: ["Headache with high BP readings", "Dizziness often"],
      hi: ["BP बढ़ा हो और सिरदर्द", "बार-बार चक्कर"],
    },
    emergency: {
      en: ["Severe chest pain", "Severe weakness on one side", "Severe breathlessness"],
      hi: ["बहुत तेज सीने में दर्द", "एक तरफ कमजोरी", "बहुत ज्यादा साँस फूलना"],
    },
  },

  {
    id: "medicineSafety",
    icon: "💊",
    title: { en: "Medicine Safety", hi: "दवाओं की सुरक्षा" },
    bullets: {
      en: [
        "Take medicines only as advised by a qualified clinician.",
        "Avoid antibiotics without prescription.",
        "Keep medicines away from children.",
      ],
      hi: [
        "दवाएं केवल योग्य डॉक्टर/क्लिनिशियन की सलाह से लें।",
        "एंटीबायोटिक बिना सलाह के न लें।",
        "दवाएं बच्चों से दूर रखें।",
      ],
    },
    do: {
      en: ["Read labels", "Store as directed", "Ask PHC pharmacist when unsure"],
      hi: ["लेबल पढ़ें", "सही तरीके से रखें", "शंका हो तो फार्मासिस्ट से पूछें"],
    },
    dont: {
      en: ["Do not share prescription medicines", "Don’t mix medicines randomly"],
      hi: ["प्रिस्क्रिप्शन दवा साझा न करें", "दवाएं मनमर्जी से न मिलाएं"],
    },
    visitPHC: {
      en: ["Side effects after medicine", "Missed doses confusion"],
      hi: ["दवा से दिक्कत/एलर्जी", "डोज़ भूलने की समस्या"],
    },
    emergency: {
      en: ["Severe allergic reaction (swelling/breathing trouble)"],
      hi: ["तेज एलर्जी (सूजन/साँस में दिक्कत)"],
    },
  },

  {
    id: "stress",
    icon: "🧠",
    title: { en: "Stress Check-in", hi: "तनाव चेक-इन" },
    bullets: {
      en: [
        "Stress is common. Small steps can help.",
        "Try 60 seconds of slow breathing.",
        "If stress feels overwhelming, seek support.",
      ],
      hi: [
        "तनाव सामान्य है। छोटे कदम मदद कर सकते हैं।",
        "60 सेकंड धीमी साँस लें।",
        "बहुत ज्यादा लगे तो सहायता लें।",
      ],
    },
    do: {
      en: ["Talk to someone you trust", "Sleep and hydrate", "Take short breaks"],
      hi: ["विश्वसनीय व्यक्ति से बात करें", "नींद/पानी का ध्यान रखें", "छोटे ब्रेक लें"],
    },
    dont: {
      en: ["Do not isolate completely", "Avoid harmful substances"],
      hi: ["पूरी तरह अलग न हों", "हानिकारक चीजों से बचें"],
    },
    visitPHC: {
      en: ["Stress affects daily life", "Persistent anxiety/sadness"],
      hi: ["रोज़मर्रा पर असर", "लंबे समय से बेचैनी/उदासी"],
    },
    emergency: {
      en: ["If you feel unsafe or might harm yourself, seek urgent help immediately"],
      hi: ["अगर आप असुरक्षित महसूस करें या खुद को नुकसान का विचार आए, तुरंत सहायता लें"],
    },
  },
];