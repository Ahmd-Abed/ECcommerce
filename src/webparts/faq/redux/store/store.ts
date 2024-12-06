import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "../slices/productsSlice";

// Define the store
export const store = configureStore({
  reducer: {
    faq: productsReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>

// Export the store as default
export default store;

