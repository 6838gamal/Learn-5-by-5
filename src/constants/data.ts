export interface SelectionOption {
  value: string;
  label: string;
}

export const LANGUAGES: SelectionOption[] = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Italian", label: "Italian" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Japanese", label: "Japanese" },
  { value: "Korean", label: "Korean" },
  { value: "Mandarin Chinese", label: "Mandarin Chinese" },
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
