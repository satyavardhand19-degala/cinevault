import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import MovieCard from '../../components/user/MovieCard';

const Home = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const response = await api.get('/movies');
      return response.data;
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading movies...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading movies</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-primary">CineVault</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.data?.movies.map((movie: any) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default Home;
