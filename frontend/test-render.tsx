import { renderToString } from 'react-dom/server';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './src/pages/LoginPage';

try {
  const html = renderToString(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>
  );
  console.log("SUCCESS:");
  console.log(html);
} catch (err) {
  console.error("ERROR:");
  console.error(err);
}
