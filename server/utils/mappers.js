const mapMovie = (row) => !row ? null : ({
  _id: row.id,
  title: row.title,
  slug: row.slug,
  tagline: row.tagline || null,
  synopsis: row.synopsis,
  releaseDate: row.release_date,
  runtime: row.runtime,
  language: row.language || [],
  country: row.country || null,
  genres: row.genres || [],
  director: row.director,
  cast: row.cast || [],
  rating: parseFloat(row.rating) || 0,
  posterUrl: row.poster_url,
  backdropUrl: row.backdrop_url || null,
  trailerUrl: row.trailer_url,
  trailerType: row.trailer_type,
  status: row.status,
  isDeleted: row.is_deleted,
  deletedAt: row.deleted_at || null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapUser = (row) => !row ? null : ({
  _id: row.id,
  name: row.name,
  email: row.email,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapAdmin = (row) => !row ? null : ({
  _id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  lastLogin: row.last_login || null,
  loginAttempts: row.login_attempts,
  lockUntil: row.lock_until || null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

module.exports = { mapMovie, mapUser, mapAdmin };
