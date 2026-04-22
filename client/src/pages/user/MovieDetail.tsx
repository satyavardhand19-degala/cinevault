import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowLeft, Star, Clock, Calendar, Globe, Play, X } from 'lucide-react';
import api from '../../services/api';

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const MovieDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['movie', slug],
    queryFn: async () => (await api.get(`/movies/${slug}`)).data.data
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-400 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 gap-4">
        <p className="text-red-400 text-lg">Movie not found.</p>
        <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-white underline">
          Go back home
        </button>
      </div>
    );
  }

  const movie = data;
  const year = new Date(movie.releaseDate).getFullYear();
  const releaseDate = new Date(movie.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;
  const ytId = movie.trailerType === 'youtube' ? getYouTubeId(movie.trailerUrl) : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Backdrop */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        {movie.backdropUrl ? (
          <img src={movie.backdropUrl} alt={movie.title} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/30" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-64 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-48 md:w-64 rounded-xl shadow-2xl border border-gray-800"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-32">
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genres?.map((g: string) => (
                <span key={g} className="px-3 py-1 rounded-full text-xs bg-red-600/20 text-red-400 border border-red-600/30">
                  {g}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-2">{movie.title}</h1>

            {movie.tagline && (
              <p className="text-gray-400 italic text-lg mb-4">"{movie.tagline}"</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-400">
              <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                <Star size={16} className="fill-yellow-400" /> {movie.rating}/10
              </span>
              {runtime && (
                <span className="flex items-center gap-1">
                  <Clock size={15} /> {runtime}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={15} /> {releaseDate}
              </span>
              {movie.language?.length > 0 && (
                <span className="flex items-center gap-1">
                  <Globe size={15} /> {movie.language.join(', ')}
                </span>
              )}
              {movie.country && <span className="text-gray-500">• {movie.country}</span>}
            </div>

            {/* Trailer button */}
            {(ytId || movie.trailerUrl) && (
              <button
                onClick={() => setShowTrailer(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors mb-8"
              >
                <Play size={20} className="fill-white" /> Watch Trailer
              </button>
            )}

            {/* Synopsis */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3 text-white">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed text-base">{movie.synopsis}</p>
            </div>

            {/* Director */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">Director</h2>
              <p className="text-gray-300">{movie.director}</p>
            </div>

            {/* Cast */}
            {movie.cast?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Cast</h2>
                <div className="flex flex-wrap gap-3">
                  {movie.cast.map((c: any, i: number) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 min-w-[140px]">
                      <p className="font-medium text-white text-sm">{c.actor}</p>
                      {c.role && <p className="text-gray-500 text-xs mt-0.5">{c.role}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setShowTrailer(false)}>

          {/* Close button — always visible top-right */}
          <button
            onClick={() => setShowTrailer(false)}
            className="fixed top-4 right-4 z-60 flex items-center gap-2 bg-white/10 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm transition-all duration-200 border border-white/20"
          >
            <X size={18} /> Close
          </button>

          <div className="w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            <p className="text-gray-400 text-sm mb-3 text-center">{movie.title} — Official Trailer</p>

            {ytId ? (
              <>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-900 shadow-2xl">
                  <iframe
                    key={ytId}
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-gray-600 text-sm mb-2">Video unavailable here?</p>
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Play size={16} className="fill-white" /> Watch on YouTube
                  </a>
                </div>
              </>
            ) : (
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl">
                <video src={movie.trailerUrl} controls autoPlay className="w-full h-full" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
