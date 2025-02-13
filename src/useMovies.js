import { useState, useEffect } from "react";

const KEY = "f84fc31d";
const DEBOUNCE_DELAY = 500;

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSorted, setIsSorted] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let debounceTimer;

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");

        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal }
        );

        if (!res.ok)
          throw new Error("Something went wrong with fetching movies");

        const data = await res.json();
        if (data.Response === "False") throw new Error("Movie not found");

        // Create a copy before sorting
        const sortedMovies = [...data.Search].sort(
          (a, b) =>
            isSorted
              ? a.Title.localeCompare(b.Title) // Sort by title
              : parseInt(b.Year) - parseInt(a.Year) // Sort by year (newest first)
        );

        setMovies(sortedMovies);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          console.log(err.message);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }

    debounceTimer = setTimeout(fetchMovies, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query, isSorted]);

  return { movies, isLoading, error, setIsSorted };
}
