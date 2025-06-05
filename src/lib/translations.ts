// src/lib/translations.ts

export interface Translations {
  appName: string;
  // AppShell Nav
  navHome: string;
  navSounds: string;
  navGenerateWords: string;
  navExercises: string;
  navConversations: string;
  navExams: string;
  navSupport: string;
  navDonate: string;
  navSettings: string;
  navLogout: string;
  // Settings Page
  settingsTitle: string;
  settingsDescription: string;
  settingsApplyChanges: string;
  settingsWordGenerationTitle: string;
  settingsNumWordsLabel: string;
  settings3Words: string;
  settings5Words: string;
  settingsDefault: string;
  settingsNumWordsDescription: string;
  settingsTargetLanguageTitle: string;
  settingsSelectTargetLanguage: string;
  settingsTargetLanguageDescription: string;
  settingsTargetFieldTitle: string;
  settingsSelectTargetField: string;
  settingsTargetFieldDescription: string;
  settingsAccessibilityTitle: string;
  settingsEnableAccessibilityAidsLabel: string;
  settingsEnableAccessibilityAidsDescription: string;
  settingsAppLanguageTitle: string;
  settingsSelectAppLanguage: string;
  settingsAppLanguageDescription: string;
  settingsAccountSecurityTitle: string;
  settingsChangePasswordButton: string;
  settingsChangePasswordDescription: string;
  settingsConceptualControl: string;
  settingsSaveButton: string;
  settingsSavingButton: string;
  settingsMoreSettingsSoon: string;
  settingsReturnToHomeButton: string;
  // Toasts
  toastSettingsSavedTitle: string;
  toastSettingsSavedDescription: string;
  toastSettingsSavedDescriptionConceptual: string;
  toastSettingsSavedDescriptionPremium: (langLabel: string) => string;
  // Other
  loading: string;
  loginRequiredTitle: string;
  loginRequiredDescription: string;
  goToLoginButton: string;
  error: string;
  // Conversations Page
  conversationsTitle: string;
  conversationsDescription: string;
  conversationsSelectLanguageLabel: string;
  conversationsSelectWordsLabel: string;
  conversationsGenerateButton: string;
  conversationsGeneratingButton: string;
  conversationsErrorSelectWords: string;
  conversationsGeneratedTitle: string;
  conversationsAlertNoWords: (langLabel: string) => string;
  conversationsAlertGoToWords: string;
  // Words Page (LearnClientPage)
  wordsTitle: string;
  wordsGeneratingForLabel: (lang: string, field: string) => string;
  wordsChangePreferencesLink: string;
  wordsPreviouslyGeneratedTitle: string;
  wordsAccordionTriggerLabel: (date: string, count: number) => string;
  wordsAlertNoHistory: (lang: string, field: string) => string;
  wordsGenerateNewSetButton: (count: number) => string;
  wordsGeneratingNewSetButton: string;
  wordsYourNewSetTitle: string;
  wordsListenToWordButton: string;
  wordsExampleSentenceTitle: string;
  wordsSetPreferencesPromptTitle: string;
  wordsSetPreferencesPromptDescription: string;
  wordsGoToSettingsButton: string;
}

