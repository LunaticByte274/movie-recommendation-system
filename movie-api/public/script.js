const API_KEY = "YOUR_OMDB_API_KEY"; // <-- paste here

const form = document.getElementById("movieForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;

  // 🎬 Fetch movie poster
  const posterRes = await fetch(
    `https://www.omdbapi.com/?t=${title}&apikey=${API_KEY}`
  );
  const posterData = await posterRes.json();

  const movie = {
    title,
    genre: document.getElementById("genre").value,
    rating: document.getElementById("rating").value,
    recommended: document.getElementById("recommended").value,
    poster: posterData.Poster !== "N/A" ? posterData.Poster : ""
  };

  await fetch("/movies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie),
  });

  location.reload();
});

// DELETE
async function deleteMovie(id) {
  await fetch(`/movies/${id}`, { method: "DELETE" });
  location.reload();
}

// FILTER
async function filterMovies() {
  const rating = document.getElementById("filter").value;

  const res = await fetch(`/movies?rating=${rating}`);
  const data = await res.json();

  const list = document.getElementById("movieList");
  list.innerHTML = "";

  data.forEach(movie => {
    list.innerHTML += `
      <div class="movie-card">
        <img src="${movie.poster || ''}" class="poster"/>
        <div>
          <strong>${movie.title}</strong><br>
          ${movie.genre} ⭐${movie.rating}
        </div>
      </div>
    `;
  });
}