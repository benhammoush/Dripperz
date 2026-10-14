/**
 * React build configuration shared with the unit-test harness.
 * @packageDocumentation
 */

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [react()] });
