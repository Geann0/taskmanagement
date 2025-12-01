import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { socketService } from '../lib/socket';

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have token from OAuth callback
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    const errorParam = params.get('error');

    if (errorParam) {
      setError('Authentication failed. Please try again.');
      // Clean URL
      window.history.replaceState({}, document.title, '/login');
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setUser(user);
        setToken(token);
        socketService.connect(token);

        // Clean URL and navigate
        window.history.replaceState({}, document.title, '/login');
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to process authentication');
      }
    }
  }, [setUser, setToken, navigate]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);

    // Redirect to backend OAuth endpoint
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/auth/oauth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Task Manager</h1>
            <p className="text-gray-600 mt-2">Collaborate in real-time</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <p className="text-center text-gray-600 text-sm mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
