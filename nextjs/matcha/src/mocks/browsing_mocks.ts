import { UserProfile } from "@/types/UserProfile";

// Mock data with full user structure
export const mockUserProfiles: UserProfile[] = [
  {
    id: "1",
    firstName: "Alice",
    lastName: "Dupont",
    birthday: "1999-03-15",
    biography:
      "Passionnée de voyages et de photographie. J'adore découvrir de nouvelles cultures et partager des moments authentiques.",
    interests: ["Voyages", "Photographie", "Cuisine", "Yoga"],
    gender: "female",
    interestedInGenders: ["male"],
    profilePicture: "/bob.jpg",
    additionalPictures: ["/bob.jpg", "/bob.jpg", null, null],
  },
  {
    id: "2",
    firstName: "Marie",
    lastName: "Martin",
    birthday: "1997-07-22",
    biography:
      "Architecte le jour, artiste la nuit. J'aime créer et explorer l'art sous toutes ses formes.",
    interests: ["Architecture", "Art", "Musique", "Randonnée"],
    gender: "female",
    interestedInGenders: ["male"],
    profilePicture: "/bob.jpg",
    additionalPictures: ["/bob.jpg", null, null, null],
  },
  {
    id: "3",
    firstName: "Laura",
    lastName: "Bernard",
    birthday: "2001-11-08",
    biography:
      "Étudiante en médecine et amoureuse des animaux. Je cherche quelqu'un avec qui partager de bons moments.",
    interests: ["Médecine", "Animaux", "Lecture", "Sport"],
    gender: "female",
    interestedInGenders: ["male"],
    profilePicture: "/bob.jpg",
    additionalPictures: ["/bob.jpg", "/bob.jpg", "/bob.jpg", null],
  },
  {
    id: "4",
    firstName: "Camille",
    lastName: "Petit",
    birthday: "1999-05-30",
    biography:
      "Développeuse web passionnée par les nouvelles technologies et l'innovation.",
    interests: ["Technologie", "Gaming", "Cinéma", "Running"],
    gender: "female",
    interestedInGenders: ["male"],
    profilePicture: "/bob.jpg",
    additionalPictures: ["/bob.jpg", null, null, null],
  },
  {
    id: "5",
    firstName: "Sarah",
    lastName: "Moreau",
    birthday: "1998-01-12",
    biography:
      "Professeure de danse et amoureuse de la vie. Toujours prête pour de nouvelles aventures !",
    interests: ["Danse", "Musique", "Fitness", "Mode"],
    gender: "female",
    interestedInGenders: ["male"],
    profilePicture: "/bob.jpg",
    additionalPictures: ["/bob.jpg", "/bob.jpg", null, null],
  },
  {
    id: "6",
    firstName: "Léa",
    lastName: "Dubois",
    birthday: "2002-09-25",
    biography:
      "Étudiante en communication, passionnée par les réseaux sociaux et le marketing digital.",
    interests: ["Marketing", "Réseaux sociaux", "Café", "Voyage"],
    gender: "female",
    interestedInGenders: ["male"],
    profilePicture: "/bob.jpg",
    additionalPictures: [null, null, null, null],
  },
  {
    id: "7",
    firstName: "Chloé",
    lastName: "Roux",
    birthday: "1996-04-18",
    biography:
      "Chef cuisinière qui aime expérimenter de nouvelles saveurs. Gourmande assumée !",
    interests: ["Cuisine", "Gastronomie", "Vin", "Pâtisserie"],
    gender: "female",
    interestedInGenders: ["male"],
    profilePicture: "/bob.jpg",
    additionalPictures: ["/bob.jpg", "/bob.jpg", "/bob.jpg", "/bob.jpg"],
  },
  {
    id: "8",
    firstName: "Manon",
    lastName: "Leroy",
    birthday: "2000-02-14",
    biography:
      "Graphiste freelance et amoureuse de la nature. Je cherche quelqu'un de créatif et authentique.",
    interests: ["Design", "Nature", "Randonnée", "Photographie"],
    gender: "female",
    interestedInGenders: ["male"],
    profilePicture: "/bob.jpg",
    additionalPictures: ["/bob.jpg", null, null, null],
  },
  {
    id: "9",
    firstName: "Jade",
    lastName: "Simon",
    birthday: "1999-08-07",
    biography:
      "Infirmière dévouée le jour, aventurière le week-end. J'adore les activités en plein air.",
    interests: ["Sport", "Nature", "Camping", "Vélo"],
    gender: "female",
    interestedInGenders: ["male"],
    profilePicture: "/bob.jpg",
    additionalPictures: ["/bob.jpg", "/bob.jpg", null, null],
  },
  {
    id: "10",
    firstName: "Luna",
    lastName: "Laurent",
    birthday: "2001-06-20",
    biography:
      "Musicienne et compositrice. La musique est ma vie et je cherche quelqu'un qui partage cette passion.",
    interests: ["Musique", "Concert", "Guitare", "Chant"],
    gender: "female",
    interestedInGenders: ["male"],
    profilePicture: "/bob.jpg",
    additionalPictures: ["/bob.jpg", null, null, null],
  },
];

// Simplified data for matches
export const mockMatches = mockUserProfiles.slice(0, 3).map((user) => ({
  id: user.id,
  name: user.firstName,
  pictureUrl: user.profilePicture || "/bob.jpg",
}));

// Mock conversations with user IDs matching mockUserProfiles
export const mockConversations = [
  {
    id: "conv-1",
    userId: "1", // Alice
    name: "Alice",
    pictureUrl: "/bob.jpg",
    lastMessage: "Salut ! Comment ça va ?",
  },
  {
    id: "conv-2",
    userId: "2", // Marie
    name: "Marie",
    pictureUrl: "/bob.jpg",
    lastMessage: "On se voit quand ?",
  },
];

