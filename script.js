// URL base de la API (reemplaza 'TU_API_KEY' con tu clave de API)
const API_KEY = "7787dd5dc689453346d1bca794089006";
const BASE_URL = "https://api.themoviedb.org/3";

// Elementos del DOM
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const movieList = document.getElementById("movie-list");
const resultsTitle = document.getElementById("results-title");
const trailerModal = document.getElementById("trailer-modal");
const infoModal = document.getElementById("info-modal");
const closeModal = document.querySelectorAll(".close");
const modalMoviePlayer = document.getElementById("modal-movie-player");
const modalMovieTitle = document.getElementById("modal-movie-title");

// Información de la película en la ventana modal
const infoMovieTitle = document.getElementById("info-movie-title");
const infoPoster = document.getElementById("info-poster");
const infoOverview = document.getElementById("info-overview");
const infoReleaseDate = document.getElementById("info-release-date");
const infoGenres = document.getElementById("info-genres");
const infoRuntime = document.getElementById("info-runtime");
const infoPopularity = document.getElementById("info-popularity");
const infoOriginalLanguage = document.getElementById("info-original-language");

// Función para cargar películas recientes al iniciar la página
async function loadRecentMovies() {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-MX`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error("Error al cargar películas recientes:", error);
        alert("Hubo un error al cargar las películas recientes. Por favor, intenta nuevamente.");
    }
}

// Función para buscar películas
async function searchMovies(query) {
    try {
        // Validar si es un ID de IMDb (comienza con "tt" seguido de números)
        if (/^tt\d+$/.test(query)) {
            return searchByImdbId(query);
        }

        // Validar si es un ID numérico de TMDb
        if (/^\d+$/.test(query)) {
            return searchByTmdbId(query);
        }

        // Si no es un ID, asumimos que es una búsqueda por título
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=es-MX`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();

        if (data.results.length > 0) {
            resultsTitle.textContent = `Resultados de Búsqueda: "${query}"`;
            displayMovies(data.results);
        } else {
            alert("No se encontraron películas.");
        }
    } catch (error) {
        console.error("Error al buscar películas:", error);
        alert("Hubo un error al buscar películas. Por favor, intenta nuevamente.");
    }
}

// Función para buscar películas por ID de IMDb
async function searchByImdbId(imdbId) {
    try {
        const response = await fetch(`${BASE_URL}/find/${imdbId}?api_key=${API_KEY}&external_source=imdb_id&language=es-MX`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();

        if (data.movie_results && data.movie_results.length > 0) {
            const movie = data.movie_results[0];
            resultsTitle.textContent = `Resultado para IMDb ID: ${imdbId}`;
            displayMovies([movie]); // Mostrar solo la película encontrada
        } else {
            alert("No se encontró ninguna película con este ID de IMDb.");
        }
    } catch (error) {
        console.error("Error al buscar por ID de IMDb:", error);
        alert("Hubo un error al buscar por ID de IMDb. Por favor, intenta nuevamente.");
    }
}

// Función para buscar películas por ID de TMDb
async function searchByTmdbId(tmdbId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${tmdbId}?api_key=${API_KEY}&language=es-MX`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const movie = await response.json();

        resultsTitle.textContent = `Resultado para TMDb ID: ${tmdbId}`;
        displayMovies([movie]); // Mostrar solo la película encontrada
    } catch (error) {
        console.error("Error al buscar por ID de TMDb:", error);
        alert("Hubo un error al buscar por ID de TMDb. Por favor, intenta nuevamente.");
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

        // Agregar evento de clic para abrir la información de la película y buscar el trailer
        movieItem.addEventListener("click", () => openMovieInfoAndTrailer(movie.id));

        movieList.appendChild(movieItem);
    });
}

// Función para abrir la información de una película y buscar el trailer
async function openMovieInfoAndTrailer(movieId) {
    try {
        // Obtener información de la película
        const movieResponse = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=es-MX`);
        if (!movieResponse.ok) {
            throw new Error(`Error HTTP al obtener la película: ${movieResponse.status}`);
        }
        const movieData = await movieResponse.json();

        // Mostrar la información en la ventana modal
        infoMovieTitle.textContent = movieData.title;
        infoPoster.src = movieData.poster_path
            ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
            : "assets/placeholder.jpg";
        infoOverview.textContent = movieData.overview || "Sin sinopsis disponible.";
        infoReleaseDate.textContent = movieData.release_date || "No disponible";
        infoGenres.textContent = movieData.genres.map((genre) => genre.name).join(", ") || "No disponible";
        infoRuntime.textContent = movieData.runtime || "No disponible";
        infoPopularity.textContent = movieData.popularity || "No disponible";
        infoOriginalLanguage.textContent = movieData.original_language || "No disponible";

        infoModal.style.display = "block";

        // Buscar el trailer en español
        const videoResponse = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=es-MX`);
        if (!videoResponse.ok) {
            throw new Error(`Error HTTP al obtener el trailer: ${videoResponse.status}`);
        }
        const videoData = await videoResponse.json();

        if (videoData.results.length > 0) {
            const trailer = videoData.results.find((video) => video.type === "Trailer" && video.iso_639_1 === "es");
            if (trailer) {
                modalMoviePlayer.src = `https://www.youtube.com/embed/${trailer.key}`;
            } else {
                modalMoviePlayer.src = ""; // Limpiar el iframe si no hay trailer
                alert("No se encontró ningún trailer en español para esta película.");
            }
        } else {
            modalMoviePlayer.src = ""; // Limpiar el iframe si no hay trailer
            alert("No se encontró ningún trailer para esta película.");
        }
    } catch (error) {
        console.error("Error:", error.message);
        alert(`Ocurrió un error: ${error.message}`);
    }
}

// Evento para cerrar las ventanas modales
closeModal.forEach((button) => {
    button.addEventListener("click", () => {
        trailerModal.style.display = "none";
        infoModal.style.display = "none";
        modalMoviePlayer.src = ""; // Detener el video
    });
});

// Cerrar las ventanas modales al hacer clic fuera de ellas
window.addEventListener("click", (event) => {
    if (event.target === trailerModal) {
        trailerModal.style.display = "none";
        modalMoviePlayer.src = ""; // Detener el video
    }
    if (event.target === infoModal) {
        infoModal.style.display = "none";
    }
});

// Evento de búsqueda
searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
        searchMovies(query);
    } else {
        alert("Por favor, ingresa un título, ID de IMDb o ID de TMDb para buscar.");
    }
});

// Cargar películas recientes al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    loadRecentMovies();
});
