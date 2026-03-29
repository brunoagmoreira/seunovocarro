// Dummy Supabase client to satisfy leftover compiler references from Phase 1
// In a real production scenario these UI components would be fully wired to the NestJS API
export const supabase = {
  from: (table: string) => ({
    insert: async (data: any) => ({ error: null, data: null }),
    select: (cols?: string) => ({ 
      eq: (col: string, val: any) => ({ 
        single: async () => ({ data: null, error: null }),
        order: () => ({ limit: async () => ({ data: [], error: null }) })
      }),
      order: () => ({ limit: async () => ({ data: [], error: null }) })
    })
  }),
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => ({ error: null, data: { path: '' } }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: 'https://placeholder.com/image.jpg' } })
    })
  },
  removeChannel: () => {},
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
} as any;
