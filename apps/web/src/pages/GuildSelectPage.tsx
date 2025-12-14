import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function GuildSelectPage() {
  const { guilds } = useAuthStore()

  if (guilds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="text-2xl font-semibold text-white mb-4">No Servers Found</h2>
          <p className="text-gray-400 mb-6">
            You don't have any Discord servers where you can manage the music bot.
            Make sure you're a server administrator or have the required permissions.
          </p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
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
            <h1 className="text-2xl font-bold text-white">Select Server</h1>
          </div>
        </div>
      </header>

      {/* Guild Grid */}
      <main className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Choose a Server</h2>
            <p className="text-gray-400">
              Select a Discord server to manage music playback and settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guilds.map((guild) => (
              <Link
                key={guild.id}
                to={`/guild/${guild.id}`}
                className="card hover:bg-gray-700 transition-colors duration-200 group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  {guild.icon ? (
                    <img
                      src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                      alt={guild.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xl">
                        {guild.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">
                      {guild.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${guild.hasBot ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-gray-400">
                        {guild.hasBot ? 'Bot Connected' : 'Bot Not Connected'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-blue-400 group-hover:text-blue-300 transition-colors duration-200">
                    Manage Music →
                  </span>
                  <svg className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {guilds.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">No Servers Available</h3>
              <p className="text-gray-400 mb-4">
                You need to be an administrator or have music management permissions in at least one Discord server.
              </p>
              <Link to="/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
