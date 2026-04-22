const Movie = require('../models/Movie');

// @desc    Get all published movies
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const query = { status: 'published', isDeleted: false };

    // Filters
    if (req.query.genre) query.genres = req.query.genre;
    if (req.query.language) query.language = req.query.language;
    if (req.query.yearFrom || req.query.yearTo) {
      query.releaseDate = {};
      if (req.query.yearFrom) query.releaseDate.$gte = new Date(`${req.query.yearFrom}-01-01`);
      if (req.query.yearTo) query.releaseDate.$lte = new Date(`${req.query.yearTo}-12-31`);
    }
    if (req.query.minRating) query.rating = { $gte: parseFloat(req.query.minRating) };

    const movies = await Movie.find(query)
      .sort(req.query.sort || '-releaseDate')
      .skip(skip)
      .limit(limit);

    const total = await Movie.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        movies,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single movie by ID or slug
// @route   GET /api/movies/:id
// @access  Public
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
      isDeleted: false
    });

    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Search movies
// @route   GET /api/movies/search
// @access  Public
exports.searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Search query is required' });

    const movies = await Movie.find({
      $text: { $search: q },
      status: 'published',
      isDeleted: false
    }).limit(20);

    res.status(200).json({
      success: true,
      data: {
        results: movies,
        total: movies.length,
        query: q
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all genres
// @route   GET /api/genres
// @access  Public
exports.getGenres = async (req, res) => {
  try {
    const genres = await Movie.distinct('genres', { status: 'published', isDeleted: false });
    res.status(200).json({ success: true, data: genres });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
