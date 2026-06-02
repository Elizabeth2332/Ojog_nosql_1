use("spotify");

// Завдання 1. Треки для вечірки
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

// Завдання 2. Виконавці, у яких усі треки популярні
print("\n=== Task 2: Artists with all popular tracks ===");

db.tracks.aggregate([
  { $unwind: "$artists" },
  {
    $group: {
      _id: "$artists",
      track_count: { $sum: 1 },
      min_popularity: { $min: "$popularity" },
      avg_popularity: { $avg: "$popularity" }
    }
  },
  {
    $match: {
      track_count: { $gte: 3 },
      min_popularity: { $gte: 60 }
    }
  },
  {
    $project: {
      _id: 0,
      artist: "$_id",
      track_count: 1,
      min_popularity: 1,
      avg_popularity: { $round: ["$avg_popularity", 1] }
    }
  },
  { $sort: { avg_popularity: -1 } },
  { $limit: 20 }
]).forEach(printjson);