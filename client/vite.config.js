import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, '.', 'VITE_');
	const apiUrl = env.VITE_API_URL || 'http://localhost:5000/api';
	const proxyTarget = apiUrl.startsWith('http') && apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : 'http://localhost:5000';
	return {
		plugins: [react()],
		server: {
			proxy: {
				'/api': { target: proxyTarget, changeOrigin: true }
			}
		}
	};
});
