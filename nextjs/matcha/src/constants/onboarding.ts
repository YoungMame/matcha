import { StepConfig } from "@/types/onboarding";

export const STEPS: StepConfig[] = [
  {
    id: "identity",
    label: "Identité",
    title: "Parlez-nous de vous",
    description: "Commençons par les bases",
  },
  {
    id: "interests",
    label: "Intérêts",
    title: "Quels sont vos centres d'intérêt ?",
    description: "Sélectionnez au moins 3 centres d'intérêt qui vous décrivent",
  },
  {
    id: "preferences",
    label: "Préférences",
    title: "Qui aimeriez-vous rencontrer ?",
    description: "Aidez-nous à trouver votre match parfait",
  },
  {
    id: "pictures",
    label: "Photos",
    title: "Ajoutez vos photos",
    description: "Montrez votre meilleur profil",
  },
];

export const AVAILABLE_INTERESTS = [
  "Photographie",
  "Randonnée",
  "Cuisine",
  "Lecture",
  "Voyage",
  "Musique",
  "Danse",
  "Sport",
  "Yoga",
  "Jeux vidéo",
  "Art",
  "Cinéma",
  "Fitness",
  "Animaux",
  "Mode",
  "Technologie",
  "Écriture",
  "Jardinage",
  "Cyclisme",
  "Natation",
  "Course à pied",
  "Méditation",
  "Vin",
  "Café",
  "Théâtre",
  "Comédie",
  "Langues",
  "Bénévolat",
];

export const GENDER_OPTIONS = [
  { value: "men", label: "Homme" },
  { value: "women", label: "Femme" },
];

export const ORIENTATION_OPTIONS = [
  { value: "heterosexual", label: "Hétérosexuel" },
  { value: "homosexual", label: "Homosexuel" },
  { value: "bisexual", label: "Bisexuel" },
]

export const MIN_INTERESTS = 3;
export const MAX_ADDITIONAL_PICTURES = 4;
