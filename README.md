## Environment Setup

### Requirements
- pymongo==4.7.3
- pandas==3.0.3
- kaggle==1.6.14
- python-dotenv==1.0.1
- tqdm==4.66.4

  ### Installation
1. Clone the repository
2. Create virtual environment:
```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```
4. Create `.env` file in root folder:

MONGO_URI=mongodb+srv://username:password@cluster0.6tnx7tz.mongodb.net/?appName=Cluster0

5. Download `dataset.csv` from Kaggle (Spotify Tracks Dataset) and place in root folder

### Running the project
```bash
# Step 1 - Load raw data into tracks_raw
python scripts/01_load_data.py

# Step 2 - Transform into tracks collection
mongosh "YOUR_URI" --apiVersion 1 --username your_user --file scripts/02_transform.js

# Step 3 - Run queries
mongosh "YOUR_URI" --apiVersion 1 --username your_user --file queries/part2_queries.js
mongosh "YOUR_URI" --apiVersion 1 --username your_user --file queries/part3_aggregations.js
mongosh "YOUR_URI" --apiVersion 1 --username your_user --file queries/part4_indexes.js
```

---
## Data Schema

Final document structure in `tracks` collection:

```json
{
  "track_id": "1EzrEOXmMH3G43AXT1y7pA",
  "track_name": "I'm Yours",
  "album_name": "We Sing. We Dance. We Steal Things.",
  "artists": ["Jason Mraz"],
  "popularity": 80,
  "duration_ms": 242946,
  "duration_sec": 242.9,
  "explicit": false,
  "track_genre": "acoustic",
  "popularity_tier": "high",
  "audio_features": {
    "danceability": 0.703,
    "energy": 0.444,
    "loudness": -9.331,
    "speechiness": 0.0417,
    "acousticness": 0.559,
    "instrumentalness": 0,
    "liveness": 0.0973,
    "valence": 0.712,
    "tempo": 150.96,
    "key": 11,
    "mode": 1,
    "time_signature": 4
  }
}
```
## Part 1 — Theoretical Questions

## 1. Why are audio features stored in a separate `audio_features` object instead of a flat structure? When is this beneficial and when can it create problems?

While transforming the dataset, I noticed that fields such as `danceability`, `energy`, `tempo`, `valence`, and the other audio metrics all describe the same aspect of a track. Because of that, grouping them into a single `audio_features` object felt more natural than keeping them as separate top-level fields.

In my opinion, this makes the document easier to read because all audio-related information is stored in one place. During the assignment, I often accessed several of these fields together, so having them grouped improved the readability of queries and aggregations.

This approach is beneficial when related fields belong to the same logical category and are frequently used together. However, it can become less convenient when many nested fields require separate indexes or when the document structure becomes deeply nested, making queries more complicated.

## 2. Why are artists stored as an array instead of a string? Which queries become easier?

Many tracks have more than one artist, so storing artists as an array reflects the actual structure of the data better than storing them as a single string.

This approach makes analytical queries much easier. For example, using `$unwind` allows me to work with each artist separately, calculate statistics for individual artists, count tracks per artist, and determine average popularity. Searching for all tracks performed by a specific artist is also more straightforward when artists are stored as array elements.

## 3. What is `$out` and how is it different from `$merge`? When should each be used?

`$out` writes the result of an aggregation pipeline into a collection and replaces the existing collection if it already exists. In this assignment I used `$out` because I wanted to completely rebuild the `tracks` collection from the transformed source data.

`$merge` works differently because it can insert new documents, update existing documents, or combine results with data already stored in the target collection.

I would use `$out` when rebuilding a collection from scratch and `$merge` when updating an existing collection without losing previously stored data.

# Part 2 — Theoretical Questions

## 1. What is `$unwind` used for?

`$unwind` is used to split an array field into multiple documents, creating one document for each element of the array.

In this project it is particularly useful for the `artists` field. Since a single track can have multiple artists, `$unwind` allows treating each artist separately during aggregation. This makes it possible to calculate statistics per artist, count tracks, or determine average popularity.

Without `$unwind`, many artist-level analyses would be much harder to perform.

## 2. What is the difference between `$stdDevPop` and `$stdDevSamp`?

Both operators calculate standard deviation, but they are intended for different situations.

`$stdDevPop` assumes that the available data represents the entire population. Since this assignment analyzes the complete dataset of tracks, this operator is the most appropriate choice.

`$stdDevSamp` assumes that the data represents only a sample of a larger population and applies Bessel's correction, which slightly adjusts the calculation.

Because I am working with the full dataset rather than a sample, I would use `$stdDevPop`.

# Part 3 — Theoretical Questions

## 1. In Query 1 we filter artists with fewer than 5 tracks. What would happen if the threshold were reduced to 1? What if we selected only artists with more than 50 tracks?

If the threshold is reduced to 1, almost every artist becomes eligible for the ranking. This can make the results less reliable because an artist with only one successful track may appear near the top even though there is very little data available about them.

If the threshold is increased to more than 50 tracks, only artists with very large catalogs remain in the analysis. The results become more statistically stable because they are based on a larger number of tracks, but many smaller artists disappear completely from the ranking.

In my opinion, the threshold of 5 tracks provides a reasonable balance between reliability and inclusiveness.

## 2. In Query 3 we filter out genres with fewer than 100 tracks. What happens if the threshold is reduced to 50?

Reducing the threshold from 100 to 50 allows more genres to appear in the results. Some of these genres may contain relatively few tracks, which means their averages can be strongly influenced by a small number of unusual songs.

As a result, the ranking could change because smaller genres with exceptionally high or low values would have a greater impact. Keeping the threshold at 100 makes the comparison between genres more reliable because the statistics are calculated from a larger amount of data.

# Part 4 — Index Analysis

## 1. What changed in the execution plan?

Before creating the index, MongoDB performed a full collection scan (`COLLSCAN`). This means that every document in the collection had to be examined to determine whether it matched the query conditions.

After creating the index, MongoDB switched to an index scan (`IXSCAN`). Instead of checking every document, it was able to use the index to directly locate matching records. As a result, the number of examined documents decreased significantly and the query executed much faster.

The exact values can be seen in the `explain()` output included in the screenshots.

## 2. How can you tell that an index is being used?

The easiest way is by analyzing the output of `explain()`.

Several indicators confirm that MongoDB is using an index:

* The execution stage contains `IXSCAN` instead of `COLLSCAN`.
* The execution plan shows the name of the index being used.
* The number of examined documents is significantly lower than before indexing.
* Query execution time is reduced.

In my tests, the transition from `COLLSCAN` to `IXSCAN` clearly demonstrated that the created index was being used by MongoDB.
