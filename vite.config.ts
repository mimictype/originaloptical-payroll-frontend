import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/originaloptical-payroll-frontend/',
  plugins: [react()],
});
