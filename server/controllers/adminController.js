const Movie = require('../models/Movie');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const SIZES = {
  poster:   { width: 500,  height: 750  },  // 2:3 — standard movie poster
  backdrop: { width: 1280, height: 720  },  // 16:9 — widescreen backdrop
  default:  { width: 800,  height: 800  },  // square fallback
};

// @desc    Get all movies for admin
// @route   GET /api/admin/movies
// @access  Private/Admin
exports.getAdminMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort('-createdAt');
    res.status(200).json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add new movie
// @route   POST /api/admin/movies
// @access  Private/Admin
exports.addMovie = async (req, res) => {
  try {
    const movieData = req.body;
    
    // Auto-generate slug from title
    if (!movieData.slug && movieData.title) {
      movieData.slug = movieData.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
    }

    const movie = await Movie.create(movieData);
    res.status(201).json({ success: true, data: movie, message: 'Movie created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update movie
// @route   PUT /api/admin/movies/:id
// @access  Private/Admin
exports.updateMovie = async (req, res) => {
  try {
    let movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: movie, message: 'Movie updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Soft delete movie
// @route   DELETE /api/admin/movies/:id
// @access  Private/Admin
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }
    movie.isDeleted = true;
    movie.deletedAt = Date.now();
    await movie.save();
    res.status(200).json({ success: true, message: 'Movie hidden from users' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Permanently delete movie from database
// @route   DELETE /api/admin/movies/:id/permanent
// @access  Private/Admin
exports.permanentDeleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }
    res.status(200).json({ success: true, message: 'Movie permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Restore soft-deleted movie
// @route   PATCH /api/admin/movies/:id/restore
// @access  Private/Admin
exports.restoreMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    movie.isDeleted = false;
    movie.deletedAt = undefined;
    await movie.save();

    res.status(200).json({ success: true, message: 'Movie restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const publishedMovies = await Movie.countDocuments({ status: 'published', isDeleted: false });
    const draftMovies = await Movie.countDocuments({ status: 'draft', isDeleted: false });
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const addedThisMonth = await Movie.countDocuments({ createdAt: { $gte: startOfMonth } });

    const totalLanguages = (await Movie.distinct('language')).length;

    // Genre breakdown
    const genreAggregation = await Movie.aggregate([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } }
    ]);
    const genreBreakdown = {};
    genreAggregation.forEach(g => genreBreakdown[g._id] = g.count);

    res.status(200).json({
      success: true,
      data: {
        totalMovies,
        publishedMovies,
        draftMovies,
        addedThisMonth,
        totalLanguages,
        genreBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Upload and resize media (stored locally)
// @route   POST /api/admin/upload
// @access  Private/Admin
exports.uploadMedia = async (req, res) => {
  const tempPath = req.file?.path;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const type = req.body.type || 'default';
    const { width, height } = SIZES[type] || SIZES.default;

    // Output as webp for best quality/size ratio
    const outFilename = `${path.basename(tempPath, path.extname(tempPath))}.webp`;
    const outPath = path.join(path.dirname(tempPath), outFilename);

    await sharp(tempPath)
      .resize(width, height, {
        fit: type === 'poster' ? 'cover' : 'cover',
        position: 'centre'
      })
      .webp({ quality: 85 })
      .toFile(outPath);

    // Remove original temp file
    fs.unlinkSync(tempPath);

    const base = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${base}/uploads/${outFilename}`;

    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        publicId: outFilename,
        width,
        height,
        format: 'webp'
      }
    });
  } catch (error) {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(500).json({ success: false, error: error.message });
  }
};
