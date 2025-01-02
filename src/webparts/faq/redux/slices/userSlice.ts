import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  addUserToSharePoint,
  signInService,
  fetchUserCartProductsFromSharePoint,
  fetchUserItemsFromSharePoint,
  clearUserCartInSharePoint,
  fetchUserAddressFromSharePoint,
  addUserAddressToSharePoint,
  fetchUserOrdersFromSharePoint,
} from "../services/userService";
import { User } from "../../../../interfaces";
import { RootState } from "../store/store";
import { IProduct } from "../../../../IProducts";
import { IAddress } from "../../../../IAddress";
import * as pnp from "sp-pnp-js";
import { IOrder } from "../../../../IOrder";

export interface UserState {
  userItems: User[];
  userCarts: IProduct[];
  userOrders: IOrder[];
  user: User | null;
  address: IAddress[] | null;
  loadingLogin: boolean;
  errorLogin: string | null;
  context: any;
}
// Define the initial state with proper types
const initialState: UserState = {
  userItems: [],
  user: null,
  userCarts: [],
  userOrders: [],
  address: [],
  errorLogin: null,
  loadingLogin: false,
  context: null,
};

//fetch Users
export const fetchUserItems = createAsyncThunk<User[], { context: any }>(
  "user/fetchUserItems",
  async ({ context }) => {
    return fetchUserItemsFromSharePoint(context);
  }
);

//fetch User Cart

export const fetchUserCartProducts = createAsyncThunk<
  IProduct[],
  { userGUID: string }
>("user/fetchUserCartProducts", async ({ userGUID }) => {
  return fetchUserCartProductsFromSharePoint(userGUID);
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
  const context = getState().product.context;
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

//Clear User Cart

export const clearUserCart = createAsyncThunk<
  void,
  {
    userGUID: string;
    newOrderId: number;
  }
>("cart/clearUserCart", async ({ userGUID, newOrderId }) => {
  return clearUserCartInSharePoint(userGUID, newOrderId);
});

//fetch Users Adress
export const fetchUserAddress = createAsyncThunk<
  IAddress[],
  { UserId: number }
>("user/fetchUserAddress", async ({ UserId }) => {
  return fetchUserAddressFromSharePoint(UserId);
});

//fetch Users Orders
export const fetchUserOrders = createAsyncThunk<IOrder[], { UserId: number }>(
  "user/fetchUserOrders",
  async ({ UserId }) => {
    return fetchUserOrdersFromSharePoint(UserId);
  }
);
//Add User Adress
export const addUserAddress = createAsyncThunk<
  IAddress,
  {
    Country: string;
    City: string;
    Street: string;
    BuildingNumber: number;
    UserId: number;
  },
  { state: RootState }
>("user/addUserAddress", async (AdressData) => {
  const newAddress = {
    Title: "",
    Country: AdressData.Country,
    City: AdressData.City,
    Street: AdressData.Street,
    BuildingNumber: AdressData.BuildingNumber,
    UserId: AdressData.UserId,
  };

  return await addUserAddressToSharePoint(newAddress);
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

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    Logout: (state) => {
      return initialState; // Reset state to its initial values
    },
    clearCart(state) {
      state.userCarts = [];
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

      //fetch User Address

      .addCase(fetchUserAddress.pending, (state) => {
        state.loadingLogin = true;
        state.errorLogin = null;
      })

      .addCase(
        fetchUserAddress.fulfilled,
        (state, action: PayloadAction<IAddress[]>) => {
          state.address = action.payload;
          state.loadingLogin = false;
          state.errorLogin = null;
        }
      )

      .addCase(fetchUserAddress.rejected, (state, action) => {
        state.loadingLogin = false;
        state.errorLogin = action.error.message || "Error Fetch Adress";
      })

      //fetch User Orders

      .addCase(fetchUserOrders.pending, (state) => {
        state.loadingLogin = true;
        state.errorLogin = null;
      })

      .addCase(
        fetchUserOrders.fulfilled,
        (state, action: PayloadAction<IOrder[]>) => {
          state.userOrders = action.payload;
          state.loadingLogin = false;
          state.errorLogin = null;
        }
      )

      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loadingLogin = false;
        state.errorLogin = action.error.message || "Error Fetch Orders";
      })

      //addUserAddress
      .addCase(addUserAddress.pending, (state) => {
        state.loadingLogin = true;
        state.errorLogin = null;
      })

      .addCase(addUserAddress.fulfilled, (state) => {
        state.loadingLogin = false;
        state.errorLogin = null;
      })

      .addCase(addUserAddress.rejected, (state, action) => {
        state.loadingLogin = false;
        state.errorLogin = action.error.message || "Error  addUserAddress";
      });
  },
});
export const { AddToCart, RemoveFromCart, Logout, clearCart } =
  userSlice.actions;
export default userSlice.reducer;
