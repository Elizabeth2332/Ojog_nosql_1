use("spotify");

print("\n=== Part 3 Task 1: Top 10 Artists by Average Popularity ===");

db.tracks.aggregate([
  { $unwind: "$artists" },
  {
    $group: {
      _id: "$artists",
      track_count: { $sum: 1 },
      avg_popularity: { $avg: "$popularity" }
    }
  },
  { $match: { track_count: { $gte: 5 } } },
  {
    $project: {
      _id: 0,
      artist: "$_id",
      track_count: 1,
      avg_popularity: { $round: ["$avg_popularity", 1] }
    }
  },
  { $sort: { avg_popularity: -1 } },
  { $limit: 10 }
]).forEach(printjson);