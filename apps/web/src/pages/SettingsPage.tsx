import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../components/LoadingSpinner'

interface GuildSettings {
  prefix: string
  djRoleId?: string
  defaultVolume: number
  maxQueueLength: number
  maxSongDuration: number
  allowDuplicates: boolean
  autoplay: boolean
  announceSongs: boolean
  permissions: {
    play: string[]
    skip: string[]
    stop: string[]
    clear: string[]
    shuffle: string[]
    volume: string[]
    filters: string[]
  }
}

export function SettingsPage() {
  const { guildId } = useParams()
  const { user, guilds } = useAuthStore()
  const [settings, setSettings] = useState<GuildSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const guild = guilds.find(g => g.id === guildId)

  useEffect(() => {
    if (guildId) {
      fetchSettings()
    }
  }, [guildId])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/settings/${guildId}`)
      setSettings(response.data.data)
    } catch (error: any) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<GuildSettings>) => {
    if (!settings) return

    try {
      setSaving(true)
      const newSettings = { ...settings, ...updates }
      setSettings(newSettings)

      await axios.put(`/api/settings/${guildId}`, updates)
      toast.success('Settings updated successfully')
    } catch (error: any) {
      console.error('Failed to update settings:', error)
      toast.error(error.response?.data?.error || 'Failed to update settings')
      // Revert changes
      setSettings(settings)
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) return

    try {
      setSaving(true)
      await axios.post(`/api/settings/${guildId}/reset`)
      await fetchSettings()
      toast.success('Settings reset to defaults')
    } catch (error: any) {
      console.error('Failed to reset settings:', error)
      toast.error('Failed to reset settings')
    } finally {
      setSaving(false)
    }
  }

  if (!user || !guild) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to view these settings.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Settings Not Found</h2>
          <p className="text-gray-400">Failed to load settings for this server.</p>
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
                <h1 className="text-xl font-bold text-white">Settings</h1>
                <p className="text-sm text-gray-400">{guild.name}</p>
              </div>
            </div>
          </div>

          <button
            onClick={resetSettings}
            disabled={saving}
            className="btn-danger text-sm"
          >
            Reset to Defaults
          </button>
        </div>
      </header>

      {/* Settings Content */}
      <main className="px-6 py-8 max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Music Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">Music Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default Volume */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Volume: {settings.defaultVolume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.defaultVolume}
                  onChange={(e) => updateSettings({ defaultVolume: parseInt(e.target.value) })}
                  disabled={saving}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Max Queue Length */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Queue Length: {settings.maxQueueLength}
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={settings.maxQueueLength}
                  onChange={(e) => updateSettings({ maxQueueLength: parseInt(e.target.value) })}
                  disabled={saving}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>1000</span>
                </div>
              </div>

              {/* Max Song Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Song Duration: {settings.maxSongDuration === 0 ? 'Unlimited' : `${settings.maxSongDuration} minutes`}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1440"
                  value={settings.maxSongDuration}
                  onChange={(e) => updateSettings({ maxSongDuration: parseInt(e.target.value) })}
                  disabled={saving}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Unlimited</span>
                  <span>24h</span>
                </div>
              </div>

              {/* Command Prefix */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Command Prefix
                </label>
                <input
                  type="text"
                  value={settings.prefix}
                  onChange={(e) => updateSettings({ prefix: e.target.value })}
                  disabled={saving}
                  className="input-primary w-full"
                  maxLength={5}
                />
              </div>
            </div>

            {/* Toggle Settings */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Allow Duplicate Tracks</h3>
                  <p className="text-gray-400 text-sm">Allow the same track to be added to the queue multiple times</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowDuplicates}
                    onChange={(e) => updateSettings({ allowDuplicates: e.target.checked })}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Autoplay</h3>
                  <p className="text-gray-400 text-sm">Automatically play related tracks when the queue ends</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoplay}
                    onChange={(e) => updateSettings({ autoplay: e.target.checked })}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Announce Songs</h3>
                  <p className="text-gray-400 text-sm">Announce when new songs start playing in the text channel</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announceSongs}
                    onChange={(e) => updateSettings({ announceSongs: e.target.checked })}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">Permissions</h2>
            <p className="text-gray-400 text-sm mb-6">
              Configure which roles can use specific music commands. Leave empty to allow all users.
            </p>

            <div className="space-y-6">
              {Object.entries(settings.permissions).map(([command, roles]) => (
                <div key={command}>
                  <h3 className="text-white font-medium capitalize mb-2">{command} Command</h3>
                  <div className="flex flex-wrap gap-2">
                    {roles.length === 0 ? (
                      <span className="text-gray-400 text-sm">All users allowed</span>
                    ) : (
                      roles.map((roleId) => (
                        <div key={roleId} className="bg-gray-700 px-3 py-1 rounded text-sm text-gray-300">
                          <Role roleId={roleId} guildId={guildId!} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-yellow-400 font-medium">Permission Management</h3>
                  <p className="text-yellow-200 text-sm mt-1">
                    Role-based permissions are not yet implemented in the UI. Use Discord commands to manage permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper component to display role names
function Role({ roleId, guildId }: { roleId: string; guildId: string }) {
  const [roleName, setRoleName] = useState(`Role ${roleId.slice(-4)}`)

  useEffect(() => {
    // In a real implementation, you'd fetch role data from Discord API
    // For now, just show the role ID
    setRoleName(`Role ${roleId.slice(-4)}`)
  }, [roleId, guildId])

  return <span>{roleName}</span>
}
