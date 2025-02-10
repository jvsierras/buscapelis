// URL base de la API (reemplaza 'TU_API_KEY' con tu clave de API)
const API_KEY = "7787dd5dc689453346d1bca794089006";
const BASE_URL = "https://api.themoviedb.org/3";

// Elementos del DOM
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const movieList = document.getElementById("movie-list");
const playerSection = document.getElementById("player-section");
const moviePlayer = document.getElementById("movie-player");
const movieTitle = document.getElementById("movie-title");

// Función para buscar películas
async function searchMovies(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();

        if (data.results.length > 0) {
            displayMovies(data.results);
        } else {
            alert("No se encontraron películas.");
        }
    } catch (error) {
        console.error("Error al buscar películas:", error);
        alert("Hubo un error al buscar películas. Por favor, intenta nuevamente.");
    }
}

// Función para mostrar las películas en la interfaz
function displayMovies(movies) {
    movieList.innerHTML = ""; // Limpiar resultados anteriores

    movies.forEach((movie) => {
        const movieItem = document.createElement("div");
        movieItem.classList.add("movie-item");

        const movieImage = document.createElement("img");
        movieImage.src = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "assets/placeholder.jpg"; // Asegúrate de que esta ruta sea correcta
        movieImage.alt = movie.title;

        const movieName = document.createElement("p");
        movieName.textContent = movie.title;

        movieItem.appendChild(movieImage);
        movieItem.appendChild(movieName);

        // Agregar evento de clic para reproducir el trailer
        movieItem.addEventListener("click", () => playTrailer(movie.id));

        movieList.appendChild(movieItem);
    });
}

// Función para obtener el trailer de una película
async function playTrailer(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();

        if (data.results.length > 0) {
            const trailer = data.results.find((video) => video.type === "Trailer");
            if (trailer) {
                movieTitle.textContent = `Reproduciendo Trailer: ${trailer.name}`;
                moviePlayer.src = `https://www.youtube.com/embed/${trailer.key}`;
                playerSection.style.display = "block";
            } else {
                alert("No se encontró ningún trailer para esta película.");
            }
        } else {
            alert("No se encontró ningún trailer para esta película.");
        }
    } catch (error) {
        console.error("Error al obtener el trailer:", error);
        alert("Hubo un error al cargar el trailer. Por favor, intenta nuevamente.");
    }
}

// Evento de búsqueda
searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
        searchMovies(query);
    } else {
        alert("Por favor, ingresa un título para buscar.");
    }
});
