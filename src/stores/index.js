import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

// PDF Editor Store
export const usePDFStore = create(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Document state
      currentDocument: null,
      documentPages: [],
      currentPage: 1,
      totalPages: 0,
      isLoading: false,
      error: null,

      // Viewer state
      scale: 1.0,
      rotation: 0,
      viewMode: 'single', // 'single', 'continuous', 'facing'
      fitMode: 'width', // 'width', 'height', 'page', 'auto'

      // UI state
      sidebarOpen: true,
      sidebarTab: 'thumbnails', // 'thumbnails', 'bookmarks', 'annotations'
      toolbarVisible: true,
      selectedTool: 'select', // 'select', 'text', 'highlight', 'draw', 'shape'

      // Annotations state
      annotations: [],
      selectedAnnotation: null,
      annotationMode: false,

      // Form state
      formFields: [],
      formMode: false,

      // Collaboration state
      collaborators: [],
      isCollaborating: false,

      // Document Management
      recentDocuments: JSON.parse(localStorage.getItem('pdf-editor-recent') || '[]'),
      favoriteDocuments: JSON.parse(localStorage.getItem('pdf-editor-favorites') || '[]'),

      // Actions
      setDocument: (document) => set({ currentDocument: document }),
      
      setDocumentPages: (pages) => set({ 
        documentPages: pages,
        totalPages: pages.length 
      }),

      setCurrentPage: (page) => set({ currentPage: page }),

      setScale: (scale) => set({ scale: Math.max(0.1, Math.min(5.0, scale)) }),

      setRotation: (rotation) => set({ rotation: rotation % 360 }),

      setViewMode: (mode) => set({ viewMode: mode }),

      setFitMode: (mode) => set({ fitMode: mode }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setSidebarTab: (tab) => set({ sidebarTab: tab }),

      setSelectedTool: (tool) => set({ selectedTool: tool }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      // Annotation actions
      addAnnotation: (annotation) => set((state) => ({
        annotations: [...state.annotations, { ...annotation, id: Date.now() }]
      })),

      updateAnnotation: (id, updates) => set((state) => ({
        annotations: state.annotations.map(ann => 
          ann.id === id ? { ...ann, ...updates } : ann
        )
      })),

      deleteAnnotation: (id) => set((state) => ({
        annotations: state.annotations.filter(ann => ann.id !== id),
        selectedAnnotation: state.selectedAnnotation?.id === id ? null : state.selectedAnnotation
      })),

      setSelectedAnnotation: (annotation) => set({ selectedAnnotation: annotation }),

      // Zoom actions
      zoomIn: () => set((state) => ({ 
        scale: Math.min(5.0, state.scale * 1.25) 
      })),

      zoomOut: () => set((state) => ({ 
        scale: Math.max(0.1, state.scale / 1.25) 
      })),

      resetZoom: () => set({ scale: 1.0 }),

      // Page navigation
      nextPage: () => set((state) => ({
        currentPage: Math.min(state.totalPages, state.currentPage + 1)
      })),

      previousPage: () => set((state) => ({
        currentPage: Math.max(1, state.currentPage - 1)
      })),

      goToPage: (page) => set((state) => ({
        currentPage: Math.max(1, Math.min(state.totalPages, page))
      })),

      // Reset state
      resetDocument: () => set({
        currentDocument: null,
        documentPages: [],
        currentPage: 1,
        totalPages: 0,
        annotations: [],
        selectedAnnotation: null,
        formFields: [],
        scale: 1.0,
        rotation: 0,
        error: null
      }),

      // Document Management Methods
      addToRecent: (document) => set((state) => {
        const recent = [document, ...state.recentDocuments.filter(d => d.id !== document.id)].slice(0, 10);
        localStorage.setItem('pdf-editor-recent', JSON.stringify(recent));
        return { recentDocuments: recent };
      }),

      addToFavorites: (document) => set((state) => {
        if (state.favoriteDocuments.find(d => d.id === document.id)) return state;
        const favorites = [...state.favoriteDocuments, { ...document, favorited: Date.now() }];
        localStorage.setItem('pdf-editor-favorites', JSON.stringify(favorites));
        return { favoriteDocuments: favorites };
      }),

      removeFromFavorites: (documentId) => set((state) => {
        const favorites = state.favoriteDocuments.filter(d => d.id !== documentId);
        localStorage.setItem('pdf-editor-favorites', JSON.stringify(favorites));
        return { favoriteDocuments: favorites };
      }),

      loadDocument: async (document) => {
        set({ isLoading: true, error: null });
        try {
          // Add to recent documents
          get().addToRecent(document);
          // Set as current document
          set({ currentDocument: document, isLoading: false });
          return document;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      }
    })),
    {
      name: 'pdf-editor-store'
    }
  )
)

// User/Auth Store
export const useAuthStore = create(
  devtools((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setLoading: (loading) => set({ isLoading: loading }),
    logout: () => set({ user: null, isAuthenticated: false })
  }), {
    name: 'auth-store'
  })
)

// UI Store for global UI state
export const useUIStore = create(
  devtools((set) => ({
    theme: 'light',
    sidebarCollapsed: false,
    modalOpen: null, // null, 'settings', 'share', 'export'
    notifications: [],
    
    setTheme: (theme) => set({ theme }),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    setModalOpen: (modal) => set({ modalOpen: modal }),
    
    addNotification: (notification) => set((state) => ({
      notifications: [...state.notifications, { 
        ...notification, 
        id: Date.now(),
        timestamp: new Date()
      }]
    })),
    
    removeNotification: (id) => set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),
    
    clearNotifications: () => set({ notifications: [] })
  }), {
    name: 'ui-store'
  })
)
