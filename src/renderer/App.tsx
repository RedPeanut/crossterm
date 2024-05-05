import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import './App.css';
import configureStore from './store/configureStore';
import Main from './parts/Main';
import { useColorMode } from '@chakra-ui/react';
import { useEffect, useState } from 'react'

const store = configureStore();

export default function App() {
// const App = () => {

  const { colorMode, setColorMode } = useColorMode();

  useEffect(() => {
    console.log('colorMode =', colorMode);
    if(colorMode !== 'dark')
      setColorMode('dark');
  })

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

// export default App;
