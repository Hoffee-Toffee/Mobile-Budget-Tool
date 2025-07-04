/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/App'; // Adjusted path to src/App.tsx

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => { // Made the function async
    ReactTestRenderer.create(<App />);
  });
});
