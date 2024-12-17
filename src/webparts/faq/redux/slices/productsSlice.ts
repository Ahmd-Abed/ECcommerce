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
    ExpirationToken: Date;
    UserUID: string;
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
export const updateUserCart = async (
  email: string,
  productId: number,
  ProductTitle: string,
  action: string
) => {
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

    if (userItems.length === 0) {
      throw new Error("User not found in the User list.");
    }

    const user = userItems[0];
    const userId = user.Id;

    // Retrieve the current Cart field (array of lookup IDs)
    const currentCart = user.Cart
      ? user.Cart.map((item: { Id: number }) => item.Id)
      : [];

    const currentProductsQuantities = user.ProductsQuantities
      ? user.ProductsQuantities
      : "";

    // Update the ProductsQuantities column
    let productsQuantitiesArray = currentProductsQuantities
      ? currentProductsQuantities.split(",")
      : [];
    const productString = `${ProductTitle}[1]`;

    // Check if the product already exists in ProductsQuantities
    const existingProductIndex = productsQuantitiesArray.findIndex(
      (item: any) => item.startsWith(`${ProductTitle}[`)
    );

    if (existingProductIndex !== -1) {
      let counter = 1;
      if (action === "Delete") {
        counter = -1;
      }
      // If product exists, increment its quantity
      const currentQuantity = parseInt(
        productsQuantitiesArray[existingProductIndex].match(/\[(\d+)\]/)[1]
      );

      if (action === "Delete" && currentQuantity === 1) {
        // Use filter to remove the product from the array
        productsQuantitiesArray = productsQuantitiesArray.filter(
          (_: any, index: any) => index !== existingProductIndex
        );
      } else {
        productsQuantitiesArray[existingProductIndex] = `${ProductTitle}[${
          currentQuantity + counter
        }]`;
      }
    } else {
      // If product doesn't exist, add it
      productsQuantitiesArray.push(productString);
    }

    // Join updated quantities into a string
    const updatedProductsQuantities = productsQuantitiesArray.join(",");

    // Check if the product is already in the cart
    if (!currentCart.includes(productId)) {
      // Add the new product ID to the cart
      const updatedCart = [...currentCart, productId];

      // Construct the JSON structure for the multi-lookup field
      const cartJson = updatedCart.map((id) => ({ Id: id }));
      console.log("cartJson" + cartJson);
      for (let i = 0; i < cartJson.length; i++) {
        console.log("cartJson[+i+]" + cartJson[i].Id);
      }
      // Update the Cart field in the User list
      await pnp.sp.web.lists
        .getByTitle("User")
        .items.getById(userId)
        .update({
          Cart: { results: cartJson }, // Multi-lookup fields require the 'results' array
          // ArTitle: cartJson[0],
          ProductsQuantities: updatedProductsQuantities,
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
    Logout: (state) => {
      return initialState; // Reset state to its initial values
    },
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
        updateUserCart(email, action.payload.Id, action.payload.Title, "Add")
          .then(() => console.log("SharePoint cart updated successfully."))
          .catch((error) =>
            console.error("Error updating SharePoint cart:", error)
          );
      } else {
        console.log("Product is already in the cart.");
        // Update the  product quantities
        updateUserCart(email, action.payload.Id, action.payload.Title, "Add")
          .then(() => console.log("SharePoint cart updated successfully."))
          .catch((error) =>
            console.error("Error updating SharePoint cart:", error)
          );
      }
    },
    RemoveFromCart: (state, action: PayloadAction<IProduct>) => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        console.error("No user data found in local storage.");
        return;
      }
      const user = JSON.parse(userData);
      const email = user.Email;
      console.log("lEmail" + email);
      if (!email) {
        console.error("No email found for the logged-in user.");
        return;
      }

      // Filter out the item with the matching Id
      state.cartItems = state.cartItems.filter(
        (item: { Id: any }) => item.Id !== action.payload.Id
      );

      console.log(
        `Product ${action.payload.Title} has been removed from the cart.`
      );
      updateUserCart(email, action.payload.Id, action.payload.Title, "Delete")
        .then(() => console.log("SharePoint cart updated successfully."))
        .catch((error) =>
          console.error("Error updating SharePoint cart:", error)
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
export const { AddToCart, RemoveFromCart, Logout } = productsSlice.actions;
export default productsSlice.reducer;
