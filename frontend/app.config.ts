import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
    ssr: false,
    vite: {
        optimizeDeps: {
            exclude: ['@modular-forms/solid']
        }
    }
});
