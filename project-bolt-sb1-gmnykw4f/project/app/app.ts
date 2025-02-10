import { Application } from '@nativescript/core';
import { initializeDB } from './database/database';

// Initialize database on app start
initializeDB()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(error => {
    console.error('Database initialization failed:', error);
  });

Application.run({ moduleName: 'app-root' });