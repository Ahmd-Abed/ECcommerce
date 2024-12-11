import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  addUserToSharePoint,
  fetchUserItemsFromSharePoint,
  signInService,
  fetchProductsFromSharePoint,
  fetchAnnouncementsFromSharePoint,
} from "../services/productService";
import { User } from "../../../../interfaces";
import { RootState } from "../store/store";
import { IProduct } from "../../../../IProducts";
import { IAnnouncement } from "../../../../IAnnouncement";
import * as pnp from "sp-pnp-js";
// import { getSP } from "../../../../pnpjsConfig";
// import { SPFI } from "@pnp/sp";
// Define types for the product data and state

export interface UserState {
  userItems: User[];
  announcementItems: IAnnouncement[];
  productItems: IProduct[];
  cartItems: IProduct[];
  user: User | null;
  product: IProduct | null;
  loadingLogin: boolean;
  errorLogin: string | null;
  context: any; // Store SharePoint context, for example, to interact with SharePoint API
}
// Define the initial state with proper types
const initialState: UserState = {
  userItems: [],
  announcementItems: [],
  user: null,
  productItems: [],
  product: null,
  cartItems: [],
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

export const fetchProducts = createAsyncThunk<IProduct[], { context: any }>(
  "product/fetchProducts",
  async ({ context }) => {
    return fetchProductsFromSharePoint(context);
  }
);

export const fetchAnnouncements = createAsyncThunk<
  IAnnouncement[],
  { context: any }
>("announcement/fetchAnnouncements", async ({ context }) => {
  return fetchAnnouncementsFromSharePoint(context);
});

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
  return signInService({
    Email: UserData.Email,
    Password: UserData.Password,
  });
});

/*--------------*/
//Add Cart for specific User
export const updateUserCart = async (email: string, productTitle: string) => {
  // const _sp: SPFI = getSP(context);

  try {
    pnp.setup({
      sp: {
        baseUrl: "https://netways2023.sharepoint.com/sites/ECommerce",
      },
    });
    // Get the User item by email
    const userItems = await pnp.sp.web.lists
      .getByTitle("User")
      .items.filter(`Email eq '${email}'`)
      .top(1)
      .get();
    console.log("L2esem " + userItems[0].Title);
    if (userItems.length === 0) {
      throw new Error("User not found in the User list.");
    }
    const user = userItems[0];
    const userId = userItems[0].Id;
    const currentCart = user.Cart
      ? user.Cart.map((item: { Id: number }) => item.Id)
      : [];
    // const existingCart = userItems[0].Cart || []; // Ensure the Cart field exists
    console.log("currentCart " + currentCart);
    // Add the new product title to the cart (if not already present)
    if (!currentCart.includes(productTitle)) {
      console.log("Not exist the product in cart");
      const updatedCart = [...currentCart, productTitle];
      console.log("UpdateCart " + updatedCart[0]);
      // Update the Cart column in the User list
      pnp.setup({
        sp: {
          baseUrl: "https://netways2023.sharepoint.com/sites/ECommerce",
        },
      });
      await pnp.sp.web.lists.getByTitle("User").items.getById(userId).update({
        // For multi-lookup fields, use 'results'
        // Cart: { results: updatedCart },
        ArTitle: updatedCart[0],
      });

      console.log("Cart updated successfully.");
    } else {
      console.log("Product already in cart.");
    }
  } catch (error) {
    console.error("Error updating cart:", error);
  }
};
/*--------------*/
const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    AddToCart: (state, action: PayloadAction<IProduct>) => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        console.error("No user data found in local storage.");
        return;
      }
      // Parse the user data
      const user = JSON.parse(userData);

      // Extract the email
      const email = user.Email;
      console.log("lEmail" + email);
      if (!email) {
        console.error("No email found for the logged-in user.");
        return;
      }
      // Check if the product already exists in the cart
      const productExists = state.cartItems.some(
        (item: { Id: any }) => item.Id === action.payload.Id
      );

      if (!productExists) {
        state.cartItems.push(action.payload); // Add the product to cartItems
        updateUserCart(email, action.payload.Title)
          .then(() => console.log("SharePoint cart updated successfully."))
          .catch((error) =>
            console.error("Error updating SharePoint cart:", error)
          );
      } else {
        console.log("Product is already in the cart.");
      }
    },
    RemoveFromCart: (state, action: PayloadAction<IProduct>) => {
      // Filter out the item with the matching Id
      state.cartItems = state.cartItems.filter(
        (item: { Id: any }) => item.Id !== action.payload.Id
      );

      console.log(
        `Product ${action.payload.Title} has been removed from the cart.`
      );
    },
  },
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
      })

      //fetchProducts

      .addCase(fetchProducts.pending, (state) => {
        state.loadingLogin = true;
        state.errorLogin = null;
      })

      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<IProduct[]>) => {
          state.productItems = action.payload;
          state.loadingLogin = false;
          state.errorLogin = null;
        }
      )

      .addCase(fetchProducts.rejected, (state, action) => {
        state.loadingLogin = false;
        state.errorLogin = action.error.message || "Error Fetch Products";
      })

      //fetchAnnouncements

      .addCase(fetchAnnouncements.pending, (state) => {
        state.loadingLogin = true;
        state.errorLogin = null;
      })

      .addCase(
        fetchAnnouncements.fulfilled,
        (state, action: PayloadAction<IAnnouncement[]>) => {
          state.announcementItems = action.payload;
          state.loadingLogin = false;
          state.errorLogin = null;
        }
      )

      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loadingLogin = false;
        state.errorLogin = action.error.message || "Error Fetch Announcements";
      });
  },
});
export const { AddToCart, RemoveFromCart } = productsSlice.actions;
export default productsSlice.reducer;
