import React, { useState } from 'react';
import { authService } from '../services/auth';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

interface AuthProps {
  onAuth: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        await authService.signUp(formData.email, formData.password, formData.username);
      } else {
        await authService.signIn(formData.email, formData.password);
      }
      onAuth();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await authService.signInWithGoogle();
      // Note: OAuth redirects, so onAuth will be called after redirect
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 dark:bg-zinc-950 bg-white dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center font-bold text-zinc-950 text-3xl shadow-lg shadow-emerald-500/20 mx-auto mb-4">
            M
          </div>
          <h1 className="text-4xl font-bold text-white dark:text-white text-zinc-900 dark:text-white mb-2">Motixion</h1>
          <p className="text-zinc-400 dark:text-zinc-400 text-zinc-600 dark:text-zinc-400">Gamify your productivity journey</p>
        </div>

        <div className="bg-zinc-900 dark:bg-zinc-900 bg-white dark:bg-zinc-900 border border-zinc-800 dark:border-zinc-800 border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <div className="flex gap-2 mb-6 bg-zinc-950 dark:bg-zinc-950 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'text-zinc-400 dark:text-zinc-400 text-zinc-600 dark:text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'text-zinc-400 dark:text-zinc-400 text-zinc-600 dark:text-zinc-400 hover:text-zinc-200 dark:hover:text-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 text-zinc-600 dark:text-zinc-400 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-zinc-950 dark:bg-zinc-950 bg-zinc-100 dark:bg-zinc-950 border border-zinc-800 dark:border-zinc-800 border-zinc-300 dark:border-zinc-800 rounded-xl p-3 text-white dark:text-white text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="johndoe"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 text-zinc-600 dark:text-zinc-400 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-zinc-950 dark:bg-zinc-950 bg-zinc-100 dark:bg-zinc-950 border border-zinc-800 dark:border-zinc-800 border-zinc-300 dark:border-zinc-800 rounded-xl p-3 text-white dark:text-white text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 text-zinc-600 dark:text-zinc-400 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-zinc-950 dark:bg-zinc-950 bg-zinc-100 dark:bg-zinc-950 border border-zinc-800 dark:border-zinc-800 border-zinc-300 dark:border-zinc-800 rounded-xl p-3 text-white dark:text-white text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 dark:disabled:bg-zinc-800 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 disabled:text-zinc-500 dark:disabled:text-zinc-500 disabled:text-zinc-600 dark:disabled:text-zinc-500 text-zinc-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  {mode === 'signin' ? <LogIn size={20} /> : <UserPlus size={20} />}
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800 dark:border-zinc-800 border-zinc-300 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 dark:bg-zinc-900 bg-white dark:bg-zinc-900 px-2 text-zinc-400 dark:text-zinc-400 text-zinc-600 dark:text-zinc-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white dark:bg-white hover:bg-zinc-50 dark:hover:bg-zinc-50 disabled:bg-zinc-300 dark:disabled:bg-zinc-300 disabled:cursor-not-allowed border border-zinc-300 dark:border-zinc-300 text-zinc-900 dark:text-zinc-900 font-medium py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};
