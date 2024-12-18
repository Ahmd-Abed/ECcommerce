import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  addUserToSharePoint,
  signInService,
  fetchProductsFromSharePoint,
  fetchAnnouncementsFromSharePoint,
  fetchUserCartProductsFromSharePoint,
  fetchCategoriesFromSharepoint,
  fetchUserItemsFromSharePoint,
} from "../services/productService";
import { User } from "../../../../interfaces";
import { RootState } from "../store/store";
import { IProduct } from "../../../../IProducts";
import { ICategory } from "../../../../ICategory";
import { IAnnouncement } from "../../../../IAnnouncement";
import * as pnp from "sp-pnp-js";

export interface UserState {
  userItems: User[];
  announcementItems: IAnnouncement[];
  productItems: IProduct[];
  userCarts: IProduct[];
  categories: ICategory[];
  user: User | null;
  product: IProduct | null;
  loadingLogin: boolean;
  errorLogin: string | null;
  context: any;
}
// Define the initial state with proper types
const initialState: UserState = {
  userItems: [],
  announcementItems: [],
  user: null,
  productItems: [],
  product: null,
  userCarts: [],
  categories: [],
  errorLogin: null,
  loadingLogin: false,
  context: null,
};

export const fetchUserItems = createAsyncThunk<User[], { context: any }>(
  "user/fetchUserItems",
  async ({ context }) => {
    return fetchUserItemsFromSharePoint(context);
  }
);

//fetch Prodcut
export const fetchProducts = createAsyncThunk<IProduct[], { context: any }>(
  "product/fetchProducts",
  async ({ context }) => {
    return fetchProductsFromSharePoint(context);
  }
);

//fetch User Cart

export const fetchUserCartProducts = createAsyncThunk<
  IProduct[],
  { userGUID: string }
>("product/fetchUserCartProducts", async ({ userGUID }) => {
  return fetchUserCartProductsFromSharePoint(userGUID);
});

//fetch Announcements

export const fetchAnnouncements = createAsyncThunk<
  IAnnouncement[],
  { context: any }
>("announcement/fetchAnnouncements", async ({ context }) => {
  return fetchAnnouncementsFromSharePoint(context);
});

//fetch Categories

export const fetchCategories = createAsyncThunk<ICategory[]>(
  "categorie/fetchCategories",
  async () => {
    return fetchCategoriesFromSharepoint();
  }
);

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
  return await signInService({
    Email: UserData.Email,
    Password: UserData.Password,
  });
});

