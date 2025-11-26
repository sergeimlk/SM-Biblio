import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                mesLivres: resolve(__dirname, 'mes-livres.html'),
                msg: resolve(__dirname, 'msg.html'),
                bookDetails: resolve(__dirname, 'bookDetails.html'),
                authorDetails: resolve(__dirname, 'authorDetails.html'),
                user: resolve(__dirname, 'user.html'),
                pong: resolve(__dirname, 'pong.html'),
            },
        },
    },
});
