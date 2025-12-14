import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { PlaylistModel, FavoriteModel } from '@utils/schemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user's playlists
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const playlists = await PlaylistModel.find({
      $or: [
        { userId: req.user!.discordId },
        { isPublic: true }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: playlists
    });

  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch playlists'
    });
  }
});

// Create playlist
router.post('/', async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Playlist name is required'
      });
    }

    const playlist = new PlaylistModel({
      name,
      description,
      userId: req.user!.discordId,
      tracks: [],
      isPublic: isPublic || false,
      playCount: 0
    });

    await playlist.save();

    res.status(201).json({
      success: true,
      data: playlist
    });

  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create playlist'
    });
  }
});

// Get playlist by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await PlaylistModel.findById(id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    // Check if user can access this playlist
    if (!playlist.isPublic && playlist.userId !== req.user!.discordId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: playlist
    });

  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch playlist'
    });
  }
});

// Update playlist
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic } = req.body;

    const playlist = await PlaylistModel.findOne({
      _id: id,
      userId: req.user!.discordId
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found or access denied'
      });
    }

    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();

    res.json({
      success: true,
      data: playlist
    });

  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update playlist'
    });
  }
});

// Delete playlist
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await PlaylistModel.deleteOne({
      _id: id,
      userId: req.user!.discordId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Playlist deleted successfully'
    });

  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete playlist'
    });
  }
});

// Add track to playlist
router.post('/:id/tracks', async (req, res) => {
  try {
    const { id } = req.params;
    const { track } = req.body;

    if (!track) {
      return res.status(400).json({
        success: false,
        error: 'Track data is required'
      });
    }

    const playlist = await PlaylistModel.findOne({
      _id: id,
      userId: req.user!.discordId
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found or access denied'
      });
    }

    // Check for duplicates
    const exists = playlist.tracks.some(t => t.info.identifier === track.info.identifier);
    if (exists) {
      return res.status(400).json({
        success: false,
        error: 'Track already exists in playlist'
      });
    }

    playlist.tracks.push(track);
    await playlist.save();

    res.json({
      success: true,
      data: playlist
    });

  } catch (error) {
    console.error('Add track to playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add track to playlist'
    });
  }
});

// Remove track from playlist
router.delete('/:id/tracks/:trackIndex', async (req, res) => {
  try {
    const { id, trackIndex } = req.params;
    const index = parseInt(trackIndex);

    if (isNaN(index)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid track index'
      });
    }

    const playlist = await PlaylistModel.findOne({
      _id: id,
      userId: req.user!.discordId
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found or access denied'
      });
    }

    if (index < 0 || index >= playlist.tracks.length) {
      return res.status(400).json({
        success: false,
        error: 'Track index out of range'
      });
    }

    playlist.tracks.splice(index, 1);
    await playlist.save();

    res.json({
      success: true,
      data: playlist
    });

  } catch (error) {
    console.error('Remove track from playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove track from playlist'
    });
  }
});

// Play playlist
router.post('/:id/play', async (req, res) => {
  try {
    const { id } = req.params;
    const { guildId } = req.body;

    if (!guildId) {
      return res.status(400).json({
        success: false,
        error: 'Guild ID is required'
      });
    }

    // Check if user has access to this guild
    if (!req.user!.guilds.includes(guildId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this guild'
      });
    }

    const playlist = await PlaylistModel.findById(id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    // Check if user can access this playlist
    if (!playlist.isPublic && playlist.userId !== req.user!.discordId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this playlist'
      });
    }

    if (playlist.tracks.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Playlist is empty'
      });
    }

    // Add tracks to queue
    await global.queueManager.addTracks(guildId, playlist.tracks);

    // Increment play count
    await PlaylistModel.updateOne(
      { _id: id },
      { $inc: { playCount: 1 } }
    );

    res.json({
      success: true,
      message: `Added ${playlist.tracks.length} tracks from "${playlist.name}" to queue`
    });

  } catch (error) {
    console.error('Play playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to play playlist'
    });
  }
});

// Get user's favorites
router.get('/favorites/list', async (req, res) => {
  try {
    const favorites = await FavoriteModel.find({
      userId: req.user!.discordId
    }).sort({ addedAt: -1 });

    res.json({
      success: true,
      data: favorites
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch favorites'
    });
  }
});

// Add to favorites
router.post('/favorites', async (req, res) => {
  try {
    const { track } = req.body;

    if (!track) {
      return res.status(400).json({
        success: false,
        error: 'Track data is required'
      });
    }

    // Check if already favorited
    const existing = await FavoriteModel.findOne({
      userId: req.user!.discordId,
      'track.info.identifier': track.info.identifier
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Track already in favorites'
      });
    }

    const favorite = new FavoriteModel({
      userId: req.user!.discordId,
      track
    });

    await favorite.save();

    res.status(201).json({
      success: true,
      data: favorite
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to favorites'
    });
  }
});

// Remove from favorites
router.delete('/favorites/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;

    const result = await FavoriteModel.deleteOne({
      userId: req.user!.discordId,
      'track.info.identifier': trackId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Removed from favorites'
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from favorites'
    });
  }
});

export { router as playlistsRouter };
