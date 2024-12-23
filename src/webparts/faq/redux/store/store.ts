import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "../slices/productsSlice";
import userReducer from "../slices/userSlice";

// Define the store
export const store = configureStore({
  reducer: {
    product: productsReducer,
    user: userReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;

// Export the store as default
export default store;
