import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  addUserToSharePoint,
  fetchUserItemsFromSharePoint,
  signInService,
} from "../services/productService";
import { User } from "../../../../interfaces";
import { RootState } from "../store/store";

// Define types for the product data and state

export interface UserState {
  userItems: User[];
  user: User | null;
  loadingLogin: boolean;
  errorLogin: string | null;
  context: any; // Store SharePoint context, for example, to interact with SharePoint API
}
// Define the initial state with proper types
const initialState: UserState = {
  userItems: [],
  user: null,
  errorLogin: null,
  loadingLogin: false,
  context: null, // Initialize with no context
};

// Create async thunk for fetching products
// Async thunk for fetching FAQ items
export const fetchUserItems = createAsyncThunk<User[], { context: any }>(
  "user/fetchUserItems",
  async ({ context }) => {
    return fetchUserItemsFromSharePoint(context); // Call the service to fetch FAQ items using context
  }
);

export const addUser = createAsyncThunk<
  User,
  {
    Title: string;
    Password: string;
    Email: string;
    PhoneNumber: string;
    Token: string;
    ExpirationToken: Date;
  },
  { state: RootState }
>("user/addUser", async (newUser, { getState }) => {
  const context = getState().faq.context;
  return addUserToSharePoint(context, newUser);
});

export const signIn = createAsyncThunk<
  User,
  { Email: string; Password: string },
  { state: RootState }
>("userState/signIn", async (UserData) => {
  return signInService({ Email: UserData.Email, Password: UserData.Password });
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(
        fetchUserItems.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          state.userItems = action.payload;
        }
      )

      .addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
        console.log("sdsdsss", action.payload);
        state.userItems.push(action.payload);
      })
      //SigIn
      .addCase(signIn.pending, (state) => {
        state.loadingLogin = true;
        state.errorLogin = null;
      })

      .addCase(signIn.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.loadingLogin = false;
        state.errorLogin = null;
      })

      .addCase(signIn.rejected, (state, action) => {
        state.loadingLogin = false;
        state.errorLogin = action.error.message || "Login failed";
      });
  },
});

export default productsSlice.reducer;
