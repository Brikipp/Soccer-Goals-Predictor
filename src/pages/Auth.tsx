import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const [configError, setConfigError] = useState<string | null>(null);
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Check environment variables
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      setConfigError('Missing Supabase configuration. Please check your environment variables.');
    }
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    const result = await signUp(email, password);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  // Show configuration error if environment variables are missing
  if (configError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <AlertCircle className="text-red-600" size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
            Configuration Error
          </h1>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">{configError}</p>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">To fix this issue:</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Create a <code className="bg-gray-200 px-1 rounded">.env</code> file in your project root</li>
                <li>Add your Supabase credentials:</li>
              </ol>
              <pre className="bg-gray-800 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
              </pre>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside mt-2">
                <li>Restart the development server</li>
              </ol>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show the auth form
  return (
    <AuthForm
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      loading={loading}
      error=""
    />
  );
}
