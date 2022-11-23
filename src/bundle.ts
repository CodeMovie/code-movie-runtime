import { CodeMovieRuntime } from ".";

window.customElements.get("code-movie-runtime") ??
  window.customElements.define("code-movie-runtime", CodeMovieRuntime);
