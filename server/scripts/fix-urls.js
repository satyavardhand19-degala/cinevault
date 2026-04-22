require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');

const fix = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const movies = await Movie.find({ posterUrl: /^http:\/\/localhost/ });
  console.log(`Found ${movies.length} movies with absolute localhost URLs`);

  for (const movie of movies) {
    let changed = false;
    if (movie.posterUrl?.startsWith('http://localhost')) {
      movie.posterUrl = movie.posterUrl.replace(/^http:\/\/localhost:\d+/, '');
      changed = true;
    }
    if (movie.backdropUrl?.startsWith('http://localhost')) {
      movie.backdropUrl = movie.backdropUrl.replace(/^http:\/\/localhost:\d+/, '');
      changed = true;
    }
    if (changed) {
      await movie.save();
      console.log(`Fixed: ${movie.title}`);
    }
  }

  console.log('Done');
  process.exit();
};

fix().catch(e => { console.error(e.message); process.exit(1); });
