import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../components/LoadingSpinner'

interface Playlist {
  _id: string
  name: string
  description?: string
  tracks: Array<{
    info: {
      title: string
      author: string
      artworkUrl?: string
      length: number
    }
  }>
  isPublic: boolean
  playCount: number
  createdAt: string
  updatedAt: string
}

interface Favorite {
  _id: string
  track: {
    info: {
      title: string
      author: string
      artworkUrl?: string
      length: number
    }
  }
  addedAt: string
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }
}

export function PlaylistsPage() {
  const { user } = useAuthStore()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'playlists' | 'favorites'>('playlists')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('')
  const [newPlaylistPublic, setNewPlaylistPublic] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [playlistsRes, favoritesRes] = await Promise.all([
        axios.get('/api/playlists'),
        axios.get('/api/playlists/favorites/list')
      ])

      setPlaylists(playlistsRes.data.data)
      setFavorites(favoritesRes.data.data)
    } catch (error: any) {
      console.error('Failed to fetch playlists:', error)
      toast.error('Failed to load playlists')
    } finally {
      setLoading(false)
    }
  }

  const createPlaylist = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPlaylistName.trim()) {
      toast.error('Playlist name is required')
      return
    }

    try {
      const response = await axios.post('/api/playlists', {
        name: newPlaylistName.trim(),
        description: newPlaylistDescription.trim(),
        isPublic: newPlaylistPublic
      })

      setPlaylists(prev => [response.data.data, ...prev])
      setShowCreateModal(false)
      setNewPlaylistName('')
      setNewPlaylistDescription('')
      setNewPlaylistPublic(false)

      toast.success('Playlist created successfully')
    } catch (error: any) {
      console.error('Failed to create playlist:', error)
      toast.error(error.response?.data?.error || 'Failed to create playlist')
    }
  }

  const deletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return

    try {
      await axios.delete(`/api/playlists/${playlistId}`)
      setPlaylists(prev => prev.filter(p => p._id !== playlistId))
      toast.success('Playlist deleted')
    } catch (error: any) {
      console.error('Failed to delete playlist:', error)
      toast.error('Failed to delete playlist')
    }
  }

  const removeFavorite = async (trackId: string) => {
    try {
      await axios.delete(`/api/playlists/favorites/${trackId}`)
      setFavorites(prev => prev.filter(f => f.track.info.identifier !== trackId))
      toast.success('Removed from favorites')
    } catch (error: any) {
      console.error('Failed to remove favorite:', error)
      toast.error('Failed to remove from favorites')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Please log in</h2>
          <Link to="/auth" className="btn-primary">Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-white">My Music</h1>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Playlist</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 px-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('playlists')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'playlists'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Playlists ({playlists.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'favorites'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Favorites ({favorites.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : activeTab === 'playlists' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.length === 0 ? (
              <div className="col-span-full card text-center py-12">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">No Playlists Yet</h3>
                <p className="text-gray-400 mb-6">Create your first playlist to get started!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Playlist
                </button>
              </div>
            ) : (
              playlists.map((playlist) => (
                <div key={playlist._id} className="card group hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 truncate">
                        {playlist.name}
                      </h3>
                      {playlist.description && (
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                          {playlist.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{playlist.tracks.length} tracks</span>
                        <span>{playlist.playCount} plays</span>
                        {playlist.isPublic && (
                          <span className="text-green-400">Public</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => deletePlaylist(playlist._id)}
                        className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors duration-200"
                        title="Delete playlist"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Track Preview */}
                  {playlist.tracks.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {playlist.tracks.slice(0, 3).map((track, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          {track.info.artworkUrl ? (
                            <img
                              src={track.info.artworkUrl}
                              alt={track.info.title}
                              className="w-8 h-8 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-600 rounded flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white truncate">{track.info.title}</p>
                            <p className="text-gray-400 truncate">{track.info.author}</p>
                          </div>
                          <span className="text-gray-500">{formatDuration(track.info.length)}</span>
                        </div>
                      ))}
                      {playlist.tracks.length > 3 && (
                        <p className="text-gray-500 text-sm">
                          +{playlist.tracks.length - 3} more tracks
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      Created {new Date(playlist.createdAt).toLocaleDateString()}
                    </span>
                    <button className="btn-secondary text-sm">
                      Play All
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.length === 0 ? (
              <div className="card text-center py-12">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">No Favorites Yet</h3>
                <p className="text-gray-400">Heart tracks you love to add them to your favorites!</p>
              </div>
            ) : (
              favorites.map((favorite) => (
                <div key={favorite._id} className="card hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    {favorite.track.info.artworkUrl ? (
                      <img
                        src={favorite.track.info.artworkUrl}
                        alt={favorite.track.info.title}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-600 rounded flex-shrink-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {favorite.track.info.title}
                      </h3>
                      <p className="text-gray-400 truncate">{favorite.track.info.author}</p>
                      <p className="text-gray-500 text-sm">
                        Added {new Date(favorite.addedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">
                        {formatDuration(favorite.track.info.length)}
                      </span>
                      <button
                        onClick={() => removeFavorite(favorite.track.info.identifier || favorite._id)}
                        className="p-2 rounded text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors duration-200"
                        title="Remove from favorites"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Create Playlist</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={createPlaylist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="input-primary w-full"
                  placeholder="My Awesome Playlist"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  className="input-primary w-full resize-none"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newPlaylistPublic}
                  onChange={(e) => setNewPlaylistPublic(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-300">
                  Make playlist public
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
