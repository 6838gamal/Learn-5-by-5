
export interface SelectionOption {
  value: string;
  label: string;
  description?: string;
  emoji?: string;
}

export const LANGUAGES: SelectionOption[] = [
  { value: "English", label: "English", description: "The global lingua franca.", emoji: "🇬🇧" },
  { value: "Spanish", label: "Spanish", description: "Spoken in Spain and most of Latin America.", emoji: "🇪🇸" },
  { value: "French", label: "French", description: "Official language in 29 countries.", emoji: "🇫🇷" },
  { value: "German", label: "German", description: "Most spoken native language in the EU.", emoji: "🇩🇪" },
  { value: "Italian", label: "Italian", description: "Language of art, music, and cuisine.", emoji: "🇮🇹" },
  { value: "Portuguese", label: "Portuguese", description: "Spoken in Portugal and Brazil.", emoji: "🇵🇹" },
  { value: "Japanese", label: "Japanese", description: "East Asian language from Japan.", emoji: "🇯🇵" },
  { value: "Korean", label: "Korean", description: "Official language of North & South Korea.", emoji: "🇰🇷" },
  { value: "Mandarin Chinese", label: "Mandarin Chinese", description: "Most spoken language by native speakers.", emoji: "🇨🇳" },
];

export const FIELDS: SelectionOption[] = [
  { value: "Technology", label: "Technology" },
  { value: "Food and Cuisine", label: "Food & Cuisine" },
  { value: "Travel and Geography", label: "Travel & Geography" },
  { value: "Science and Nature", label: "Science & Nature" },
  { value: "Business and Finance", label: "Business & Finance" },
  { value: "Arts and Culture", label: "Arts & Culture" },
  { value: "Health and Wellness", label: "Health & Wellness" },
  { value: "Everyday Objects", label: "Everyday Objects" },
  { value: "Sports and Hobbies", label: "Sports & Hobbies" },
];

export const TARGET_LANGUAGES: SelectionOption[] = [
  { value: "ar", label: "Arabic", emoji: "🇸🇦" },
  { value: "bn", label: "Bengali", emoji: "🇧🇩" },
  { value: "zh-CN", label: "Chinese (Simplified)", emoji: "🇨🇳" },
  { value: "zh-TW", label: "Chinese (Traditional)", emoji: "🇹🇼" },
  { value: "nl", label: "Dutch", emoji: "🇳🇱" },
  { value: "en", label: "English", emoji: "🇬🇧" },
  { value: "fr", label: "French", emoji: "🇫🇷" },
  { value: "de", label: "German", emoji: "🇩🇪" },
  { value: "el", label: "Greek", emoji: "🇬🇷" },
  { value: "hi", label: "Hindi", emoji: "🇮🇳" },
  { value: "id", label: "Indonesian", emoji: "🇮🇩" },
  { value: "it", label: "Italian", emoji: "🇮🇹" },
  { value: "ja", label: "Japanese", emoji: "🇯🇵" },
  { value: "ko", label: "Korean", emoji: "🇰🇷" },
  { value: "ms", label: "Malay", emoji: "🇲🇾" },
  { value: "pl", label: "Polish", emoji: "🇵🇱" },
  { value: "pt", label: "Portuguese", emoji: "🇵🇹" },
  { value: "ru", label: "Russian", emoji: "🇷🇺" },
  { value: "es", label: "Spanish", emoji: "🇪🇸" },
  { value: "sv", label: "Swedish", emoji: "🇸🇪" },
  { value: "th", label: "Thai", emoji: "🇹🇭" },
  { value: "tr", label: "Turkish", emoji: "🇹🇷" },
  { value: "uk", label: "Ukrainian", emoji: "🇺🇦" },
  { value: "ur", label: "Urdu", emoji: "🇵🇰" },
  { value: "vi", label: "Vietnamese", emoji: "🇻🇳" },
  { value: "he", label: "Hebrew", emoji: "🇮🇱" },
  { value: "fa", label: "Persian (Farsi)", emoji: "🇮🇷" },
  { value: "sw", label: "Swahili", emoji: "🇰🇪" },
  { value: "no", label: "Norwegian", emoji: "🇳🇴" },
  { value: "fi", label: "Finnish", emoji: "🇫🇮" },
];

export const TARGET_FIELDS: SelectionOption[] = [
  { value: "daily_conversation", label: "Daily Conversation" },
  { value: "common_phrases", label: "Common Phrases" },
  { value: "greetings_introductions", label: "Greetings & Introductions" },
  { value: "numbers_time_date", label: "Numbers, Time & Date" },
  { value: "food_dining", label: "Food & Dining" },
  { value: "travel_directions", label: "Travel & Directions" },
  { value: "shopping_services", label: "Shopping & Services" },
  { value: "accommodation", label: "Accommodation" },
  { value: "emergencies_health", label: "Emergencies & Health" },
  { value: "family_relationships", label: "Family & Relationships" },
  { value: "work_professions", label: "Work & Professions" },
  { value: "education_learning", label: "Education & Learning" },
  { value: "hobbies_leisure", label: "Hobbies & Leisure" },
  { value: "technology_internet", label: "Technology & Internet" },
  { value: "nature_environment", label: "Nature & Environment" },
  { value: "weather", label: "Weather" },
  { value: "culture_society", label: "Culture & Society" },
  { value: "history_politics", label: "History & Politics" },
  { value: "science_mathematics", label: "Science & Mathematics" },
  { value: "arts_literature", label: "Arts & Literature" },
  { value: "music_film", label: "Music & Film" },
  { value: "sports_fitness", label: "Sports & Fitness" },
  { value: "clothing_fashion", label: "Clothing & Fashion" },
  { value: "emotions_feelings", label: "Emotions & Feelings" },
  { value: "describing_people", label: "Describing People" },
  { value: "describing_objects", label: "Describing Objects" },
  { value: "grammar_basics", label: "Grammar Basics" },
  { value: "advanced_vocabulary", label: "Advanced Vocabulary" },
  { value: "business_communication", label: "Business Communication" },
  { value: "academic_writing", label: "Academic Writing" },
];

export const SUPPORT_CATEGORIES: SelectionOption[] = [
  { value: "general_inquiry", label: "General Inquiry" },
  { value: "technical_issue", label: "Technical Issue" },
  { value: "account_billing", label: "Account & Billing" },
  { value: "feature_request", label: "Feature Request" },
  { value: "feedback_suggestion", label: "Feedback & Suggestion" },
  { value: "other", label: "Other" },
];
