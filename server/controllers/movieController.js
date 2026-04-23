const supabase = require('../config/supabase');
const { mapMovie } = require('../utils/mappers');

exports.getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('movies').select('*', { count: 'exact' })
      .eq('status', 'published')
      .eq('is_deleted', false);

    if (req.query.genre) query = query.contains('genres', [req.query.genre]);
    if (req.query.language) query = query.contains('language', [req.query.language]);
    if (req.query.yearFrom) query = query.gte('release_date', `${req.query.yearFrom}-01-01`);
    if (req.query.yearTo) query = query.lte('release_date', `${req.query.yearTo}-12-31`);
    if (req.query.minRating) query = query.gte('rating', parseFloat(req.query.minRating));

    const sortField = req.query.sort || '-releaseDate';
    const ascending = !sortField.startsWith('-');
    const columnMap = { releaseDate: 'release_date', rating: 'rating', title: 'title' };
    const column = columnMap[sortField.replace(/^-/, '')] || 'release_date';
    query = query.order(column, { ascending }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    res.status(200).json({
      success: true,
      data: {
        movies: (data || []).map(mapMovie),
        pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const param = req.params.id;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param);

    let query = supabase.from('movies').select('*').eq('is_deleted', false);
    query = isUUID ? query.eq('id', param) : query.eq('slug', param);

    const { data, error } = await query.single();
    if (error || !data) return res.status(404).json({ success: false, error: 'Movie not found' });

    res.status(200).json({ success: true, data: mapMovie(data) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchMovies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Search query is required' });

    const { data, error } = await supabase.from('movies').select('*')
      .eq('status', 'published')
      .eq('is_deleted', false)
      .or(`title.ilike.%${q}%,synopsis.ilike.%${q}%,director.ilike.%${q}%`)
      .limit(20);

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: { results: (data || []).map(mapMovie), total: data.length, query: q }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getGenres = async (req, res) => {
  try {
    const { data, error } = await supabase.from('movies').select('genres')
      .eq('status', 'published')
      .eq('is_deleted', false);

    if (error) throw error;

    const genres = [...new Set((data || []).flatMap(m => m.genres || []))].sort();
    res.status(200).json({ success: true, data: genres });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
