import { create } from 'zustand'

export type ThemeMode = 'system' | 'light' | 'dark'
export type ToolPanel = 'events' | null

type AppStore = {
  theme: ThemeMode
  activeToolPanel: ToolPanel
  setTheme: (theme: ThemeMode) => void
  setActiveToolPanel: (panel: ToolPanel) => void
  toggleToolPanel: (panel: 'events') => void
}

export const useAppStore = create<AppStore>()((set) => ({
  theme: 'system',
  activeToolPanel: null,
  setTheme: (theme) => set({ theme }),
  setActiveToolPanel: (activeToolPanel) => set({ activeToolPanel }),
  toggleToolPanel: (panel) =>
    set((state) => ({
      activeToolPanel: state.activeToolPanel === panel ? null : panel,
    })),
}))
