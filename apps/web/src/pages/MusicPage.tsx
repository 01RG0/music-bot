import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useMusicStore } from '../stores/musicStore'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { MusicPlayer } from '../components/MusicPlayer'
import { QueueManager } from '../components/QueueManager'
import { SearchBar } from '../components/SearchBar'
import { Sidebar } from '../components/Sidebar'

export function MusicPage() {
  const { guildId } = useParams()
  const { user, guilds } = useAuthStore()
  const { connect, disconnect, isConnected } = useMusicStore()
  const [isLoading, setIsLoading] = useState(true)

  const guild = guilds.find(g => g.id === guildId)

  useEffect(() => {
    if (guildId) {
      connect(guildId)
      setIsLoading(false)
    }

    return () => {
      disconnect()
    }
  }, [guildId, connect, disconnect])

  if (!user || !guild) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-6">You don't have permission to access this server.</p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar guild={guild} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div className="flex items-center space-x-3">
                {guild.icon ? (
                  <img
                    src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                    alt={guild.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {guild.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-white">{guild.name}</h1>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-gray-400">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link to={`/guild/${guildId}/stats`} className="btn-secondary text-sm">
                Statistics
              </Link>
              <Link to={`/guild/${guildId}/settings`} className="btn-secondary text-sm">
                Settings
              </Link>
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
          <SearchBar />
        </div>

        {/* Music Player */}
        <div className="px-6 py-6">
          <MusicPlayer />
        </div>

        {/* Queue Manager */}
        <div className="flex-1 px-6 pb-6">
          <QueueManager />
        </div>
      </div>
    </div>
  )
}
