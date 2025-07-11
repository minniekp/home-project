import { configureStore } from '@reduxjs/toolkit';
import rootCombinedReducer from './index';

const store = configureStore({
  reducer: rootCombinedReducer
});

export default store;