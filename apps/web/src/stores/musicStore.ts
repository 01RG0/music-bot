import { create } from 'zustand'
import io, { Socket } from 'socket.io-client'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Track {
  track: string
  info: {
    identifier: string
    title: string
    author: string
    length: number
    uri: string
    artworkUrl?: string
  }
  requester: string
  requestedAt: Date
}

interface PlayerState {
  guildId: string
  currentTrack?: Track
  queue: Track[]
  isPlaying: boolean
  isPaused: boolean
  position: number
  volume: number
  loop: 'off' | 'track' | 'queue'
  filters: Record<string, any>
  autoplay: boolean
}

interface MusicState {
  // Connection
  socket: Socket | null
  isConnected: boolean
  currentGuildId: string | null

  // Player State
  playerState: PlayerState | null

  // UI State
  isSearching: boolean
  searchResults: Track[]
  searchQuery: string

  // Actions
  connect: (guildId: string) => void
  disconnect: () => void

  // Player Controls
  playTrack: (query: string) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  skip: () => Promise<void>
  stop: () => Promise<void>
  setVolume: (volume: number) => Promise<void>
  seek: (position: number) => Promise<void>
  applyFilter: (preset: string) => Promise<void>
  setLoop: (mode: 'off' | 'track' | 'queue') => Promise<void>
  toggleAutoplay: () => Promise<void>

  // Queue Management
  addToQueue: (query: string) => Promise<void>
  removeFromQueue: (index: number) => Promise<void>
  moveInQueue: (from: number, to: number) => Promise<void>
  clearQueue: () => Promise<void>
  shuffleQueue: () => Promise<void>

  // Search
  search: (query: string) => Promise<void>
  clearSearch: () => void
}

