import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
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

export function QueueManager() {
  const { playerState, removeFromQueue, moveInQueue, clearQueue, shuffleQueue } = useMusicStore()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!playerState) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">Queue is empty</h3>
          <p className="text-gray-400">Add some music to get started!</p>
        </div>
      </div>
    )
  }

  const { queue, currentTrack } = playerState

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex !== destinationIndex) {
      moveInQueue(sourceIndex, destinationIndex)
    }
  }

  const handleRemoveTrack = (index: number) => {
    removeFromQueue(index)
  }

  return (
    <div className="card">
      {/* Queue Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Queue</h2>
          <p className="text-gray-400 text-sm">{queue.length} tracks</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={shuffleQueue}
            disabled={queue.length < 2}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors duration-200"
            title="Shuffle Queue"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={clearQueue}
            disabled={queue.length === 0}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors duration-200"
            title="Clear Queue"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Queue List */}
      {queue.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">Queue is empty</h3>
          <p className="text-gray-400">Add some music to get started!</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="queue">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 max-h-96 overflow-y-auto"
              >
                {queue.map((track, index) => {
                  const isCurrentTrack = currentTrack && track.info.identifier === currentTrack.info.identifier

                  return (
                    <Draggable key={`${track.info.identifier}-${index}`} draggableId={`${track.info.identifier}-${index}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                            snapshot.isDragging
                              ? 'bg-blue-600 shadow-lg'
                              : isCurrentTrack
                              ? 'bg-blue-900 border border-blue-700'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          {/* Drag Handle */}
                          <div className="flex-shrink-0 cursor-move">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                          </div>

                          {/* Track Number */}
                          <div className="flex-shrink-0 w-8 text-center">
                            {isCurrentTrack ? (
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">{index + 1}</span>
                            )}
                          </div>

                          {/* Track Artwork */}
                          <div className="flex-shrink-0">
                            {track.info.artworkUrl ? (
                              <img
                                src={track.info.artworkUrl}
                                alt={track.info.title}
                                className="w-12 h-12 rounded object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Track Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium truncate ${isCurrentTrack ? 'text-blue-400' : 'text-white'}`}>
                              {track.info.title}
                            </h4>
                            <p className="text-gray-400 text-sm truncate">{track.info.author}</p>
                          </div>

                          {/* Duration */}
                          <div className="flex-shrink-0 text-gray-400 text-sm">
                            {formatDuration(track.info.length)}
                          </div>

                          {/* Remove Button */}
                          {hoveredIndex === index && (
                            <button
                              onClick={() => handleRemoveTrack(index)}
                              className="flex-shrink-0 p-1 rounded bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                              title="Remove from queue"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
}
