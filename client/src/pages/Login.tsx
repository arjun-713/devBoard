import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/UI/Button';
import {
  Activity,
  Eye,
  EyeOff,
  Grip,
  Layout,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const featureHighlights = [
    { label: 'Secure token-based sessions', icon: ShieldCheck },
    { label: 'Drag-and-drop task delivery', icon: Grip },
    { label: 'Real-time activity tracking', icon: Activity },
  ];

  return (
    <div className="flex min-h-screen items-center bg-bg-base px-4 py-8 sm:py-10">
      <div className="mx-auto grid w-full max-w-[980px] gap-6 lg:grid-cols-[420px_460px] lg:justify-center lg:gap-6">
        <section className="rounded-[14px] border border-border bg-bg-surface p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange text-text-inverted">
              <Layout size={18} />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">DevBoard</h1>
            </div>
          </div>

          <p className="mt-4 text-[14px] leading-[1.6] text-text-secondary">
            Kanban workspace for engineers shipping weekly.
            <br />
            Keep planning, delivery, and collaboration in one place.
          </p>

          <div className="mt-6 grid gap-3">
            {featureHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border-subtle bg-bg-base px-3 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:bg-bg-elevated"
              >
                <item.icon size={14} className="text-brand-orange" />
                <p className="mt-2 text-[13px] leading-[1.45] text-text-secondary">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[14px] border border-[#2A2A2E] bg-[#141417] p-8 sm:p-9">
          <h2 className="text-[28px] font-semibold tracking-tight text-text-primary">Welcome back</h2>
          <p className="mt-1 text-[14px] text-text-secondary">Sign in to continue to your DevBoard workspace.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 ml-1 block text-[12px] uppercase tracking-[0.08em] text-text-secondary">
                Email
              </label>
              <div className="group flex h-11 items-center gap-2 rounded-lg border border-[#2A2A2E] bg-[#0F0F11] px-3 transition-all focus-within:border-brand-orange/60 focus-within:ring-1 focus-within:ring-brand-orange/35">
                <Mail size={14} className="text-text-muted group-focus-within:text-brand-orange" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-full w-full bg-transparent text-[13px] text-text-primary outline-none placeholder:text-text-muted"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 ml-1 block text-[12px] uppercase tracking-[0.08em] text-text-secondary">
                Password
              </label>
              <div className="group flex h-11 items-center gap-2 rounded-lg border border-[#2A2A2E] bg-[#0F0F11] px-3 transition-all focus-within:border-brand-orange/60 focus-within:ring-1 focus-within:ring-brand-orange/35">
                <Lock size={14} className="text-text-muted group-focus-within:text-brand-orange" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-full w-full bg-transparent text-[13px] text-text-primary outline-none placeholder:text-text-muted"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="text-text-muted transition-colors hover:text-text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-brand-pumpkin/25 bg-brand-pumpkin/10 px-3 py-2 text-[12px] text-brand-pumpkin">
                {error}
              </div>
            ) : null}

            <div className="space-y-2 pt-1">
              <Button type="submit" className="w-full" isLoading={loading}>
                Sign in
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full border border-border text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                isLoading={isDemoLoading}
                onClick={handleDemoLogin}
              >
                Try demo
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t border-border-subtle pt-4 text-[13px] text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-orange transition-colors hover:text-brand-orange/85">
              Create one
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