export const useMusicStore = create<MusicState>((set, get) => ({
  socket: null,
  isConnected: false,
  currentGuildId: null,
  playerState: null,
  isSearching: false,
  searchResults: [],
  searchQuery: '',

  connect: (guildId: string) => {
    const { socket } = get()
    if (socket?.connected) {
      socket.disconnect()
    }

    const newSocket = io('http://localhost:4000', {
      auth: {
        token: localStorage.getItem('accessToken')
      }
    })

    newSocket.on('connect', () => {
      console.log('Connected to music server')
      set({ isConnected: true, currentGuildId: guildId })

      // Subscribe to guild events
      newSocket.emit('subscribe:guild', guildId)

      toast.success('Connected to music server')
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from music server')
      set({ isConnected: false })
      toast.error('Disconnected from music server')
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      toast.error('Failed to connect to music server')
    })

    // Player events
    newSocket.on('player:play', (data) => {
      set((state) => ({
        playerState: state.playerState ? {
          ...state.playerState,
          currentTrack: data.track,
          isPlaying: true,
          isPaused: false
        } : null
      }))
    })

    newSocket.on('player:pause', () => {
      set((state) => ({
        playerState: state.playerState ? {
          ...state.playerState,
          isPaused: true
        } : null
      }))
    })

    newSocket.on('player:resume', () => {
      set((state) => ({
        playerState: state.playerState ? {
          ...state.playerState,
          isPaused: false
        } : null
      }))
    })

    newSocket.on('player:stop', () => {
      set((state) => ({
        playerState: state.playerState ? {
          ...state.playerState,
          isPlaying: false,
          isPaused: false,
          currentTrack: undefined
        } : null
      }))
    })

    newSocket.on('player:volume', (data) => {
      set((state) => ({
        playerState: state.playerState ? {
          ...state.playerState,
          volume: data.volume
        } : null
      }))
    })

    // Queue events
    newSocket.on('queue:update', (data) => {
      set((state) => ({
        playerState: state.playerState ? {
          ...state.playerState,
          queue: data.queue
        } : null
      }))
    })

    newSocket.on('queue:add', (data) => {
      set((state) => ({
        playerState: state.playerState ? {
          ...state.playerState,
          queue: [...state.playerState.queue, ...data.tracks]
        } : null
      }))
      toast.success(`Added ${data.tracks.length} track(s) to queue`)
    })

    newSocket.on('queue:remove', (data) => {
      set((state) => ({
        playerState: state.playerState ? {
          ...state.playerState,
          queue: state.playerState.queue.filter((_, i) => i !== data.index)
        } : null
      }))
      toast.success('Track removed from queue')
    })

    newSocket.on('queue:clear', () => {
      set((state) => ({
        playerState: state.playerState ? {
          ...state.playerState,
          queue: []
        } : null
      }))
      toast.success('Queue cleared')
    })

    newSocket.on('queue:shuffle', (data) => {
      set((state) => ({
        playerState: state.playerState ? {
          ...state.playerState,
          queue: data.newQueue
        } : null
      }))
      toast.success('Queue shuffled')
    })

    // Track events
    newSocket.on('track:start', (data) => {
      set((state) => ({
        playerState: state.playerState ? {
          ...state.playerState,
          currentTrack: data.track,
          isPlaying: true,
          isPaused: false
        } : null
      }))
    })

    newSocket.on('track:end', (data) => {
      console.log('Track ended:', data)
    })

    newSocket.on('track:error', (data) => {
      toast.error(`Playback error: ${data.error}`)
    })

    set({ socket: newSocket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({
        socket: null,
        isConnected: false,
        currentGuildId: null,
        playerState: null
      })
    }
  },

  // Player Controls
  playTrack: async (query: string) => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    try {
      socket.emit('web:play', { guildId: currentGuildId, query })
    } catch (error) {
      toast.error('Failed to play track')
    }
  },

  pause: async () => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:control', {
      guildId: currentGuildId,
      action: 'pause'
    })
  },

  resume: async () => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:control', {
      guildId: currentGuildId,
      action: 'resume'
    })
  },

  skip: async () => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:control', {
      guildId: currentGuildId,
      action: 'skip'
    })
  },

  stop: async () => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:control', {
      guildId: currentGuildId,
      action: 'stop'
    })
  },

  setVolume: async (volume: number) => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:control', {
      guildId: currentGuildId,
      action: 'volume',
      params: { volume }
    })
  },

  seek: async (position: number) => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:control', {
      guildId: currentGuildId,
      action: 'seek',
      params: { position }
    })
  },

  applyFilter: async (preset: string) => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:control', {
      guildId: currentGuildId,
      action: 'filterPreset',
      params: { preset }
    })
  },

  setLoop: async (mode: 'off' | 'track' | 'queue') => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:loop', {
      guildId: currentGuildId,
      mode
    })
  },

  toggleAutoplay: async () => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:autoplay', {
      guildId: currentGuildId,
      enabled: !get().playerState?.autoplay
    })
  },

  // Queue Management
  addToQueue: async (query: string) => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:queue', {
      guildId: currentGuildId,
      action: 'add',
      params: { query }
    })
  },

  removeFromQueue: async (index: number) => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:queue', {
      guildId: currentGuildId,
      action: 'remove',
      params: { index }
    })
  },

  moveInQueue: async (from: number, to: number) => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:queue', {
      guildId: currentGuildId,
      action: 'move',
      params: { from, to }
    })
  },

  clearQueue: async () => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:queue', {
      guildId: currentGuildId,
      action: 'clear'
    })
  },

  shuffleQueue: async () => {
    const { socket, currentGuildId } = get()
    if (!socket || !currentGuildId) return

    socket.emit('web:queue', {
      guildId: currentGuildId,
      action: 'shuffle'
    })
  },

  // Search
  search: async (query: string) => {
    if (!query.trim()) return

    set({ isSearching: true, searchQuery: query })

    try {
      // For now, we'll use the play endpoint to search
      // In a real implementation, you'd have a separate search endpoint
      const response = await axios.post(`/api/music/${get().currentGuildId}/queue`, { query })
      const tracks = response.data.data || []

      set({ searchResults: tracks, isSearching: false })
    } catch (error) {
      console.error('Search error:', error)
      set({ searchResults: [], isSearching: false })
      toast.error('Search failed')
    }
  },

  clearSearch: () => {
    set({ searchResults: [], searchQuery: '', isSearching: false })
  }
}))