export const translations: Record<"en" | "ar", Translations> = {
  en: {
    appName: "LinguaLeap",
    navHome: "Home",
    navSounds: "Sounds",
    navGenerateWords: "Generate Words",
    navExercises: "Exercises",
    navConversations: "Conversations",
    navExams: "Exams",
    navSupport: "Support",
    navDonate: "Donate",
    navSettings: "Settings",
    navLogout: "Logout",
    settingsTitle: "Settings",
    settingsDescription: "Customize your LinguaLeap experience.",
    settingsApplyChanges: "Click \"Save Settings\" to apply changes.",
    settingsWordGenerationTitle: "Word Generation",
    settingsNumWordsLabel: "Number of words per generation:",
    settings3Words: "3 Words",
    settings5Words: "5 Words",
    settingsDefault: "(Default)",
    settingsNumWordsDescription: "Choose how many words (each with a sentence) are generated at a time.",
    settingsTargetLanguageTitle: "Target Language",
    settingsSelectTargetLanguage: "Select target language...",
    settingsTargetLanguageDescription: "Select your primary language for learning new words and phrases.",
    settingsTargetFieldTitle: "Target Field of Knowledge",
    settingsSelectTargetField: "Select target field...",
    settingsTargetFieldDescription: "Choose a specific area or topic you want to focus your vocabulary on.",
    settingsAccessibilityTitle: "Accessibility",
    settingsEnableAccessibilityAidsLabel: "Enable Visual & Text-Based Learning Aids",
    settingsEnableAccessibilityAidsDescription: "When enabled, the app may provide more visual cues, detailed text descriptions, or alternative ways to interact with content, beneficial for users with hearing impairments or those who prefer text/visual learning. (This is a conceptual control).",
    settingsAppLanguageTitle: "App Display Language",
    settingsSelectAppLanguage: "Select app language...",
    settingsAppLanguageDescription: "Choose your preferred display language for the LinguaLeap interface. English and Arabic are free. Other languages are premium features.",
    settingsAccountSecurityTitle: "Account Security",
    settingsChangePasswordButton: "Change Password",
    settingsChangePasswordDescription: "Secure your account by updating your password.",
    settingsConceptualControl: "(This is a conceptual control for now.)",
    settingsSaveButton: "Save Settings",
    settingsSavingButton: "Saving...",
    settingsMoreSettingsSoon: "More settings for exercise timers and notifications will be available here soon.",
    settingsReturnToHomeButton: "Return to Home",
    toastSettingsSavedTitle: "Settings Saved!",
    toastSettingsSavedDescription: "Your preferences have been updated.",
    toastSettingsSavedDescriptionConceptual: (langLabel: string) => `Note: App display language change to ${langLabel} is currently conceptual and will not yet change the interface language.`,
    toastSettingsSavedDescriptionPremium: (langLabel: string) => `${langLabel} is a premium feature. Please upgrade to use it as your display language. Your preference has been saved, but the interface language will not change yet.`,
    loading: "Loading...",
    loginRequiredTitle: "Login Required",
    loginRequiredDescription: "Please log in to access this page.",
    goToLoginButton: "Go to Login",
    error: "Error",
    conversationsTitle: "Create a Conversation",
    conversationsDescription: "Select a language and some words you've learned to generate a practice conversation.",
    conversationsSelectLanguageLabel: "Select Language:",
    conversationsSelectWordsLabel: "Select Words (min. 2):",
    conversationsGenerateButton: "Generate Conversation",
    conversationsGeneratingButton: "Generating...",
    conversationsErrorSelectWords: "Please select a language and at least two words.",
    conversationsGeneratedTitle: "Generated Conversation:",
    conversationsAlertNoWords: (langLabel: string) => `You haven't generated any words in ${langLabel} yet.`,
    conversationsAlertGoToWords: "Words section",
    wordsTitle: "Word Learning Sets",
    wordsGeneratingForLabel: (lang, field) => `Generating words for: ${lang} in ${field}.`,
    wordsChangePreferencesLink: "Change preferences in settings",
    wordsPreviouslyGeneratedTitle: "Previously Generated Sets",
    wordsAccordionTriggerLabel: (date, count) => `Generated ${date} (${count} items)`,
    wordsAlertNoHistory: (lang, field) => `No previously generated word sets found for ${lang} - ${field}.`,
    wordsGenerateNewSetButton: (count) => `Generate New ${count}-Word Set`,
    wordsGeneratingNewSetButton: "Generating New Set...",
    wordsYourNewSetTitle: "Your Newly Generated Set:",
    wordsListenToWordButton: "Listen to Word",
    wordsExampleSentenceTitle: "Example Sentence:",
    wordsSetPreferencesPromptTitle: "Set Your Preferences",
    wordsSetPreferencesPromptDescription: "Please set your preferred target language and field of knowledge in the Settings page before generating word sets.",
    wordsGoToSettingsButton: "Go to Settings",
  },
  ar: {
    appName: "لينجوا ليب",
    navHome: "الرئيسية",
    navSounds: "الأصوات",
    navGenerateWords: "توليد الكلمات",
    navExercises: "تمارين",
    navConversations: "محادثات",
    navExams: "امتحانات",
    navSupport: "الدعم",
    navDonate: "تبرع",
    navSettings: "الإعدادات",
    navLogout: "تسجيل الخروج",
    settingsTitle: "الإعدادات",
    settingsDescription: "خصص تجربتك في لينجوا ليب.",
    settingsApplyChanges: "انقر على \"حفظ الإعدادات\" لتطبيق التغييرات.",
    settingsWordGenerationTitle: "توليد الكلمات",
    settingsNumWordsLabel: "عدد الكلمات لكل عملية توليد:",
    settings3Words: "3 كلمات",
    settings5Words: "5 كلمات",
    settingsDefault: "(افتراضي)",
    settingsNumWordsDescription: "اختر عدد الكلمات (مع جملة لكل منها) التي يتم إنشاؤها في كل مرة.",
    settingsTargetLanguageTitle: "اللغة المستهدفة",
    settingsSelectTargetLanguage: "اختر اللغة المستهدفة...",
    settingsTargetLanguageDescription: "اختر لغتك الأساسية لتعلم كلمات وعبارات جديدة.",
    settingsTargetFieldTitle: "المجال المعرفي المستهدف",
    settingsSelectTargetField: "اختر المجال المستهدف...",
    settingsTargetFieldDescription: "اختر مجالًا أو موضوعًا محددًا تريد تركيز مفرداتك عليه.",
    settingsAccessibilityTitle: "إمكانية الوصول",
    settingsEnableAccessibilityAidsLabel: "تمكين الوسائل البصرية والنصية المساعدة للتعلم",
    settingsEnableAccessibilityAidsDescription: "عند التمكين، قد يوفر التطبيق المزيد من الإشارات المرئية، أوصاف نصية مفصلة، أو طرق بديلة للتفاعل مع المحتوى، مما يفيد المستخدمين الذين يعانون من ضعف السمع أو أولئك الذين يفضلون التعلم النصي/البصري. (هذا تحكم مفاهيمي).",
    settingsAppLanguageTitle: "لغة عرض التطبيق",
    settingsSelectAppLanguage: "اختر لغة عرض التطبيق...",
    settingsAppLanguageDescription: "اختر لغة العرض المفضلة لواجهة لينجوا ليب. الإنجليزية والعربية مجانيتان. اللغات الأخرى هي ميزات مميزة.",
    settingsAccountSecurityTitle: "أمان الحساب",
    settingsChangePasswordButton: "تغيير كلمة المرور",
    settingsChangePasswordDescription: "قم بتأمين حسابك عن طريق تحديث كلمة المرور الخاصة بك.",
    settingsConceptualControl: "(هذا عنصر تحكم مفاهيمي حاليًا.)",
    settingsSaveButton: "حفظ الإعدادات",
    settingsSavingButton: "جاري الحفظ...",
    settingsMoreSettingsSoon: "المزيد من الإعدادات لمؤقتات التمارين والإشعارات ستكون متاحة هنا قريبًا.",
    settingsReturnToHomeButton: "العودة إلى الرئيسية",
    toastSettingsSavedTitle: "تم حفظ الإعدادات!",
    toastSettingsSavedDescription: "تم تحديث تفضيلاتك.",
    toastSettingsSavedDescriptionConceptual: (langLabel: string) => `ملاحظة: تغيير لغة عرض التطبيق إلى ${langLabel} هو حاليًا مفاهيمي ولن يغير لغة الواجهة بعد.`,
    toastSettingsSavedDescriptionPremium: (langLabel: string) => `${langLabel} هي ميزة مميزة. يرجى الترقية لاستخدامها كلغة عرض. تم حفظ تفضيلك، لكن لغة الواجهة لن تتغير بعد.`,
    loading: "جاري التحميل...",
    loginRequiredTitle: "تسجيل الدخول مطلوب",
    loginRequiredDescription: "يرجى تسجيل الدخول للوصول إلى هذه الصفحة.",
    goToLoginButton: "الذهاب إلى تسجيل الدخول",
    error: "خطأ",
    conversationsTitle: "إنشاء محادثة",
    conversationsDescription: "اختر لغة وبعض الكلمات التي تعلمتها لإنشاء محادثة تدريبية.",
    conversationsSelectLanguageLabel: "اختر اللغة:",
    conversationsSelectWordsLabel: "اختر الكلمات (2 على الأقل):",
    conversationsGenerateButton: "إنشاء محادثة",
    conversationsGeneratingButton: "جاري الإنشاء...",
    conversationsErrorSelectWords: "يرجى اختيار لغة وكلمتين على الأقل.",
    conversationsGeneratedTitle: "المحادثة التي تم إنشاؤها:",
    conversationsAlertNoWords: (langLabel: string) => `لم تقم بتوليد أي كلمات باللغة ${langLabel} بعد.`,
    conversationsAlertGoToWords: "قسم الكلمات",
    wordsTitle: "مجموعات تعلم الكلمات",
    wordsGeneratingForLabel: (lang, field) => `جاري توليد كلمات لـ: ${lang} في ${field}.`,
    wordsChangePreferencesLink: "تغيير التفضيلات في الإعدادات",
    wordsPreviouslyGeneratedTitle: "المجموعات التي تم إنشاؤها سابقًا",
    wordsAccordionTriggerLabel: (date, count) => `تم إنشاؤها ${date} (${count} عناصر)`,
    wordsAlertNoHistory: (lang, field) => `لم يتم العثور على مجموعات كلمات تم إنشاؤها سابقًا لـ ${lang} - ${field}.`,
    wordsGenerateNewSetButton: (count) => `إنشاء مجموعة جديدة من ${count} كلمات`,
    wordsGeneratingNewSetButton: "جاري إنشاء مجموعة جديدة...",
    wordsYourNewSetTitle: "مجموعتك التي تم إنشاؤها حديثًا:",
    wordsListenToWordButton: "استمع إلى الكلمة",
    wordsExampleSentenceTitle: "جملة مثال:",
    wordsSetPreferencesPromptTitle: "حدد تفضيلاتك",
    wordsSetPreferencesPromptDescription: "يرجى تحديد لغتك المستهدفة ومجال المعرفة المفضل في صفحة الإعدادات قبل إنشاء مجموعات الكلمات.",
    wordsGoToSettingsButton: "اذهب إلى الإعدادات",
  },
};

    