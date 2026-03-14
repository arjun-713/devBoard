import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBoards } from '@/hooks/useBoards';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/UI/Button';
import { Board } from '@/components/Board/Board';
import { 
  LogOut, 
  Layout, 
  Plus, 
  Search, 
  Bell, 
  Settings,
  ChevronRight,
  Layer
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { boards, activeBoardId, setActiveBoard } = useBoards();
  const { tasks } = useTasks(activeBoardId);

  const activeBoard = boards.find(b => b.id === activeBoardId || (b as any)._id === activeBoardId);

  return (
    <div className="min-h-screen bg-bg-base flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] border-r border-border bg-bg-surface flex flex-col shrink-0">
        <div className="h-[52px] flex items-center px-4 border-b border-border">
          <div className="w-7 h-7 bg-brand-orange flex items-center justify-center rounded-lg mr-2 shrink-0 shadow-lg shadow-brand-orange/10">
            <Layer className="text-bg-base w-4 h-4" />
          </div>
          <span className="font-semibold text-text-primary tracking-tight">DevBoard</span>
        </div>

        <div className="p-3 flex-1 space-y-6 overflow-y-auto scrollbar-none">
          <div>
            <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-text-muted mb-2 px-2">
              Workspace
            </div>
            <div className="space-y-0.5">
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md bg-bg-elevated text-text-primary text-[13px] font-medium transition-all">
                <Search size={14} className="text-text-muted" />
                <span>Search</span>
                <span className="ml-auto text-[10px] bg-bg-overlay px-1 rounded border border-border">⌘K</span>
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-elevated text-[13px] transition-all">
                <Bell size={14} />
                <span>Inbox</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-text-muted">
                Boards
              </div>
              <button className="text-text-muted hover:text-text-primary">
                <Plus size={12} />
              </button>
            </div>
            <div className="space-y-0.5">
              {boards.map((board: any) => (
                <button 
                  key={board._id} 
                  onClick={() => setActiveBoard(board._id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-all ${
                    activeBoardId === board._id 
                      ? 'bg-bg-overlay text-text-primary font-medium border border-border-strong' 
                      : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${activeBoardId === board._id ? 'bg-brand-orange shadow-[0_0_8px_rgba(255,158,0,0.5)]' : 'bg-text-muted'}`} />
                  <span className="truncate">{board.name}</span>
                </button>
              ))}
              {boards.length === 0 && (
                <div className="px-2 py-4 text-[12px] text-text-muted italic border border-dashed border-border rounded-lg text-center mx-1">
                  No boards found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-border bg-bg-surface/50">
          <div className="flex items-center gap-2.5 p-1 mb-2 hover:bg-bg-elevated rounded-lg transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-brand-blue-deep border border-brand-blue flex items-center justify-center text-[12px] font-bold text-white shrink-0 shadow-inner">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[12px] font-semibold text-text-primary truncate">{user?.name}</div>
              <div className="text-[10px] text-text-muted truncate lowercase">{user?.email}</div>
            </div>
            <ChevronRight size={12} className="text-text-muted group-hover:text-text-primary opacity-50 group-hover:opacity-100 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-1 px-1">
             <Button variant="ghost" size="sm" className="justify-center h-8" onClick={() => {}}>
                <Settings size={13} className="mr-1.5" />
                Config
             </Button>
             <Button variant="ghost" size="sm" className="justify-center h-8 hover:text-brand-pumpkin hover:bg-brand-pumpkin/5" onClick={logout}>
                <LogOut size={13} className="mr-1.5" />
                Exit
             </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-bg-base relative min-w-0">
        <header className="h-[52px] border-b border-border flex items-center justify-between px-6 bg-bg-base/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <h2 className="text-[14px] font-semibold text-text-primary tracking-tight">
                {activeBoard ? activeBoard.name : 'Select a board'}
             </h2>
             {activeBoard && (
               <div className="flex items-center bg-bg-surface border border-border rounded-md px-1.5 py-0.5 gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                  <span className="text-[10px] font-medium text-text-secondary uppercase tracking-widest">Active</span>
               </div>
             )}
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center bg-bg-surface border border-border rounded-lg p-0.5 mr-2">
                <button className="px-3 py-1 text-[12px] font-medium text-text-primary bg-bg-elevated rounded-md border border-border-strong shadow-sm">Board</button>
                <button className="px-3 py-1 text-[12px] font-medium text-text-muted hover:text-text-secondary transition-colors">List</button>
             </div>
             <Button size="sm" className="shadow-lg shadow-brand-orange/20">
                <Plus size={14} className="mr-1.5" />
                Add Task
             </Button>
          </div>
        </header>

        <div className="flex-1 overflow-x-auto p-6 scrollbar-thin">
           {activeBoard ? (
              <Board 
                columns={activeBoard.columns || ['To Do', 'In Progress', 'Done']} 
                tasks={tasks}
              />
           ) : (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-bg-surface border border-border rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                  <Layout className="text-text-muted w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">No board selected</h3>
                <p className="text-text-secondary mt-2 text-[13px] leading-relaxed">
                  Select a board from the sidebar to view your tasks or create a new one to get started.
                </p>
                <Button className="mt-6" variant="secondary">
                  Create your first board
                </Button>
              </div>
           )}
        </div>
      </main>
    </div>
  );
};
