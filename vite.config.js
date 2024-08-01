import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
 
export default defineConfig({
  plugins: [mkcert()],
  server: {
    host: true, // Allows access from the network
  },
});