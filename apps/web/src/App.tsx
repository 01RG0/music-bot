import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { GuildSelectPage } from './pages/GuildSelectPage'
import { MusicPage } from './pages/MusicPage'
import { StatsPage } from './pages/StatsPage'
import { SettingsPage } from './pages/SettingsPage'
import { PlaylistsPage } from './pages/PlaylistsPage'
import { LoadingSpinner } from './components/LoadingSpinner'

function App() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        {/* Public routes */}
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={user ? <DashboardPage /> : <Navigate to="/auth" replace />}
        />

        <Route
          path="/guilds"
          element={user ? <GuildSelectPage /> : <Navigate to="/auth" replace />}
        />

        <Route
          path="/guild/:guildId"
          element={user ? <MusicPage /> : <Navigate to="/auth" replace />}
        />

        <Route
          path="/guild/:guildId/stats"
          element={user ? <StatsPage /> : <Navigate to="/auth" replace />}
        />

        <Route
          path="/guild/:guildId/settings"
          element={user ? <SettingsPage /> : <Navigate to="/auth" replace />}
        />

        <Route
          path="/playlists"
          element={user ? <PlaylistsPage /> : <Navigate to="/auth" replace />}
        />

        {/* Redirect root to dashboard or auth */}
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/auth"} replace />}
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
