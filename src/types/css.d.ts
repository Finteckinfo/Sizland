// Allows importing CSS files from node_modules in TypeScript.
// This is needed because this repo currently doesn't include a global `*.css` module declaration.
declare module "*.css";

// MapLibre imports its stylesheet via this exact path.
declare module "maplibre-gl/dist/maplibre-gl.css";

