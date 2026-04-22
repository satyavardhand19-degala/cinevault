import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';

// Pages (to be implemented)
import Home from './pages/user/Home';
import MovieDetail from './pages/user/MovieDetail';
import SearchResults from './pages/user/SearchResults';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { token, isTokenValid } = useAuthStore();
  if (!token || !isTokenValid()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/movies/:slug" element={<MovieDetail />} />
          <Route path="/search" element={<SearchResults />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
