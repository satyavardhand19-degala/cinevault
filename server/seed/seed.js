require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Movie = require('../models/Movie');

// placehold.co generates reliable placeholder images at any size
const poster = (title) => `https://placehold.co/500x750/1a1a2e/e94560?text=${encodeURIComponent(title)}`;
const backdrop = (title) => `https://placehold.co/1280x720/0f0f1a/e94560?text=${encodeURIComponent(title)}`;

const sampleMovies = [
  {
    title: "Pushpa 2: The Rule",
    slug: "pushpa-2-the-rule",
    tagline: "The fire returns, stronger than ever.",
    synopsis: "Pushpa Raj continues his rise in the red sandalwood smuggling world while facing an intense rivalry with the police and a bigger criminal empire. His journey from a labourer to a feared don reaches its peak as loyalties are tested and battles become personal.",
    releaseDate: "2026-04-04",
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
    posterUrl: poster("Pushpa 2"),
    backdropUrl: backdrop("Pushpa 2: The Rule"),
    trailerUrl: "https://www.youtube.com/watch?v=YEjR-yPTNbA",
    trailerType: "youtube",
    status: "published"
  },
  {
    title: "Kalki 2898-AD",
    slug: "kalki-2898-ad",
    tagline: "The future has a prophecy.",
    synopsis: "Set in a dystopian future, a mercenary named Bhairava is on a mission to save a pregnant woman who is believed to be carrying the future saviour of humanity — the tenth avatar of Vishnu, Kalki.",
    releaseDate: "2026-04-10",
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
    posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdropUrl: backdrop("Kalki 2898-AD"),
    trailerUrl: "https://www.youtube.com/watch?v=wqyGBMmrLLw",
    trailerType: "youtube",
    status: "published"
  },
  {
    title: "Devara: Part 1",
    slug: "devara-part-1",
    tagline: "Fear is the only language they understand.",
    synopsis: "A fierce and fearless coastal lord rules through fear, but when his legacy is threatened by betrayal and his own son's different path, a battle for power and identity unfolds across two generations.",
    releaseDate: "2026-04-14",
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
    posterUrl: poster("Devara"),
    backdropUrl: backdrop("Devara: Part 1"),
    trailerUrl: "https://www.youtube.com/watch?v=z_5VBGfkMpI",
    trailerType: "youtube",
    status: "published"
  },
  {
    title: "HanuMan",
    slug: "hanuman",
    tagline: "A new hero rises from Anjanadri.",
    synopsis: "In a small village called Anjanadri, an ordinary young man named Hanumanthu discovers a mystical gem that grants him extraordinary powers. He must now protect his village and the people he loves from a deadly supervillain.",
    releaseDate: "2026-04-18",
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
    posterUrl: poster("HanuMan"),
    backdropUrl: backdrop("HanuMan"),
    trailerUrl: "https://www.youtube.com/watch?v=PKbcKMFnLdo",
    trailerType: "youtube",
    status: "published"
  },
  {
    title: "Game Changer",
    slug: "game-changer",
    tagline: "Power. Politics. Revolution.",
    synopsis: "An honest IAS officer takes on a corrupt political system that has deep roots across generations. His fight for justice ignites a revolution, but the cost is personal — forcing him to confront a past tied to his own family.",
    releaseDate: "2026-04-22",
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
    posterUrl: poster("Game Changer"),
    backdropUrl: backdrop("Game Changer"),
    trailerUrl: "https://www.youtube.com/watch?v=8iBXdxAW7DY",
    trailerType: "youtube",
    status: "published"
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for seeding...');

    await Admin.deleteMany();
    try { await Movie.collection.drop(); } catch (_) {}
    await Movie.syncIndexes();

    const passwordHash = await bcrypt.hash('admin@123', 12);
    await Admin.create({
      name: 'Admin User',
      email: 'admin12@gmail.com',
      passwordHash,
      role: 'admin'
    });
    console.log('Admin user created');

    await Movie.insertMany(sampleMovies);
    console.log(`${sampleMovies.length} Telugu movies seeded`);
    console.log('Seeding completed successfully');
    process.exit();
  } catch (error) {
    console.error(`Error seeding: ${error.message}`);
    process.exit(1);
  }
};

seed();
