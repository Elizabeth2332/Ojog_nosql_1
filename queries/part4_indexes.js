// Завдання 1. Аналіз запиту та індексація
use("spotify");

// Task 1 - BEFORE index
print("\n=== Task 1: Query plan BEFORE index ===");
printjson(db.tracks.find({
  track_genre: "pop",
  "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain("executionStats"));

// Create index
print("\n=== Creating index ===");
db.tracks.createIndex(
  { track_genre: 1, "audio_features.danceability": 1, popularity: -1 }
);
print("Index created!");

// Task 1 - AFTER index
print("\n=== Task 1: Query plan AFTER index ===");
printjson(db.tracks.find({
  track_genre: "pop",
  "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain("executionStats"));