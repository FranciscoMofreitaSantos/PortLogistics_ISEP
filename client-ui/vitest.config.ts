import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // Corrige os imports "three/addons/..."
            "three/addons": path.resolve(__dirname, "node_modules/three/examples/jsm"),
        },
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setupTests.ts"],
        globals: true,
    },
});
