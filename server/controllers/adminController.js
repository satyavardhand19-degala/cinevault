const supabase = require('../config/supabase');
const { mapMovie } = require('../utils/mappers');
const path = require('path');
const sharp = require('sharp');

const SIZES = {
  poster:   { width: 500,  height: 750  },
  backdrop: { width: 1280, height: 720  },
  default:  { width: 800,  height: 800  },
};

const movieToDb = (data) => {
  const db = {};
  if (data.title !== undefined) db.title = data.title;
  if (data.slug !== undefined) db.slug = data.slug;
  if (data.tagline !== undefined) db.tagline = data.tagline;
  if (data.synopsis !== undefined) db.synopsis = data.synopsis;
  if (data.releaseDate !== undefined) db.release_date = data.releaseDate;
  if (data.runtime !== undefined) db.runtime = data.runtime;
  if (data.language !== undefined) db.language = data.language;
  if (data.country !== undefined) db.country = data.country;
  if (data.genres !== undefined) db.genres = data.genres;
  if (data.director !== undefined) db.director = data.director;
  if (data.cast !== undefined) db.cast = data.cast;
  if (data.rating !== undefined) db.rating = data.rating;
  if (data.posterUrl !== undefined) db.poster_url = data.posterUrl;
  if (data.backdropUrl !== undefined) db.backdrop_url = data.backdropUrl;
  if (data.trailerUrl !== undefined) db.trailer_url = data.trailerUrl;
  if (data.trailerType !== undefined) db.trailer_type = data.trailerType;
  if (data.status !== undefined) db.status = data.status;
  return db;
};

exports.getAdminMovies = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data: (data || []).map(mapMovie) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addMovie = async (req, res) => {
  try {
    const movieData = { ...req.body };

    if (!movieData.slug && movieData.title) {
      movieData.slug = movieData.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
    }

    const { data, error } = await supabase
      .from('movies')
      .insert(movieToDb(movieData))
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data: mapMovie(data), message: 'Movie created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const { data: existing, error: findError } = await supabase
      .from('movies')
      .select('id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findError || !existing) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const { data, error } = await supabase
      .from('movies')
      .update(movieToDb(req.body))
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data: mapMovie(data), message: 'Movie updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const { data: existing, error: findError } = await supabase
      .from('movies')
      .select('id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findError || !existing) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const { error } = await supabase
      .from('movies')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Movie hidden from users' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.permanentDeleteMovie = async (req, res) => {
  try {
    const { data: existing, error: findError } = await supabase
      .from('movies')
      .select('id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findError || !existing) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const { error } = await supabase.from('movies').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Movie permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.restoreMovie = async (req, res) => {
  try {
    const { data: existing, error: findError } = await supabase
      .from('movies')
      .select('id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findError || !existing) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    const { error } = await supabase
      .from('movies')
      .update({ is_deleted: false, deleted_at: null })
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Movie restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      { count: totalMovies },
      { count: publishedMovies },
      { count: draftMovies },
      { count: addedThisMonth },
      { data: genreData },
      { data: languageData }
    ] = await Promise.all([
      supabase.from('movies').select('*', { count: 'exact', head: true }),
      supabase.from('movies').select('*', { count: 'exact', head: true }).eq('status', 'published').eq('is_deleted', false),
      supabase.from('movies').select('*', { count: 'exact', head: true }).eq('status', 'draft').eq('is_deleted', false),
      supabase.from('movies').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
      supabase.from('movies').select('genres').eq('is_deleted', false),
      supabase.from('movies').select('language').eq('is_deleted', false),
    ]);

    const genreBreakdown = {};
    (genreData || []).forEach(m => {
      (m.genres || []).forEach(g => { genreBreakdown[g] = (genreBreakdown[g] || 0) + 1; });
    });

    const totalLanguages = new Set((languageData || []).flatMap(m => m.language || [])).size;

    res.status(200).json({
      success: true,
      data: { totalMovies, publishedMovies, draftMovies, addedThisMonth, totalLanguages, genreBreakdown }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const type = req.body.type || 'default';
    const { width, height } = SIZES[type] || SIZES.default;

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;

    const buffer = await sharp(req.file.buffer)
      .resize(width, height, { fit: 'cover', position: 'centre' })
      .webp({ quality: 85 })
      .toBuffer();

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filename, buffer, { contentType: 'image/webp', upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filename);

    res.status(200).json({
      success: true,
      data: { url: publicUrl, publicId: filename, width, height, format: 'webp' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
