
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