/*--------------*/
//Add Cart for specific User
export const updateUserCart = async (
  userGUID: string,
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
      .items.filter(`GUID eq '${userGUID}'`)
      .top(1)
      .get();

    if (userItems.length === 0) {
      throw new Error("User not found in the User list.");
    }

    const user = userItems[0];
    const userId = user.Id;

    // Retrieve the current Cart field (array of lookup IDs)
    const currentCart = user.CartId;
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
    } else if (action !== "Delete") {
      // If product doesn't exist, add it
      productsQuantitiesArray.push(productString);
    }

    // Join updated quantities into a string
    const updatedProductsQuantities = productsQuantitiesArray.join(",");

    // Check if the product is already in the cart
    let updatedCart = [...currentCart];

    if (action === "Delete" && currentCart.includes(productId)) {
      // Remove productId from the cart
      updatedCart = updatedCart.filter((id) => id !== productId);
    } else if (action !== "Delete" && !currentCart.includes(productId)) {
      // Add productId to the cart
      updatedCart.push(productId);
    }
    console.log("updatedCart " + updatedCart);

    await pnp.sp.web.lists
      .getByTitle("User")
      .items.getById(userId)
      .update({
        CartId: {
          results: updatedCart,
        },
        ProductsQuantities: updatedProductsQuantities,
      });

    ///////////Edit on UserCarts List//////////
    // Reference the UsersCarts list
    //     const userCartList = pnp.sp.web.lists.getByTitle("UsersCarts");

    //     // Fetch items filtered by UserEmail
    //     const items = await userCartList.items
    //       .filter(`UserEmail eq '${email}'`)
    //       .top(1)
    //       .get();

    //     if (items.length > 0) {
    //       // Update the first matching item
    //       const itemId = items[0].Id; // Get the ID of the item to update
    //       await userCartList.items.getById(itemId).update({
    //         UserCart: updatedProductsQuantities,
    //       });
    //       console.log(`UserCart updated successfully for email: ${email}`);
    //     } else {
    //       // Add a new item if no match exists
    //       await userCartList.items.add({
    //         UserEmail: email,
    //         UserCart: updatedProductsQuantities,
    //       });
    //       console.log(`New UserCart created for email: ${email}`);
    //     }

    //     console.log("Cart updated successfully.");
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
      const userGUID = user.GUID;
      console.log("lEmail" + user.Email);
      if (!user.Email) {
        console.error("No email found for the logged-in user.");
        return;
      }
      // Check if the product already exists in the cart
      const productExists = state.userCarts.some(
        (item: { Id: any }) => item.Id === action.payload.Id
      );

      if (!productExists) {
        // state.cartItems.push(action.payload);
        state.userCarts.push(action.payload); // Add the product to cartItems
        updateUserCart(userGUID, action.payload.Id, action.payload.Title, "Add")
          .then(() => {
            console.log("SharePoint cart updated successfully.");
          })
          .catch((error) =>
            console.error("Error updating SharePoint cart:", error)
          );
      } else {
        console.log("Product is already in the cart.");
        // Update the  product quantities
        updateUserCart(userGUID, action.payload.Id, action.payload.Title, "Add")
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
      const userGUID = user.GUID;
      console.log("lEmail" + user.Email);
      if (!user.Email) {
        console.error("No email found for the logged-in user.");
        return;
      }

      // Filter out the item with the matching Id
      state.userCarts = state.userCarts.filter(
        (item: { Id: any }) => item.Id !== action.payload.Id
      );

      console.log(
        `Product ${action.payload.Title} has been removed from the cart.`
      );
      updateUserCart(
        userGUID,
        action.payload.Id,
        action.payload.Title,
        "Delete"
      )
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

      //Add User
      .addCase(addUser.pending, (state) => {
        state.loadingLogin = true;
        state.errorLogin = null;
      })
      .addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.userItems.push(action.payload);
        state.loadingLogin = false;
        state.errorLogin = null;
      })

      .addCase(addUser.rejected, (state, action) => {
        state.loadingLogin = false;
        state.errorLogin = action.error.message || "Sign Up failed";
      })

      //SigIn
      .addCase(signIn.pending, (state) => {
        state.loadingLogin = true;
        state.errorLogin = null;
        console.log("Pending..");
      })

      .addCase(signIn.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.loadingLogin = false;
        state.errorLogin = null;
        console.log("fulfilled.." + action.payload);
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

      //fetchCategories

      .addCase(fetchCategories.pending, (state) => {
        state.loadingLogin = true;
        state.errorLogin = null;
      })

      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<ICategory[]>) => {
          state.categories = action.payload;
          state.loadingLogin = false;
          state.errorLogin = null;
        }
      )

      .addCase(fetchCategories.rejected, (state, action) => {
        state.loadingLogin = false;
        state.errorLogin = action.error.message || "Error Fetch Categories";
      })

      //fetch Cart User

      .addCase(fetchUserCartProducts.pending, (state) => {
        state.loadingLogin = true;
        state.errorLogin = null;
      })

      .addCase(
        fetchUserCartProducts.fulfilled,
        (state, action: PayloadAction<IProduct[]>) => {
          state.userCarts = action.payload;
          state.loadingLogin = false;
          state.errorLogin = null;
        }
      )

      .addCase(fetchUserCartProducts.rejected, (state, action) => {
        state.loadingLogin = false;
        state.errorLogin = action.error.message || "Error Fetch User Cart";
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
