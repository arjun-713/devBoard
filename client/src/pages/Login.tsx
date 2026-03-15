import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/UI/Button';
import { Layout } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const { login, loginDemo, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    await loginDemo();
    setIsDemoLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-brand-orange/10 flex items-center justify-center rounded-xl mb-4 border border-brand-orange/20">
            <Layout className="text-brand-orange w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Welcome back</h1>
          <p className="text-text-secondary mt-2">Log in to your DevBoard account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary mb-1.5 ml-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg-base border border-border rounded-lg h-10 px-3 text-[13px] text-text-primary focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 outline-none transition-all"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary mb-1.5 ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-base border border-border rounded-lg h-10 px-3 text-[13px] text-text-primary focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-[12px] text-brand-pumpkin bg-brand-pumpkin/10 px-3 py-2 rounded-md border border-brand-pumpkin/20">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={loading}>
            Sign in
          </Button>
        </form>

        <Button
          type="button"
          variant="secondary"
          className="w-full mt-3"
          isLoading={isDemoLoading}
          onClick={handleDemoLogin}
        >
          Try Demo →
        </Button>

        <p className="text-center mt-6 text-text-secondary text-[13px]">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-orange hover:underline font-medium">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};
