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

//Завдання 2. Індекс для інших полів
// Task 2 - Compound index for work music
print("\n=== Task 2: Index for work music queries ===");

db.tracks.createIndex({
  "audio_features.instrumentalness": 1,
  "audio_features.speechiness": 1,
  "explicit": 1
});
print("Compound index created!");

printjson(db.tracks.find({
  "audio_features.instrumentalness": { $gt: 0.5 },
  "audio_features.speechiness": { $lt: 0.1 },
  explicit: false
}).explain("executionStats"));