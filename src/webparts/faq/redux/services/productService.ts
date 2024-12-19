import { SPFI } from "@pnp/sp";
import { User } from "../../../../interfaces";
import { getSP } from "../../../../pnpjsConfig";
import * as pnp from "sp-pnp-js";
import { IProduct } from "../../../../IProducts";
import { ICategory } from "../../../../ICategory";
import { IAnnouncement } from "../../../../IAnnouncement";
import { IReview } from "../../../../IReview";
import {
  getAuth,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";
import { IOrder } from "../../../../IOrder";

export const fetchUserItemsFromSharePoint = async (
  context: any
): Promise<User[]> => {
  const _sp: SPFI = getSP(context);
  const items = await _sp.web.lists.getByTitle("User").items();
  console.log("Category" + items[0].Category);
  return items.map((user: any) => ({
    Id: user.Id,
    Title: user.Title,
    Email: user.Email,
    Password: user.Password,
    PhoneNumber: user.PhoneNumber,
    ExpirationToken: user.ExpirationToken,
    UserUID: user.UserUID,
  }));
};

//fetch Products
export const fetchProductsFromSharePoint = async (
  context: any
): Promise<IProduct[]> => {
  const items = await pnp.sp.web.lists
    .getByTitle("Product")
    .items.select(
      "Id",
      "Title",
      "Description",
      "Price",
      "Image",
      "ShowInBanner",
      "Category/Title"
    )
    .expand("Category") // Expand the lookup field to retrieve related data
    .get();

  return items.map((product: any) => ({
    Id: product.Id,
    Title: product.Title,
    Description: product.Description,
    Image: product.Image?.Url || "/sites/ECommerce/SiteAssets/default-gray.png",
    Price: product.Price,
    // Check if Category is a string or an object
    Category:
      typeof product.Category === "string"
        ? product.Category
        : product.Category?.Title, // Access the Title of the expanded Category field
    ShowInBanner: product.ShowInBanner,
  }));
};

// Fetch Products Cart for a Specific User
export const fetchUserCartProductsFromSharePoint = async (
  userGUID: string
): Promise<IProduct[]> => {
  try {
    // Fetch the user with expanded Cart lookup field
    const userCartItem = await pnp.sp.web.lists
      .getByTitle("User")
      .items.filter(`GUID eq '${userGUID}'`)
      .select("Cart/Id", "Cart/Title") // Select the Cart lookup column fields
      .expand("Cart") // Expand the lookup field to access its referenced data
      .top(1)
      .get();

    if (userCartItem.length === 0) {
      console.warn(`No cart found for the userGUID: ${userGUID}`);
      return [];
    }

    if (userCartItem.length > 0) {
      console.log(` cart found for the userGUID: ${userGUID}`);
    }
    // Extract product IDs from the Cart lookup field

    const cartLookupItems = userCartItem[0].Cart;
    if (!cartLookupItems || cartLookupItems.length === 0) {
      console.warn("The cart is empty for this user.");
      return [];
    }

    const productIds = cartLookupItems.map((item: any) => item.Id);

    // Fetch the product details from the Product list
    const allProducts = await pnp.sp.web.lists
      .getByTitle("Product")
      .items.filter(productIds.map((id: number) => `Id eq ${id}`).join(" or "))
      .select("Id", "Title", "Description", "Image", "Price", "ShowInBanner")
      .get();
    console.log("Ba3d lfetch allProducts " + allProducts);

    // Map the fetched products into the IProduct format
    return allProducts.map((product: any) => ({
      Id: product.Id,
      Title: product.Title,
      Description: product.Description,
      Image:
        product.Image?.Url || "/sites/ECommerce/SiteAssets/default-gray.png",
      Price: product.Price,
      ShowInBanner: product.ShowInBanner,
    }));
  } catch (error) {
    console.error("Error fetching user cart products:", error);
    return [];
  }
};

//fetch Announcement

export const fetchAnnouncementsFromSharePoint = async (
  context: any
): Promise<IAnnouncement[]> => {
  pnp.setup({
    sp: {
      baseUrl: "https://netways2023.sharepoint.com/sites/ECommerce",
    },
  });
  const items = await pnp.sp.web.lists
    .getByTitle("Announcement")
    .items.filter("Disabled eq false")
    .get();
  return items.map((announcement: any) => ({
    Id: announcement.Id,
    Title: announcement.Title,
    Description: announcement.Description,
  }));
};

//fetch Favorite Products

export const fetchCategoriesFromSharepoint = async (): Promise<ICategory[]> => {
  try {
    // Fetch items from the "Category" list
    const categories = await pnp.sp.web.lists
      .getByTitle("Category")
      .items.select("Id", "Title", "isFavorite")
      .get();

    return categories.map((category: any) => ({
      Id: category.Id,
      Title: category.Title,
      isFavorite: category.isFavorite || false, // Default to false if undefined
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
};

export const addUserToSharePoint = async (
  context: any,
  newUser: {
    Title: string;
    Email: string;
    Password: string;
    PhoneNumber: string;
    ExpirationToken: Date;
    UserUID: string;
  }
): Promise<User> => {
  const _sp: SPFI = getSP(context);
  const response = await _sp.web.lists.getByTitle("User").items.add(newUser);
  return {
    Id: response.Id,
    Title: newUser.Title,
    Email: newUser.Email,
    Password: newUser.Password,
    PhoneNumber: newUser.PhoneNumber,
    ExpirationToken: newUser.ExpirationToken,
    UserUID: newUser.UserUID,
  };
};

//Review

export const addReviewToSharePoint = async (
  context: any,
  newReview: {
    Title: string;
    Description: string;
    ProductId: number;
    UserId: number;
  }
): Promise<IReview> => {
  try {
    const response = await pnp.sp.web.lists
      .getByTitle("Review")
      .items.add(newReview);

    console.log("SharePoint response:", response);

    return {
      Id: response.data.Id,
      Title: newReview.Title,
      Description: newReview.Description,
      ProductId: newReview.ProductId,
      UserId: newReview.UserId,
    };
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

//addOrderToSharePoint
export const addOrderToSharePoint = async (newOrder: {
  Title: string;
  UserId: number;
  ProductDataId: { results: number[] };
  ProductsQuantities: string;
  TotalPrice: number;
}): Promise<IOrder> => {
  try {
    // Add the new order to the SharePoint "Order" list
    const response = await pnp.sp.web.lists
      .getByTitle("Order")
      .items.add(newOrder);

    // Return the newly created order object
    return {
      Id: response.data.Id,
      Title: newOrder.Title,
      UserId: newOrder.UserId,
      ProductDataId: newOrder.ProductDataId,
      ProductsQuantities: newOrder.ProductsQuantities,
      TotalPrice: newOrder.TotalPrice,
    };
  } catch (error) {
    console.error("Error adding order to SharePoint:", error);
    throw new Error("Failed to add order to SharePoint.");
  }
};

//Clear Cart Of User

export const clearUserCartInSharePoint = async (
  userGUID: string,
  newOrderId: number
): Promise<void> => {
  try {
    const userItem = await pnp.sp.web.lists
      .getByTitle("User")
      .items.filter(`GUID eq '${userGUID}'`)
      .get();

    if (userItem.length === 0) {
      throw new Error("User not found.");
    }
    const user = userItem[0];
    const userId = user.Id;
    const currentOrders = user.OrdersId;
    const currentOrderCount = user.CurrentOrder || 0;
    let updatedOrders = [...currentOrders];
    updatedOrders.push(newOrderId);
    await pnp.sp.web.lists
      .getByTitle("User")
      .items.getById(userId)
      .update({
        CartId: {
          results: [],
        },
        ProductsQuantities: "",
        CurrentOrder: currentOrderCount + 1,
        OrdersId: {
          results: updatedOrders,
        },
      });

    console.log("User cart cleared successfully.");
  } catch (error) {
    console.error("Error clearing user cart in SharePoint:", error);
    throw new Error("Failed to clear user cart in SharePoint.");
  }
};

// export const signInService = async (userState: {
//   Email: string;
//   Password: string;
// }): Promise<User> => {
//   const users = await pnp.sp.web.lists
//     .getByTitle("User")
//     .items.filter(
//       `Email eq '${userState.Email}' and Password eq '${userState.Password}'`
//     )
//     .get();
//   console.log(users);
//   if (users.length > 0) {
//     const userData: any = users[0];
//     const expirationToken = new Date();
//     expirationToken.setHours(expirationToken.getHours() + 24);
//     console.log("Expiration Time:", expirationToken);

//     await pnp.sp.web.lists
//       .getByTitle("User")
//       .items.getById(userData.Id)
//       .update({
//         ExpirationToken: expirationToken,
//       });
//     const updatedUser = {
//       ...userData,
//       ExpirationToken: expirationToken,
//     };
//     localStorage.setItem("user", JSON.stringify(updatedUser));
//     console.log("Login Success and Token Updated");
//     return updatedUser;
//   } else {
//     const emptyUser: any = {
//       Id: 0,
//       Email: "",
//       Password: "",
//       PhoneNumber: "",
//       Title: "",
//       ExpirationToken: "",
//     };
//     return emptyUser;
//   }
// };

export const signInService = async (userState: {
  Email: string;
  Password: string;
}): Promise<User> => {
  const emptyUser: any = {
    Id: 0,
    Email: "",
    Password: "",
    PhoneNumber: "",
    Title: "",
    ExpirationToken: new Date(),
    UserUID: "",
  };
  try {
    const auth = getAuth();
    const signIn: UserCredential = await signInWithEmailAndPassword(
      auth,
      userState.Email,
      userState.Password
    );
    if (signIn.user) {
      // Fetch the user from SharePoint based on Firebase UID
      const users = await pnp.sp.web.lists
        .getByTitle("User")
        .items.filter(`UserUID eq '${signIn.user.uid}'`)
        .get();

      if (users.length > 0) {
        const userData = users[0];
        const expirationToken = new Date();
        expirationToken.setHours(expirationToken.getHours() + 24); // Token expires in 24 hours

        // Update the expiration token in SharePoint
        await pnp.sp.web.lists
          .getByTitle("User")
          .items.getById(userData.Id)
          .update({
            ExpirationToken: expirationToken,
          });

        // Update user data with expiration token
        const updatedUser: User = {
          ...userData,
          ExpirationToken: expirationToken,
        };

        // Save to local storage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("Login success and token updated");

        return updatedUser;
      } else {
        console.log("User not found in SharePoint list");
        return emptyUser;
      }
    }
  } catch (error: any) {
    console.error("Error in signInService:", error);

    let errorMessage = "";
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Email already in use!";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address!";
        break;
      case "auth/user-disabled":
        errorMessage = "This user has been disabled!";
        break;
      case "auth/user-not-found":
        errorMessage = "User not found!";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password!";
        break;
      case "auth/network-request-failed":
        errorMessage = "Network error! Please check your connection.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many attempts! Please try again later.";
        break;
      default:
        errorMessage = `An unknown error occurred: ${error.message}`;
        break;
    }
    alert(errorMessage);
    return emptyUser;
  }

  return emptyUser;
};
