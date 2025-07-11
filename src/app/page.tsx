"use client";
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './pages/home/home';
import { Provider } from 'react-redux';
import store from '../store/store';


const App: React.FC = () => {
  return (
     <Provider store={store}>
       <Home />
     </Provider>
  );
};

export default App;