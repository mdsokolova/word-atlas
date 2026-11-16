import { createSlice } from '@reduxjs/toolkit'

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: [],
  reducers: {
    addFavorite: (state, action) => {
      const exists = state.some(
        (favorite) =>
          favorite.word === action.payload.word &&
          favorite.language === action.payload.language
      )

      if (!exists) {
        state.push(action.payload)
      }
    },

    removeFavorite: (state, action) => {
      return state.filter(
        (favorite) => favorite.id !== action.payload
      )
    },
  },
})

export const { addFavorite, removeFavorite } = favoritesSlice.actions

export default favoritesSlice.reducer