import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const MovieCard = ({ movie }: { movie: any }) => {
  return (
    <Link to={`/movies/${movie.slug}`} className="group block card-hover">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg shadow-lg">
        <img 
          src={movie.posterUrl} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium">{movie.rating}</span>
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <p className="text-gray-400 text-sm">
          {new Date(movie.releaseDate).getFullYear()} • {movie.genres[0]}
        </p>
      </div>
    </Link>
  );
};

export default MovieCard;
