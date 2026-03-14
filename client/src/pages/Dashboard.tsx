import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/UI/Button';
import { LogOut, Layout } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Sidebar Placeholder */}
      <aside className="w-[220px] border-r border-border bg-bg-surface flex flex-col">
        <div className="h-[52px] flex items-center px-6 border-b border-border">
          <Layout className="text-brand-orange w-5 h-5 mr-2" />
          <span className="font-semibold text-text-primary">DevBoard</span>
        </div>
        <div className="p-4 flex-1">
          <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-muted mb-4">
            Navigation
          </div>
          {/* Sidebar items here */}
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-[12px] font-bold text-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[13px] font-medium text-text-primary truncate">{user?.name}</div>
              <div className="text-[11px] text-text-muted truncate">{user?.email}</div>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-2" onClick={logout}>
            <LogOut size={14} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-[52px] border-b border-border flex items-center justify-between px-6 bg-bg-base/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-[15px] font-semibold text-text-primary">Main Board</h2>
        </header>

        <div className="flex-1 overflow-x-auto p-6">
           <div className="flex gap-4 h-full">
              {/* Columns will go here */}
              <div className="text-text-muted text-sm mt-10">
                Welcome to DevBoard! Start by creating a board or adding tasks.
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};
