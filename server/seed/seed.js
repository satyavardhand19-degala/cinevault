require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const poster = (title) => `https://placehold.co/500x750/1a1a2e/e94560?text=${encodeURIComponent(title)}`;
const backdrop = (title) => `https://placehold.co/1280x720/0f0f1a/e94560?text=${encodeURIComponent(title)}`;

const sampleMovies = [
  {
    title: "Pushpa 2: The Rule",
    slug: "pushpa-2-the-rule",
    tagline: "The fire returns, stronger than ever.",
    synopsis: "Pushpa Raj continues his rise in the red sandalwood smuggling world while facing an intense rivalry with the police and a bigger criminal empire. His journey from a labourer to a feared don reaches its peak as loyalties are tested and battles become personal.",
    release_date: "2026-04-04",
    runtime: 185,
    language: ["Telugu"],
    country: "India",
    genres: ["Action", "Crime", "Drama"],
    director: "Sukumar",
    cast: [
      { actor: "Allu Arjun", role: "Pushpa Raj" },
      { actor: "Rashmika Mandanna", role: "Srivalli" },
      { actor: "Fahadh Faasil", role: "SP Bhanwar Singh Shekawat" }
    ],
    rating: 8.4,
    poster_url: poster("Pushpa 2"),
    backdrop_url: backdrop("Pushpa 2: The Rule"),
    trailer_url: "https://www.youtube.com/watch?v=YEjR-yPTNbA",
    trailer_type: "youtube",
    status: "published"
  },
  {
    title: "Kalki 2898-AD",
    slug: "kalki-2898-ad",
    tagline: "The future has a prophecy.",
    synopsis: "Set in a dystopian future, a mercenary named Bhairava is on a mission to save a pregnant woman who is believed to be carrying the future saviour of humanity — the tenth avatar of Vishnu, Kalki.",
    release_date: "2026-04-10",
    runtime: 181,
    language: ["Telugu"],
    country: "India",
    genres: ["Action", "Sci-Fi", "Fantasy"],
    director: "Nag Ashwin",
    cast: [
      { actor: "Prabhas", role: "Bhairava" },
      { actor: "Deepika Padukone", role: "Suma" },
      { actor: "Amitabh Bachchan", role: "Ashwatthama" },
      { actor: "Kamal Haasan", role: "Yaskin" }
    ],
    rating: 7.8,
    poster_url: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop_url: backdrop("Kalki 2898-AD"),
    trailer_url: "https://www.youtube.com/watch?v=wqyGBMmrLLw",
    trailer_type: "youtube",
    status: "published"
  },
  {
    title: "Devara: Part 1",
    slug: "devara-part-1",
    tagline: "Fear is the only language they understand.",
    synopsis: "A fierce and fearless coastal lord rules through fear, but when his legacy is threatened by betrayal and his own son's different path, a battle for power and identity unfolds across two generations.",
    release_date: "2026-04-14",
    runtime: 166,
    language: ["Telugu"],
    country: "India",
    genres: ["Action", "Drama", "Thriller"],
    director: "Koratala Siva",
    cast: [
      { actor: "Jr. NTR", role: "Devara / Vara" },
      { actor: "Janhvi Kapoor", role: "Thangam" },
      { actor: "Saif Ali Khan", role: "Bhaira" }
    ],
    rating: 7.5,
    poster_url: poster("Devara"),
    backdrop_url: backdrop("Devara: Part 1"),
    trailer_url: "https://www.youtube.com/watch?v=z_5VBGfkMpI",
    trailer_type: "youtube",
    status: "published"
  },
  {
    title: "HanuMan",
    slug: "hanuman",
    tagline: "A new hero rises from Anjanadri.",
    synopsis: "In a small village called Anjanadri, an ordinary young man named Hanumanthu discovers a mystical gem that grants him extraordinary powers. He must now protect his village and the people he loves from a deadly supervillain.",
    release_date: "2026-04-18",
    runtime: 157,
    language: ["Telugu"],
    country: "India",
    genres: ["Action", "Fantasy", "Adventure"],
    director: "Prasanth Varma",
    cast: [
      { actor: "Teja Sajja", role: "Hanumanthu" },
      { actor: "Amritha Aiyer", role: "Meenakshi" },
      { actor: "Varalaxmi Sarathkumar", role: "Anjamma" }
    ],
    rating: 8.1,
    poster_url: poster("HanuMan"),
    backdrop_url: backdrop("HanuMan"),
    trailer_url: "https://www.youtube.com/watch?v=PKbcKMFnLdo",
    trailer_type: "youtube",
    status: "published"
  },
  {
    title: "Game Changer",
    slug: "game-changer",
    tagline: "Power. Politics. Revolution.",
    synopsis: "An honest IAS officer takes on a corrupt political system that has deep roots across generations. His fight for justice ignites a revolution, but the cost is personal — forcing him to confront a past tied to his own family.",
    release_date: "2026-04-22",
    runtime: 168,
    language: ["Telugu"],
    country: "India",
    genres: ["Action", "Drama", "Thriller"],
    director: "Shankar",
    cast: [
      { actor: "Ram Charan", role: "Ram Nandan / Appanna" },
      { actor: "Kiara Advani", role: "Deepika" },
      { actor: "SJ Suryah", role: "Bobbili Mopidevi" }
    ],
    rating: 7.2,
    poster_url: poster("Game Changer"),
    backdrop_url: backdrop("Game Changer"),
    trailer_url: "https://www.youtube.com/watch?v=8iBXdxAW7DY",
    trailer_type: "youtube",
    status: "published"
  }
];

const seed = async () => {
  try {
    console.log('Connected to Supabase...');

    await supabase.from('admins').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('movies').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const passwordHash = await bcrypt.hash('admin@123', 12);
    const { error: adminError } = await supabase.from('admins').insert({
      name: 'Admin User',
      email: 'admin12@gmail.com',
      password_hash: passwordHash,
      role: 'admin'
    });
    if (adminError) throw adminError;
    console.log('Admin user created');

    const { error: moviesError } = await supabase.from('movies').insert(sampleMovies);
    if (moviesError) throw moviesError;
    console.log(`${sampleMovies.length} Telugu movies seeded`);
    console.log('Seeding completed successfully');
    process.exit();
  } catch (error) {
    console.error(`Error seeding: ${error.message}`);
    process.exit(1);
  }
};

seed();
