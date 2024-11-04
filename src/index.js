import React from 'react';
import ReactDOM from 'react-dom';
import AppRoutes from './app/routes/AppRouters';
import { Provider } from 'react-redux';
import { store } from './app/store';

ReactDOM.render(
  <Provider store={store}>
    <AppRoutes />
  </Provider>,
  document.getElementById('root'));