// Mock messages for conversations
export const mockMessages = {
  "conv-1": [
    {
      id: "msg-1",
      senderId: "1",
      content: "Salut ! Comment ça va ?",
      timestamp: new Date("2025-10-27T10:00:00"),
    },
    {
      id: "msg-2",
      senderId: "current-user",
      content: "Salut Alice ! Ça va bien et toi ?",
      timestamp: new Date("2025-10-27T10:05:00"),
    },
    {
      id: "msg-3",
      senderId: "1",
      content: "Très bien merci ! Tu as passé un bon week-end ?",
      timestamp: new Date("2025-10-27T10:10:00"),
    },
  ],
  "conv-2": [
    {
      id: "msg-4",
      senderId: "2",
      content: "On se voit quand ?",
      timestamp: new Date("2025-10-27T14:00:00"),
    },
    {
      id: "msg-5",
      senderId: "current-user",
      content: "Que dirais-tu de vendredi soir ?",
      timestamp: new Date("2025-10-27T14:15:00"),
    },
  ],
};

// Lists for generating random data
const FIRST_NAMES = [
  "Alice",
  "Marie",
  "Laura",
  "Camille",
  "Sarah",
  "Léa",
  "Chloé",
  "Manon",
  "Jade",
  "Luna",
  "Emma",
  "Olivia",
  "Sophia",
  "Ava",
  "Isabella",
  "Mia",
  "Harper",
  "Charlotte",
  "Amelia",
  "Evelyn",
];

const LAST_NAMES = [
  "Dupont",
  "Martin",
  "Bernard",
  "Petit",
  "Moreau",
  "Dubois",
  "Roux",
  "Leroy",
  "Simon",
  "Laurent",
  "Garnier",
  "Fournier",
  "Gautier",
  "Gauthier",
  "Gillet",
  "Goas",
  "Godard",
  "Godin",
  "Goistre",
];

const PROFESSIONS = [
  "Développeuse",
  "Architecte",
  "Étudiante",
  "Professeure",
  "Infirmière",
  "Graphiste",
  "Chef cuisinière",
  "Photographe",
  "Docteure",
  "Avocate",
  "Ingénieure",
  "Artiste",
];

const HOBBIES = [
  "Voyages",
  "Photographie",
  "Cuisine",
  "Yoga",
  "Architecture",
  "Art",
  "Musique",
  "Randonnée",
  "Médecine",
  "Animaux",
  "Lecture",
  "Sport",
  "Technologie",
  "Gaming",
  "Cinéma",
  "Running",
  "Danse",
  "Fitness",
  "Mode",
  "Marketing",
  "Réseaux sociaux",
  "Café",
  "Gastronomie",
  "Vin",
  "Pâtisserie",
  "Design",
  "Nature",
  "Camping",
  "Vélo",
  "Concert",
  "Guitare",
  "Chant",
];

/**
 * Generate n random mock user profiles
 * @param n - Number of profiles to generate
 * @returns Array of randomly generated UserProfile objects
 */
export function generateMockUserProfiles(n: number): UserProfile[] {
  const profiles: UserProfile[] = [];
  const allInterests = HOBBIES;

  for (let i = 0; i < n; i++) {
    const firstName =
      FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const profession =
      PROFESSIONS[Math.floor(Math.random() * PROFESSIONS.length)];

    // Generate random interests (2-4 unique interests)
    const interestCount = Math.floor(Math.random() * 3) + 2;
    const interests: string[] = [];
    const shuffledHobbies = [...allInterests].sort(() => Math.random() - 0.5);
    for (let j = 0; j < interestCount; j++) {
      interests.push(shuffledHobbies[j]);
    }

    // Generate random birthday (18-25 years old)
    const today = new Date();
    const minYear = today.getFullYear() - 25;
    const maxYear = today.getFullYear() - 18;
    const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
    const birthday = `${year}-${month}-${day}`;

    // Generate random biography
    const bioTemplates = [
      `${profession} passionnée par ${interests[0]} et ${interests[1]}. J'aime découvrir de nouvelles choses et vivre pleinement la vie.`,
      `Amie de ${interests[0]} et ${interests[1]}. Je cherche quelqu'un d'authentique avec qui partager de bons moments.`,
      `${profession} le jour, aventurière le week-end. J'adore les ${interests[0]} et tout ce qui sort de l'ordinaire.`,
      `Passionnée par ${interests[0]}, ${interests[1]} et bien d'autres choses ! Toujours prête pour de nouvelles aventures.`,
      `${profession} en quête d'authenticité. Les ${interests[0]} et ${interests[1]} me fascinent particulièrement.`,
    ];
    const biography =
      bioTemplates[Math.floor(Math.random() * bioTemplates.length)];

    // Random gender and preferences
    const gender = Math.random() > 0.5 ? "female" : "male";
    const interestedInGenders = gender === "female" ? ["male"] : ["female"];

    // Generate random additional pictures (0-4 pictures, some can be null)
    const additionalPictures: (string | null)[] = Array(4)
      .fill(null)
      .map(() => (Math.random() > 0.3 ? "/bob.jpg" : null));

    profiles.push({
      id: String(i + 1),
      firstName,
      lastName,
      birthday,
      biography,
      interests,
      gender,
      interestedInGenders,
      profilePicture: "/bob.jpg",
      additionalPictures,
    });
  }

  return profiles;
}
