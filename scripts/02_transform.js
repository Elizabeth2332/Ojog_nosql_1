// scripts/02_transform.js
// Запуск: mongosh "ВАШ_URI" --file scripts/02_transform.js

use("spotify");

// 1. Видаляємо стару колекцію tracks якщо існує
db.tracks.drop();
print("Стара колекція tracks видалена (або не існувала)");

// 2. Трансформація через Aggregation Pipeline
db.tracks_raw.aggregate([
  // 3. Проєкція потрібних полів + перетворення артистів
  {
    $project: {
      track_id: 1,
      track_name: 1,
      album_name: 1,
      explicit: 1,
      popularity: 1,
      duration_ms: 1,
      track_genre: 1,
      artists_raw: "$artists",

      // 4. Розбиваємо рядок артистів на масив
      artists: {
        $map: {
          input: { $split: ["$artists", ";"] },
          as: "a",
          in: { $trim: { input: "$$a" } }
        }
      },

      // 4. Вкладений об'єкт аудіо-характеристик
      audio_features: {
        danceability: "$danceability",
        energy: "$energy",
        loudness: "$loudness",
        speechiness: "$speechiness",
        acousticness: "$acousticness",
        instrumentalness: "$instrumentalness",
        liveness: "$liveness",
        valence: "$valence",
        tempo: "$tempo",
        key: "$key",
        mode: "$mode",
        time_signature: "$time_signature"
      },

      // Тривалість у секундах
      duration_sec: {
        $round: [{ $divide: ["$duration_ms", 1000] }, 1]
      },

      // Popularity tier
      popularity_tier: {
        $switch: {
          branches: [
            { case: { $gte: ["$popularity", 70] }, then: "high" },
            { case: { $gte: ["$popularity", 40] }, then: "medium" }
          ],
          default: "low"
        }
      }
    }
  },

  // 5. Прибираємо зайві поля
  {
    $unset: ["artists_raw"]
  },

  // 6. Зберігаємо в колекцію tracks
  {
    $out: "tracks"
  }
]);

// 7. Перевірка
print("Кількість документів у tracks:", db.tracks.countDocuments());
print("Приклад документа:");
printjson(db.tracks.findOne());