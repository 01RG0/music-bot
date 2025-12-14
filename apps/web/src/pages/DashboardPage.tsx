import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function DashboardPage() {
  const { user, guilds, logout } = useAuthStore()

  if (!user) {
    return <div>Please log in</div>
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Discord Music Bot</h1>
            <span className="text-gray-400">Dashboard</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user.avatar && (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-white">{user.username}#{user.discriminator}</span>
            </div>
            <button
              onClick={logout}
              className="btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome back, {user.username}!</h2>
            <p className="text-gray-400 mb-6">
              Control your Discord music bot from anywhere. Select a server below to manage music playback.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Live Control</h3>
                <p className="text-gray-400 text-sm">Control music playback in real-time</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Queue Management</h3>
                <p className="text-gray-400 text-sm">Manage your music queue with drag & drop</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
                <p className="text-gray-400 text-sm">View detailed statistics and insights</p>
              </div>
            </div>
          </div>

          {/* Guilds Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Servers</h2>
              <Link to="/guilds" className="btn-primary">
                View All Servers
              </Link>
            </div>

            {guilds.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">No Servers Found</h3>
                <p className="text-gray-400 mb-4">
                  You don't have any Discord servers where you can manage the music bot.
                </p>
                <p className="text-gray-500 text-sm">
                  Make sure you're a server administrator or have the required permissions.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guilds.slice(0, 6).map((guild) => (
                  <Link
                    key={guild.id}
                    to={`/guild/${guild.id}`}
                    className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      {guild.icon ? (
                        <img
                          src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                          alt={guild.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {guild.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-semibold truncate">{guild.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {guild.hasBot ? 'Bot Active' : 'Bot Not Added'}
                        </p>
                      </div>
                    </div>
                    <div className="text-blue-400 text-sm hover:text-blue-300">
                      Manage Music →
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {guilds.length > 6 && (
              <div className="text-center mt-6">
                <Link to="/guilds" className="btn-secondary">
                  View All {guilds.length} Servers
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
