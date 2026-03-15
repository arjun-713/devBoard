import { create } from 'zustand';

interface UIState {
  isSidebarCollapsed: boolean;
  activeModal: string | null;
  isDemoBannerDismissed: boolean;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  dismissDemoBanner: () => void;
  resetDemoBanner: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  activeModal: null,
  isDemoBannerDismissed: false,
  toasts: [],

  toggleSidebar: () => set((state: UIState) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  openModal: (modalId: string) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  dismissDemoBanner: () => set({ isDemoBannerDismissed: true }),
  resetDemoBanner: () => set({ isDemoBannerDismissed: false }),
  addToast: (message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substring(7);
    set((state: UIState) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state: UIState) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },
  removeToast: (id: string) => set((state: UIState) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),
}));
