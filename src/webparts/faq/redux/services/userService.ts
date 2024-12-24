import { SPFI } from "@pnp/sp";
import { User } from "../../../../interfaces";
import { getSP } from "../../../../pnpjsConfig";
import * as pnp from "sp-pnp-js";
import { IProduct } from "../../../../IProducts";
import {
  getAuth,
  signInWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";
import { IAddress } from "../../../../IAddress";

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

//fetchUserAdressFromSharePoint
export const fetchUserAddressFromSharePoint = async (
  UserId: number
): Promise<IAddress[]> => {
  try {
    console.log("juwet fetchUserAddressFromSharePoint ");
    const AdressOfUser = await pnp.sp.web.lists
      .getByTitle("Address")
      .items.filter(`UserId eq ${UserId}`) // Filter based on the lookup field's Id
      .select(
        "Id",
        "Title",
        "Country",
        "City",
        "Street",
        "BuildingNumber",
        "UserId",
        "User/Title"
      )
      .expand("User")
      .get();
    console.log("AdressOfUser[0]", AdressOfUser[0]);
    // console.log("AdressOfUser[0] User", AdressOfUser[0].User.Title);
    if (!AdressOfUser || AdressOfUser.length === 0) {
      console.log("juwet if (!AdressOfUser || AdressOfUser.length");
      return [];
    }
    return AdressOfUser.map((item: IAddress) => ({
      Id: item.Id,
      Title: item.Title,
      Country: item.Country,
      City: item.City,
      Street: item.Street,
      BuildingNumber: item.BuildingNumber,
    }));
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return [];
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
