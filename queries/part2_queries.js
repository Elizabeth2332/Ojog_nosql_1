use("spotify");

print("\n=== Task 1: Party Tracks ===");

db.tracks.find(
  {
    "audio_features.danceability": { $gt: 0.7 },
    "audio_features.energy": { $gt: 0.7 },
    duration_ms: {
      $gte: 180000,
      $lte: 300000
    }
  },
  {
    _id: 0,
    track_name: 1,
    artists: 1,
    popularity: 1,
    duration_ms: 1,
    "audio_features.danceability": 1,
    "audio_features.energy": 1
  }
).limit(20).forEach(printjson);