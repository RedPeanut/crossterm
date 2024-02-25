import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import './App.css';
import configureStore from './store/configureStore';
import Main from './parts/Main';

const store = configureStore();

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
        </Routes>
      </Router>
    </Provider>
  );
}
