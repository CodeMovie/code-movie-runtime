import { CodeMovieRuntime } from "./lib";

declare global {
  interface HTMLElementTagNameMap {
    "code-movie-runtime": CodeMovieRuntime;
  }
}

window.customElements.define("code-movie-runtime", CodeMovieRuntime);

export { CodeMovieRuntime };
