
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
  toastSettingsSavedDescriptionConceptual: (replacements: { langLabel: string }) => string;
  toastSettingsSavedDescriptionPremium: (replacements: { langLabel: string }) => string;
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
  conversationsAlertNoWords: (replacements: { langLabel: string }) => string;
  conversationsAlertGoToWords: string;
  // Words Page (LearnClientPage)
  wordsTitle: string;
  wordsGeneratingForLabel: (replacements: { lang: string, field: string }) => string;
  wordsChangePreferencesLink: string;
  wordsPreviouslyGeneratedTitle: string;
  wordsAccordionTriggerLabel: (replacements: { date: string, count: number }) => string;
  wordsAlertNoHistory: (replacements: { lang: string, field: string }) => string;
  wordsGenerateNewSetButton: (replacements: { count: number }) => string;
  wordsGeneratingNewSetButton: string;
  wordsYourNewSetTitle: string;
  wordsListenToWordButton: string;
  wordsExampleSentenceTitle: string;
  wordsSetPreferencesPromptTitle: string;
  wordsSetPreferencesPromptDescription: string;
  wordsGoToSettingsButton: string;
  wordsLoadingPreferences: string;
  wordsLoginRequiredDescription: string;
  wordsAlertNoHistoryTitle: string;
  wordsToastSuccessTitle: string;
  wordsToastSuccessDescription: (replacements: { count: number, field: string, lang: string }) => string;
  wordsToastLoggingFailedTitle: string;
  wordsToastLoggingFailedDescription: string;
  wordsToastLocalSaveTitle: string;
  wordsToastLocalSaveDescription: string;
  wordsToastGenerationFailedTitle: string;
  wordsToastLoginRequired: string;
  wordsToastSettingsIncompleteTitle: string;
  wordsToastSettingsIncompleteDescription: string;
  wordsSetPreferencesPromptDescriptionPart1: string;
  wordsSetPreferencesPromptLinkText: string;
  wordsSetPreferencesPromptDescriptionPart2: string;

  // Keys for full localization
  dashboardTitle: string;
  dashboardStatTotalWords: string;
  dashboardStatTotalWordsDesc: string;
  dashboardStatLanguages: string;
  dashboardStatLanguagesDesc: string;
  dashboardStatFields: string;
  dashboardStatFieldsDesc: string;
  dashboardStatSessions: string;
  dashboardStatSessionsDesc: string;
  dashboardOverviewTitle: string;
  dashboardOverviewDescription: string;
  dashboardChartNoData: string;
  dashboardRecentActivityTitle: string;
  dashboardRecentActivityDescription: string;
  dashboardRecentActivityEmpty: string;
  dashboardStartLearningLink: string;
  dashboardActivityJustNow: string;
  dashboardActivityWords: string;
  dashboardActivityGenerated: (replacements: { count: number, firstWord: string }) => string;
  dashboardActivityConversation: (replacements: { language: string }) => string;
  dashboardActivityConversationWords: (replacements: { words: string }) => string;
  dashboardDialogWordSetTitle: string;
  dashboardDialogWordSetDesc: (replacements: { field: string, language: string }) => string;
  dashboardDialogLanguage: string;
  dashboardDialogField: string;
  dashboardDialogEntries: string;
  dashboardDialogDate: string;
  dashboardDialogClose: string;
  dashboardDialogConversationTitle: string;
  dashboardDialogConversationDesc: (replacements: { language: string }) => string;
  dashboardDialogWordsUsed: string;
  dashboardDialogConversation: string;
  dashboardChartMetricWords: string;
  dashboardChartMetricLanguages: string;
  dashboardChartMetricFields: string;
  dashboardChartMetricSets: string;
  dashboardChartLabelCount: string;

  soundsTitle: (replacements: { language: string }) => string;
  soundsDescription: (replacements: { field: string }) => string;
  soundsLoadingPreferences: string;
  soundsPracticeTipTitle: string;
  soundsPracticeTipDescription: string;
  soundsNoWordsTitle: (replacements: { langLabel: string, fieldLabel: string }) => string;
  soundsNoWordsDescription: string;
  
  exercisesListTitle: string;
  exercisesListDescription: string;
  
  exerciseDetailLoading: string;
  exerciseDetailLoginRequired: string;
  exerciseDetailSetPreferences: string;
  exerciseDetailLoadingWords: string;
  exerciseDetailNoWordsTitle: (replacements: { langLabel: string, fieldLabel: string }) => string;
  exerciseDetailNoWordsDescription: string;
  exerciseDetailQuestionProgress: (replacements: { current: number, total: number }) => string;
  exerciseDetailInteractiveUnderConstruction: string;
  exerciseDetailPreviousButton: string;
  exerciseDetailNextButton: string;
  exerciseDetailFinishButton: string;
  exerciseDetailCompleteTitle: string;
  exerciseDetailCompleteDescription: string;
  exerciseDetailStartOverButton: string;
  exerciseDetailStartButton: string;
  exerciseDetailResumeTitle: string;
  exerciseDetailResumeDescription: string;
  exerciseDetailResumeButton: string;
  exerciseDetailBackToListButton: string;
  exerciseDetailTargetingLabel: string;
  
  examsListTitle: string;
  examsListDescription: string;
  examDetailUnderConstructionTitle: string;
  examDetailUnderConstructionDescription: string;
  examDetailBackToListButton: string;

  supportTitle: string;
  supportDescription: string;
  supportNoteTitle: string;
  supportNoteDescription: string;
  supportSuccessTitle: string;
  supportSuccessDescription: string;
  supportSubmitAnother: string;
  supportEmailLabel: string;
  supportSubjectLabel: string;
  supportSubjectPlaceholder: string;
  supportCategoryLabel: string;
  supportCategoryPlaceholder: string;
  supportDescriptionLabel: string;
  supportDescriptionPlaceholder: string;
  supportSubmitButton: string;
  supportSendingButton: string;
  supportFooterText: string;
  supportToastSuccessTitle: string;
  supportToastSuccessDescription: string;
  supportToastErrorTitle: string;
  supportPreviousRequestsTitle: string;
  supportLoadingTickets: string;
  supportNoTickets: string;
  supportTicketStatus: string;
  supportTicketDate: string;
  supportTicketCategory: string;
  supportTicketDescription: string;
  supportStatusOpen: string;
  supportStatusInProgress: string;
  supportStatusResolved: string;
  supportStatusClosed: string;

  donateTitle: string;
  donateDescription: string;
  donateNoteTitle: string;
  donateNoteDescription: string;
  donateAmountLabel: string;
  donateCustomAmount: string;
  donateCustomAmountLabel: string;
  donatePaymentMethodsTitle: string;
  donatePaymentMethodsDescription: string;
  donateButton: string;
  donateFooterText: string;
  donateToastInvalidAmountTitle: string;
  donateToastInvalidAmountDescription: string;
  donateToastThankYouTitle: string;
  donateToastThankYouDescription: (replacements: { amount: string }) => string;
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
    toastSettingsSavedDescriptionConceptual: ({ langLabel }) => `Note: App display language change to ${langLabel} is currently conceptual and will not yet change the interface language.`,
    toastSettingsSavedDescriptionPremium: ({ langLabel }) => `${langLabel} is a premium feature. Please upgrade to use it as your display language. Your preference has been saved, but the interface language will not change yet.`,
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
    conversationsAlertNoWords: ({ langLabel }) => `You haven't generated any words in ${langLabel} yet.`,
    conversationsAlertGoToWords: "Words section",
    wordsTitle: "Word Learning Sets",
    wordsGeneratingForLabel: ({ lang, field }) => `Generating words for: ${lang} in ${field}.`,
    wordsChangePreferencesLink: "Change preferences in settings",
    wordsPreviouslyGeneratedTitle: "Previously Generated Sets",
    wordsAccordionTriggerLabel: ({ date, count }) => `Generated ${date} (${count} items)`,
    wordsAlertNoHistory: ({ lang, field }) => `No previously generated word sets found for ${lang} - ${field}.`,
    wordsGenerateNewSetButton: ({ count }) => `Generate New ${count}-Word Set`,
    wordsGeneratingNewSetButton: "Generating New Set...",
    wordsYourNewSetTitle: "Your Newly Generated Set:",
    wordsListenToWordButton: "Listen to Word",
    wordsExampleSentenceTitle: "Example Sentence:",
    wordsSetPreferencesPromptTitle: "Set Your Preferences",
    wordsSetPreferencesPromptDescription: "Please set your preferred target language and field of knowledge in the Settings page before generating word sets.",
    wordsGoToSettingsButton: "Go to Settings",
    wordsLoadingPreferences: "Loading your preferences...",
    wordsLoginRequiredDescription: "Please log in to generate words and save your progress to your account.",
    wordsAlertNoHistoryTitle: "No History Yet",
    wordsToastSuccessTitle: "New Word Set Generated!",
    wordsToastSuccessDescription: ({ count, field, lang }) => `A new set of ${count} items for ${field} in ${lang} is ready.`,
    wordsToastLoggingFailedTitle: "Logging Failed",
    wordsToastLoggingFailedDescription: "Could not save activity to your account.",
    wordsToastLocalSaveTitle: "Activity Processed Locally",
    wordsToastLocalSaveDescription: "Log in to save progress permanently.",
    wordsToastGenerationFailedTitle: "Generation Failed",
    wordsToastLoginRequired: "Please log in to generate and save words.",
    wordsToastSettingsIncompleteTitle: "Settings Incomplete",
    wordsToastSettingsIncompleteDescription: "Please set your target language and field in Settings first.",
    wordsSetPreferencesPromptDescriptionPart1: "Please set your preferred target language and field of knowledge in the",
    wordsSetPreferencesPromptLinkText: "Settings page",
    wordsSetPreferencesPromptDescriptionPart2: "before generating word sets.",
    dashboardTitle: "Learning Dashboard",
    dashboardStatTotalWords: "Total Words Learned",
    dashboardStatTotalWordsDesc: "Unique words from generated sets.",
    dashboardStatLanguages: "Languages Explored",
    dashboardStatLanguagesDesc: "Unique languages practiced.",
    dashboardStatFields: "Fields Explored",
    dashboardStatFieldsDesc: "Topics covered in word sets.",
    dashboardStatSessions: "Total Sessions",
    dashboardStatSessionsDesc: "Word sets & conversations.",
    dashboardOverviewTitle: "Learning Overview",
    dashboardOverviewDescription: "A quick summary of your learning metrics.",
    dashboardChartNoData: "No data available for chart.",
    dashboardRecentActivityTitle: "Recent Activity",
    dashboardRecentActivityDescription: "Your last few sessions.",
    dashboardRecentActivityEmpty: "No recent activity yet.",
    dashboardStartLearningLink: "Start learning!",
    dashboardActivityJustNow: "Just now",
    dashboardActivityWords: "words",
    dashboardActivityGenerated: ({ count, firstWord }) => `Generated ${count} entries (${firstWord}...).`,
    dashboardActivityConversation: ({ language }) => `Conversation in ${language}`,
    dashboardActivityConversationWords: ({ words }) => `Words: ${words}.`,
    dashboardDialogWordSetTitle: "Word Set Details",
    dashboardDialogWordSetDesc: ({ field, language }) => `Session on ${field} in ${language}.`,
    dashboardDialogLanguage: "Language:",
    dashboardDialogField: "Field:",
    dashboardDialogEntries: "Entries:",
    dashboardDialogDate: "Date:",
    dashboardDialogClose: "Close",
    dashboardDialogConversationTitle: "Conversation Details",
    dashboardDialogConversationDesc: ({ language }) => `Conversation practice in ${language}.`,
    dashboardDialogWordsUsed: "Words Used:",
    dashboardDialogConversation: "Conversation:",
    dashboardChartMetricWords: "Words",
    dashboardChartMetricLanguages: "Languages",
    dashboardChartMetricFields: "Fields",
    dashboardChartMetricSets: "Sets",
    dashboardChartLabelCount: "Count",
    soundsTitle: ({ language }) => `Sounds in ${language}`,
    soundsDescription: ({ field }) => `Practice sounds for ${field}. Click speaker icons to hear words/sentences (feature coming soon).`,
    soundsLoadingPreferences: "Loading your preferences...",
    soundsPracticeTipTitle: "Practice Tip",
    soundsPracticeTipDescription: "Listen carefully. Try to repeat aloud. Generate more in the",
    soundsNoWordsTitle: ({ langLabel, fieldLabel }) => `No Words Yet for ${langLabel} - ${fieldLabel}`,
    soundsNoWordsDescription: "You haven't generated any words for this language and field combination yet. Go to the",
    exercisesListTitle: "Available Exercises",
    exercisesListDescription: "Select an exercise from the list below to start practicing.",
    exerciseDetailLoading: "Loading Exercise...",
    exerciseDetailLoginRequired: "Please log in to access exercises.",
    exerciseDetailSetPreferences: "Please set your target language and field in Settings to begin an exercise.",
    exerciseDetailLoadingWords: "Loading words...",
    exerciseDetailNoWordsTitle: ({ langLabel, fieldLabel }) => `No Words Available for ${langLabel} - ${fieldLabel}`,
    exerciseDetailNoWordsDescription: "You have not generated any words for this combination yet. Please go to the",
    exerciseDetailQuestionProgress: ({ current, total }) => `Question ${current} of ${total}`,
    exerciseDetailInteractiveUnderConstruction: "The interactive part of this exercise is under construction. For now, you can navigate through your words.",
    exerciseDetailPreviousButton: "Previous",
    exerciseDetailNextButton: "Next",
    exerciseDetailFinishButton: "Finish",
    exerciseDetailCompleteTitle: "Exercise Complete!",
    exerciseDetailCompleteDescription: "Great job! You've reviewed all the words.",
    exerciseDetailStartOverButton: "Start Over",
    exerciseDetailStartButton: "Start Exercise",
    exerciseDetailResumeTitle: "Resume Exercise?",
    exerciseDetailResumeDescription: "We found saved progress for this exercise. Would you like to continue where you left off or start over?",
    exerciseDetailResumeButton: "Resume",
    exerciseDetailBackToListButton: "Back to Exercises List",
    exerciseDetailTargetingLabel: "Targeting:",
    examsListTitle: "Language Exams & Assessments",
    examsListDescription: "Select an exam from the list below to prepare and test your skills.",
    examDetailUnderConstructionTitle: "This exam/assessment is currently under construction.",
    examDetailUnderConstructionDescription: "We're working hard to bring you this interactive assessment. Please check back soon!",
    examDetailBackToListButton: "Back to Exams List",
    supportTitle: "Get Support",
    supportDescription: "Have questions or need help? Fill out the form below and our team will get back to you as soon as possible.",
    supportNoteTitle: "System Note",
    supportNoteDescription: "This is a UI demonstration for a support ticket submission. No actual tickets are created or sent in this prototype.",
    supportSuccessTitle: "Request Submitted!",
    supportSuccessDescription: "Thank you for contacting us. We've received your request (conceptually) and will get back to you soon.",
    supportSubmitAnother: "Submit another request?",
    supportEmailLabel: "Your Email Address",
    supportSubjectLabel: "Subject",
    supportSubjectPlaceholder: "e.g., Issue with word generation",
    supportCategoryLabel: "Category",
    supportCategoryPlaceholder: "Select a category...",
    supportDescriptionLabel: "Details",
    supportDescriptionPlaceholder: "Please describe your issue or question in detail...",
    supportSubmitButton: "Submit Support Request",
    supportSendingButton: "Sending Request...",
    supportFooterText: "For urgent issues, please check our FAQ section (coming soon) or contact us directly if this form is unavailable.",
    supportToastSuccessTitle: "Request Submitted!",
    supportToastSuccessDescription: "Your support request has been sent successfully.",
    supportToastErrorTitle: "Submission Failed",
    supportPreviousRequestsTitle: "Your Previous Support Requests",
    supportLoadingTickets: "Loading your tickets...",
    supportNoTickets: "You haven't submitted any support requests yet.",
    supportTicketStatus: "Status",
    supportTicketDate: "Submitted",
    supportTicketCategory: "Category",
    supportTicketDescription: "Your Message",
    supportStatusOpen: "Open",
    supportStatusInProgress: "In Progress",
    supportStatusResolved: "Resolved",
    supportStatusClosed: "Closed",
    donateTitle: "Support LinguaLeap",
    donateDescription: "Your contribution empowers us to enhance LinguaLeap and help learners worldwide. Every donation makes a difference.",
    donateNoteTitle: "Important Note",
    donateNoteDescription: "This page is a UI demonstration for donation functionality. No actual payments are processed.",
    donateAmountLabel: "Choose Your Donation Amount (USD)",
    donateCustomAmount: "Custom",
    donateCustomAmountLabel: "Enter Custom Amount (USD):",
    donatePaymentMethodsTitle: "Supported Payment Methods",
    donatePaymentMethodsDescription: "We aim to support a wide range of secure payment gateways. (Icons below are for visual representation)",
    donateButton: "Donate Securely",
    donateFooterText: "Your support helps us continue developing LinguaLeap and providing valuable language learning tools to everyone. Thank you!",
    donateToastInvalidAmountTitle: "Invalid Amount",
    donateToastInvalidAmountDescription: "Please enter a valid custom donation amount.",
    donateToastThankYouTitle: "Thank You!",
    donateToastThankYouDescription: ({ amount }) => `Your generous $${amount} donation is appreciated. (This is a placeholder action)`,
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
    toastSettingsSavedDescriptionConceptual: ({ langLabel }) => `ملاحظة: تغيير لغة عرض التطبيق إلى ${langLabel} هو حاليًا مفاهيمي ولن يغير لغة الواجهة بعد.`,
    toastSettingsSavedDescriptionPremium: ({ langLabel }) => `${langLabel} هي ميزة مميزة. يرجى الترقية لاستخدامها كلغة عرض. تم حفظ تفضيلك، لكن لغة الواجهة لن تتغير بعد.`,
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
    conversationsAlertNoWords: ({ langLabel }) => `لم تقم بتوليد أي كلمات باللغة ${langLabel} بعد.`,
    conversationsAlertGoToWords: "قسم الكلمات",
    wordsTitle: "مجموعات تعلم الكلمات",
    wordsGeneratingForLabel: ({ lang, field }) => `جاري توليد كلمات لـ: ${lang} في ${field}.`,
    wordsChangePreferencesLink: "تغيير التفضيلات في الإعدادات",
    wordsPreviouslyGeneratedTitle: "المجموعات التي تم إنشاؤها سابقًا",
    wordsAccordionTriggerLabel: ({ date, count }) => `تم إنشاؤها ${date} (${count} عناصر)`,
    wordsAlertNoHistory: ({ lang, field }) => `لم يتم العثور على مجموعات كلمات تم إنشاؤها سابقًا لـ ${lang} - ${field}.`,
    wordsGenerateNewSetButton: ({ count }) => `إنشاء مجموعة جديدة من ${count} كلمات`,
    wordsGeneratingNewSetButton: "جاري إنشاء مجموعة جديدة...",
    wordsYourNewSetTitle: "مجموعتك التي تم إنشاؤها حديثًا:",
    wordsListenToWordButton: "استمع إلى الكلمة",
    wordsExampleSentenceTitle: "جملة مثال:",
    wordsSetPreferencesPromptTitle: "حدد تفضيلاتك",
    wordsSetPreferencesPromptDescription: "يرجى تحديد لغتك المستهدفة ومجال المعرفة المفضل في صفحة الإعدادات قبل إنشاء مجموعات الكلمات.",
    wordsGoToSettingsButton: "اذهب إلى الإعدادات",
    wordsLoadingPreferences: "جاري تحميل تفضيلاتك...",
    wordsLoginRequiredDescription: "يرجى تسجيل الدخول لتوليد الكلمات وحفظ تقدمك في حسابك.",
    wordsAlertNoHistoryTitle: "لا يوجد سجل حتى الآن",
    wordsToastSuccessTitle: "تم إنشاء مجموعة كلمات جديدة!",
    wordsToastSuccessDescription: ({ count, field, lang }) => `مجموعة جديدة من ${count} عناصر لـ ${field} في ${lang} جاهزة.`,
    wordsToastLoggingFailedTitle: "فشل التسجيل",
    wordsToastLoggingFailedDescription: "لم نتمكن من حفظ النشاط في حسابك.",
    wordsToastLocalSaveTitle: "تمت معالجة النشاط محليًا",
    wordsToastLocalSaveDescription: "سجل الدخول لحفظ التقدم بشكل دائم.",
    wordsToastGenerationFailedTitle: "فشل التوليد",
    wordsToastLoginRequired: "يرجى تسجيل الدخول لتوليد وحفظ الكلمات.",
    wordsToastSettingsIncompleteTitle: "الإعدادات غير مكتملة",
    wordsToastSettingsIncompleteDescription: "يرجى تعيين لغتك ومجالك المستهدفين في الإعدادات أولاً.",
    wordsSetPreferencesPromptDescriptionPart1: "يرجى تعيين لغتك المستهدفة ومجال المعرفة المفضل في",
    wordsSetPreferencesPromptLinkText: "صفحة الإعدادات",
    wordsSetPreferencesPromptDescriptionPart2: "قبل إنشاء مجموعات الكلمات.",
    dashboardTitle: "لوحة تحكم التعلم",
    dashboardStatTotalWords: "إجمالي الكلمات المكتسبة",
    dashboardStatTotalWordsDesc: "كلمات فريدة من المجموعات التي تم إنشاؤها.",
    dashboardStatLanguages: "اللغات المستكشفة",
    dashboardStatLanguagesDesc: "لغات فريدة تم التدرب عليها.",
    dashboardStatFields: "المجالات المستكشفة",
    dashboardStatFieldsDesc: "مواضيع تمت تغطيتها في مجموعات الكلمات.",
    dashboardStatSessions: "إجمالي الجلسات",
    dashboardStatSessionsDesc: "مجموعات كلمات ومحادثات.",
    dashboardOverviewTitle: "نظرة عامة على التعلم",
    dashboardOverviewDescription: "ملخص سريع لمقاييس التعلم الخاصة بك.",
    dashboardChartNoData: "لا توجد بيانات متاحة للرسم البياني.",
    dashboardRecentActivityTitle: "النشاط الأخير",
    dashboardRecentActivityDescription: "آخر جلساتك القليلة.",
    dashboardRecentActivityEmpty: "لا يوجد نشاط حديث حتى الآن.",
    dashboardStartLearningLink: "ابدأ التعلم!",
    dashboardActivityJustNow: "الآن",
    dashboardActivityWords: "كلمات",
    dashboardActivityGenerated: ({ count, firstWord }) => `تم إنشاء ${count} مدخلات (${firstWord}...).`,
    dashboardActivityConversation: ({ language }) => `محادثة باللغة ${language}`,
    dashboardActivityConversationWords: ({ words }) => `الكلمات: ${words}.`,
    dashboardDialogWordSetTitle: "تفاصيل مجموعة الكلمات",
    dashboardDialogWordSetDesc: ({ field, language }) => `جلسة عن ${field} باللغة ${language}.`,
    dashboardDialogLanguage: "اللغة:",
    dashboardDialogField: "المجال:",
    dashboardDialogEntries: "المدخلات:",
    dashboardDialogDate: "التاريخ:",
    dashboardDialogClose: "إغلاق",
    dashboardDialogConversationTitle: "تفاصيل المحادثة",
    dashboardDialogConversationDesc: ({ language }) => `ممارسة المحادثة باللغة ${language}.`,
    dashboardDialogWordsUsed: "الكلمات المستخدمة:",
    dashboardDialogConversation: "المحادثة:",
    dashboardChartMetricWords: "كلمات",
    dashboardChartMetricLanguages: "لغات",
    dashboardChartMetricFields: "مجالات",
    dashboardChartMetricSets: "مجموعات",
    dashboardChartLabelCount: "العدد",
    soundsTitle: ({ language }) => `الأصوات في ${language}`,
    soundsDescription: ({ field }) => `تدرب على الأصوات لـ ${field}. انقر على أيقونات السماعة لسماع الكلمات/الجمل (ميزة قادمة قريبًا).`,
    soundsLoadingPreferences: "جاري تحميل تفضيلاتك...",
    soundsPracticeTipTitle: "نصيحة للممارسة",
    soundsPracticeTipDescription: "استمع بعناية. حاول التكرار بصوت عالٍ. قم بإنشاء المزيد في قسم",
    soundsNoWordsTitle: ({ langLabel, fieldLabel }) => `لا توجد كلمات بعد لـ ${langLabel} - ${fieldLabel}`,
    soundsNoWordsDescription: "لم تقم بإنشاء أي كلمات لهذا المزيج من اللغة والمجال حتى الآن. اذهب إلى قسم",
    exercisesListTitle: "التمارين المتاحة",
    exercisesListDescription: "اختر تمرينًا من القائمة أدناه لبدء الممارسة.",
    exerciseDetailLoading: "جاري تحميل التمرين...",
    exerciseDetailLoginRequired: "يرجى تسجيل الدخول للوصول إلى التمارين.",
    exerciseDetailSetPreferences: "يرجى تحديد لغتك ومجالك المستهدفين في الإعدادات لبدء تمرين.",
    exerciseDetailLoadingWords: "جاري تحميل الكلمات...",
    exerciseDetailNoWordsTitle: ({ langLabel, fieldLabel }) => `لا توجد كلمات متاحة لـ ${langLabel} - ${fieldLabel}`,
    exerciseDetailNoWordsDescription: "لم تقم بإنشاء أي كلمات لهذا المزيج حتى الآن. يرجى الذهاب إلى قسم",
    exerciseDetailQuestionProgress: ({ current, total }) => `سؤال ${current} من ${total}`,
    exerciseDetailInteractiveUnderConstruction: "الجزء التفاعلي من هذا التمرين قيد الإنشاء. في الوقت الحالي، يمكنك التنقل بين كلماتك.",
    exerciseDetailPreviousButton: "السابق",
    exerciseDetailNextButton: "التالي",
    exerciseDetailFinishButton: "إنهاء",
    exerciseDetailCompleteTitle: "اكتمل التمرين!",
    exerciseDetailCompleteDescription: "عمل رائع! لقد راجعت كل الكلمات.",
    exerciseDetailStartOverButton: "البدء من جديد",
    exerciseDetailStartButton: "بدء التمرين",
    exerciseDetailResumeTitle: "استئناف التمرين؟",
    exerciseDetailResumeDescription: "وجدنا تقدمًا محفوظًا لهذا التمرين. هل ترغب في المتابعة من حيث توقفت أم البدء من جديد؟",
    exerciseDetailResumeButton: "استئناف",
    exerciseDetailBackToListButton: "العودة إلى قائمة التمارين",
    exerciseDetailTargetingLabel: "الاستهداف:",
    examsListTitle: "امتحانات وتقييمات اللغة",
    examsListDescription: "اختر امتحانًا من القائمة أدناه للتحضير واختبار مهاراتك.",
    examDetailUnderConstructionTitle: "هذا الامتحان/التقييم قيد الإنشاء حاليًا.",
    examDetailUnderConstructionDescription: "نحن نعمل بجد لنقدم لك هذا التقييم التفاعلي. يرجى التحقق مرة أخرى قريبًا!",
    examDetailBackToListButton: "العودة إلى قائمة الامتحانات",
    supportTitle: "احصل على الدعم",
    supportDescription: "لديك أسئلة أو تحتاج إلى مساعدة؟ املأ النموذج أدناه وسيقوم فريقنا بالرد عليك في أقرب وقت ممكن.",
    supportNoteTitle: "ملاحظة النظام",
    supportNoteDescription: "هذا عرض لواجهة المستخدم لتقديم تذكرة دعم. لا يتم إنشاء أو إرسال تذاكر فعلية في هذا النموذج الأولي.",
    supportSuccessTitle: "تم إرسال الطلب!",
    supportSuccessDescription: "شكرًا لتواصلك معنا. لقد تلقينا طلبك (بشكل مفاهيمي) وسنعود إليك قريبًا.",
    supportSubmitAnother: "إرسال طلب آخر؟",
    supportEmailLabel: "بريدك الإلكتروني",
    supportSubjectLabel: "الموضوع",
    supportSubjectPlaceholder: "مثال: مشكلة في توليد الكلمات",
    supportCategoryLabel: "الفئة",
    supportCategoryPlaceholder: "اختر فئة...",
    supportDescriptionLabel: "التفاصيل",
    supportDescriptionPlaceholder: "يرجى وصف مشكلتك أو سؤالك بالتفصيل...",
    supportSubmitButton: "إرسال طلب الدعم",
    supportSendingButton: "جاري إرسال الطلب...",
    supportFooterText: "للقضايا العاجلة، يرجى مراجعة قسم الأسئلة الشائعة (قريبًا) أو الاتصال بنا مباشرة إذا كان هذا النموذج غير متاح.",
    supportToastSuccessTitle: "تم إرسال الطلب!",
    supportToastSuccessDescription: "تم إرسال طلب الدعم الخاص بك بنجاح.",
    supportToastErrorTitle: "فشل الإرسال",
    supportPreviousRequestsTitle: "طلبات الدعم السابقة",
    supportLoadingTickets: "جاري تحميل تذاكرك...",
    supportNoTickets: "لم تقم بتقديم أي طلبات دعم بعد.",
    supportTicketStatus: "الحالة",
    supportTicketDate: "تاريخ الإرسال",
    supportTicketCategory: "الفئة",
    supportTicketDescription: "رسالتك",
    supportStatusOpen: "مفتوح",
    supportStatusInProgress: "قيد المعالجة",
    supportStatusResolved: "تم الحل",
    supportStatusClosed: "مغلق",
    donateTitle: "ادعم LinguaLeap",
    donateDescription: "مساهمتك تمكننا من تحسين LinguaLeap ومساعدة المتعلمين في جميع أنحاء العالم. كل تبرع يحدث فرقًا.",
    donateNoteTitle: "ملاحظة هامة",
    donateNoteDescription: "هذه الصفحة هي عرض لواجهة المستخدم لوظيفة التبرع. لا تتم معالجة أي مدفوعات فعلية.",
    donateAmountLabel: "اختر مبلغ التبرع (بالدولار الأمريكي)",
    donateCustomAmount: "مخصص",
    donateCustomAmountLabel: "أدخل المبلغ المخصص (بالدولار الأمريكي):",
    donatePaymentMethodsTitle: "طرق الدفع المدعومة",
    donatePaymentMethodsDescription: "نهدف إلى دعم مجموعة واسعة من بوابات الدفع الآمنة. (الأيقونات أدناه للعرض المرئي)",
    donateButton: "تبرع بأمان",
    donateFooterText: "دعمكم يساعدنا على مواصلة تطوير LinguaLeap وتوفير أدوات تعلم لغة قيمة للجميع. شكرًا لك!",
    donateToastInvalidAmountTitle: "مبلغ غير صالح",
    donateToastInvalidAmountDescription: "الرجاء إدخال مبلغ تبرع مخصص صالح.",
    donateToastThankYouTitle: "شكرًا لك!",
    donateToastThankYouDescription: ({ amount }) => `نقدر تبرعك السخي بمبلغ ${amount}$. (هذا إجراء نائب)`,
  },
};
