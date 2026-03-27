import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ============================
// PORT (Vercel compatible)
// ============================
const port = process.env.PORT || 3000;

// ============================
// MIDDLEWARE
// ============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// ============================
// ENV VARIABLES
// ============================
const OMDB_API_KEY = process.env.OMDB_API_KEY;

// ============================
// IN-MEMORY DATABASE
// ============================
let movies = [
  {
    id: 1,
    title: "Inception",
    genre: "Sci-Fi",
    rating: 5,
    recommended: "Yes",
    poster: "https://m.media-amazon.com/images/I/51zUbui+gbL._AC_.jpg",
    year: "2010",
    imdb: "8.8",
    createdAt: new Date().toLocaleString()
  },
];

// ============================
// HOME ROUTE (UI)
// ============================
app.get("/", (req, res) => {
  res.render("index", { movies });
});

// ============================
// GET /movies (with filter)
// ============================
app.get("/movies", (req, res) => {
  const { rating } = req.query;

  if (rating) {
    const filteredMovies = movies.filter(
      (movie) => movie.rating == rating
    );

    return res.json({
      count: filteredMovies.length,
      data: filteredMovies
    });
  }

  res.json({
    count: movies.length,
    data: movies
  });
});

// ============================
// POST /movies (WITH OMDb)
// ============================
app.post("/movies", async (req, res) => {
  try {
    const { title, genre, rating, recommended } = req.body;

    if (!title || !genre || !rating || !recommended) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 🔥 Fetch movie data from OMDb
    const response = await axios.get(
      `https://www.omdbapi.com/?t=${title}&apikey=${OMDB_API_KEY}`
    );

    const data = response.data;

    const newMovie = {
      id: movies.length ? movies[movies.length - 1].id + 1 : 1,
      title,
      genre,
      rating: Number(rating),
      recommended,
      poster:
        data.Poster && data.Poster !== "N/A"
          ? data.Poster
          : "https://via.placeholder.com/80x120?text=No+Image",
      year: data.Year || "N/A",
      imdb: data.imdbRating || "N/A",
      createdAt: new Date().toLocaleString()
    };

    movies.push(newMovie);

    // Redirect for UI
    res.redirect("/");
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching data from OMDb",
    });
  }
});

// ============================
// PATCH /movies/:id
// ============================
app.patch("/movies/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const movie = movies.find((m) => m.id === id);

  if (!movie) {
    return res.status(404).json({
      success: false,
      message: "Movie not found",
    });
  }

  const { title, genre, rating, recommended, poster } = req.body;

  if (title) movie.title = title;
  if (genre) movie.genre = genre;
  if (rating) movie.rating = Number(rating);
  if (recommended) movie.recommended = recommended;
  if (poster) movie.poster = poster;

  movie.updatedAt = new Date().toLocaleString();

  res.json({
    success: true,
    message: "Movie updated",
    data: movie
  });
});

// ============================
// DELETE /movies/:id
// ============================
app.delete("/movies/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = movies.findIndex((m) => m.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Movie not found",
    });
  }

  const deletedMovie = movies.splice(index, 1);

  res.json({
    success: true,
    message: "Movie deleted successfully",
    data: deletedMovie[0]
  });
});

// ============================
// LOCAL SERVER (ONLY LOCAL)
// ============================
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

// ============================
// EXPORT FOR VERCEL
// ============================
export default app;