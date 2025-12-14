import { useState } from 'react'
import { useMusicStore } from '../stores/musicStore'

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

export function MusicPlayer() {
  const { playerState, pause, resume, skip, stop, setVolume, seek, applyFilter, setLoop, toggleAutoplay } = useMusicStore()
  const [volumeSlider, setVolumeSlider] = useState(playerState?.volume || 100)
  const [seekSlider, setSeekSlider] = useState(0)

  if (!playerState) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Music Playing</h3>
        <p className="text-gray-400">Search for a song above to get started!</p>
      </div>
    )
  }

  const { currentTrack, isPlaying, isPaused, volume, loop, autoplay } = playerState

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolumeSlider(newVolume)
    setVolume(newVolume)
  }

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = parseInt(e.target.value)
    setSeekSlider(newPosition)
    seek(newPosition)
  }

  return (
    <div className="card">
      {/* Current Track Info */}
      {currentTrack && (
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-shrink-0">
            {currentTrack.info.artworkUrl ? (
              <img
                src={currentTrack.info.artworkUrl}
                alt={currentTrack.info.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-600 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">{currentTrack.info.title}</h3>
            <p className="text-gray-400 truncate">{currentTrack.info.author}</p>
            <p className="text-sm text-gray-500">
              Duration: {formatDuration(currentTrack.info.length)}
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {currentTrack && (
        <div className="mb-6">
          <input
            type="range"
            min="0"
            max={currentTrack.info.length}
            value={seekSlider}
            onChange={handleSeekChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatDuration(seekSlider)}</span>
            <span>{formatDuration(currentTrack.info.length)}</span>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={stop}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
          title="Stop"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>

        <button
          onClick={isPaused ? resume : pause}
          className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
          title={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          )}
        </button>

        <button
          onClick={skip}
          className="p-3 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
          title="Skip"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>

      {/* Volume & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Volume Control */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Volume: {volumeSlider}%
          </label>
          <input
            type="range"
            min="0"
            max="1000"
            value={volumeSlider}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Loop & Autoplay */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLoop(loop === 'off' ? 'track' : loop === 'track' ? 'queue' : 'off')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                loop === 'off'
                  ? 'bg-gray-600 text-gray-300'
                  : loop === 'track'
                  ? 'bg-blue-600 text-white'
                  : 'bg-green-600 text-white'
              }`}
              title={`Loop: ${loop === 'off' ? 'Off' : loop === 'track' ? 'Track' : 'Queue'}`}
            >
              Loop: {loop === 'off' ? 'Off' : loop === 'track' ? 'Track' : 'Queue'}
            </button>

            <button
              onClick={toggleAutoplay}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                autoplay ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'
              }`}
              title={`Autoplay: ${autoplay ? 'On' : 'Off'}`}
            >
              Autoplay
            </button>
          </div>
        </div>
      </div>

      {/* Audio Filters */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Audio Filters</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Bass Boost', value: 'bassboost' },
            { name: 'Nightcore', value: 'nightcore' },
            { name: 'Vaporwave', value: 'vaporwave' },
            { name: '8D Audio', value: '8d' },
            { name: 'Reset', value: 'reset' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => applyFilter(filter.value)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors duration-200"
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
