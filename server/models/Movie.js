const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  tagline: {
    type: String,
    maxlength: 300
  },
  synopsis: {
    type: String,
    required: true,
    maxlength: 2000
  },
  releaseDate: {
    type: Date,
    required: true
  },
  runtime: {
    type: Number, // in minutes
    min: 1
  },
  language: [{
    type: String
  }],
  country: String,
  genres: [{
    type: String,
    enum: ['Action','Comedy','Drama','Horror','Sci-Fi','Thriller',
           'Romance','Animation','Documentary','Fantasy','Mystery',
           'Adventure','Crime','Biography','Musical','Western']
  }],
  director: {
    type: String,
    required: true
  },
  cast: [{
    actor: { type: String, required: true },
    role: { type: String }
  }],
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  posterUrl: {
    type: String,
    required: true
  },
  backdropUrl: String,
  trailerUrl: {
    type: String,
    required: true
  },
  trailerType: {
    type: String,
    enum: ['youtube', 'hosted'],
    default: 'youtube'
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'draft'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes
movieSchema.index({ title: 'text', synopsis: 'text', director: 'text' }, { language_override: 'lang' });
movieSchema.index({ genres: 1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ status: 1, isDeleted: 1 });

module.exports = mongoose.model('Movie', movieSchema);
