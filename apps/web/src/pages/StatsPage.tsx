import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'
import { LoadingSpinner } from '../components/LoadingSpinner'

interface StatsData {
  totalTracksPlayed: number
  totalListeningTime: number
  mostPlayedTracks: Array<{
    track: {
      info: {
        title: string
        author: string
        artworkUrl?: string
      }
    }
    playCount: number
  }>
  activeUsers: Array<{
    user?: {
      username: string
      discriminator: string
      avatar?: string
    }
    tracksPlayed: number
    timeListened: number
  }>
  peakConcurrentUsers: number
  averageSessionLength: number
  commandsUsed: Record<string, number>
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function StatsPage() {
  const { guildId } = useParams()
  const { user, guilds } = useAuthStore()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const guild = guilds.find(g => g.id === guildId)

  useEffect(() => {
    if (guildId) {
      fetchStats()
    }
  }, [guildId])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`/api/stats/${guildId}`)
      setStats(response.data.data)
    } catch (error: any) {
      console.error('Failed to fetch stats:', error)
      setError(error.response?.data?.error || 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !guild) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to view these statistics.</p>
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
            <Link to={`/guild/${guildId}`} className="text-gray-400 hover:text-white">
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
                <h1 className="text-xl font-bold text-white">Statistics</h1>
                <p className="text-sm text-gray-400">{guild.name}</p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="card text-center py-12">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Statistics</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button onClick={fetchStats} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : !stats ? (
          <div className="card text-center py-12">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">No Statistics Available</h3>
            <p className="text-gray-400">Statistics will appear once music has been played in this server.</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{formatNumber(stats.totalTracksPlayed)}</h3>
                <p className="text-gray-400 text-sm">Tracks Played</p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{formatDuration(stats.totalListeningTime)}</h3>
                <p className="text-gray-400 text-sm">Total Listening Time</p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stats.peakConcurrentUsers}</h3>
                <p className="text-gray-400 text-sm">Peak Users</p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{formatDuration(stats.averageSessionLength)}</h3>
                <p className="text-gray-400 text-sm">Avg Session</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Most Played Tracks */}
              <div className="card">
                <h2 className="text-xl font-semibold text-white mb-4">Most Played Tracks</h2>
                {stats.mostPlayedTracks.length === 0 ? (
                  <p className="text-gray-400">No tracks played yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.mostPlayedTracks.slice(0, 10).map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">#{index + 1}</span>
                        </div>

                        {item.track.info.artworkUrl && (
                          <img
                            src={item.track.info.artworkUrl}
                            alt={item.track.info.title}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{item.track.info.title}</h4>
                          <p className="text-gray-400 text-sm truncate">{item.track.info.author}</p>
                        </div>

                        <div className="text-gray-400 text-sm">
                          {item.playCount}x
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Users */}
              <div className="card">
                <h2 className="text-xl font-semibold text-white mb-4">Most Active Users</h2>
                {stats.activeUsers.length === 0 ? (
                  <p className="text-gray-400">No active users yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.activeUsers.slice(0, 10).map((user, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">#{index + 1}</span>
                        </div>

                        {user.user?.avatar && (
                          <img
                            src={`https://cdn.discordapp.com/avatars/${user.user.username}/${user.user.avatar}.png`}
                            alt={user.user.username}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">
                            {user.user ? `${user.user.username}#${user.user.discriminator}` : 'Unknown User'}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {user.tracksPlayed} tracks • {formatDuration(user.timeListened)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Command Usage */}
            {stats.commandsUsed && Object.keys(stats.commandsUsed).length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold text-white mb-4">Command Usage</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Object.entries(stats.commandsUsed)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 12)
                    .map(([command, count]) => (
                      <div key={command} className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{count}</div>
                        <div className="text-gray-400 text-sm capitalize">/{command}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
