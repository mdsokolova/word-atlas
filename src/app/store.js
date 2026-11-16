import { configureStore } from '@reduxjs/toolkit'
import favoritesReducer from '../features/favorites/favoritesSlice.js'

export const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
  },
})