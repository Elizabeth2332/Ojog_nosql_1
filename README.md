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

/////////MONGO_URI=mongodb+srv://username:password@cluster0.xxxxxx.mongodb.net/?appName=Cluster0
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
