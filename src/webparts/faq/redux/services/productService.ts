import { SPFI } from "@pnp/sp";
import { User } from "../../../../interfaces";
import { getSP } from "../../../../pnpjsConfig";
import * as pnp from "sp-pnp-js";
//import { v4 as uuidv4 } from "uuid";
import { IProduct } from "../../../../IProducts";
import { IAnnouncement } from "../../../../IAnnouncement";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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
  // const _sp: SPFI = getSP(context);
  const items = await pnp.sp.web.lists.getByTitle("Product").items.get();
  return items.map((product: any) => ({
    Id: product.Id,
    Title: product.Title,
    Description: product.Description,
    Image: product.Image?.Url || "",
    Price: product.Price,
    Category: product.Category,
    ShowInBanner: product.ShowInBanner,

    // category: product.category,
  }));
};

//fetch Announcement

export const fetchAnnouncementsFromSharePoint = async (
  context: any
): Promise<IAnnouncement[]> => {
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

// Add a new FAQ item to SharePoint
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
    ExpirationToken: "",
  };
  try {
    const auth = getAuth();
    const signIn = await signInWithEmailAndPassword(
      auth,
      userState.Email,
      userState.Password
    )
      .then(async () => {
        const users = await pnp.sp.web.lists
          .getByTitle("User")
          .items.filter(`UserUID eq '${signIn.user.uid}'`)
          .get();
        if (users.length > 0) {
          const userData: any = users[0];

          const expirationToken = new Date();
          expirationToken.setHours(expirationToken.getHours() + 24);

          console.log("Expiration Time:", expirationToken);

          await pnp.sp.web.lists
            .getByTitle("User")
            .items.getById(userData.Id)
            .update({
              ExpirationToken: expirationToken,
            });
          const updatedUser = {
            ...userData,

            ExpirationToken: expirationToken,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));

          localStorage.setItem("user", JSON.stringify(userData));
          console.log("Login Success and Token Updated");
          return updatedUser;
        } else {
          return emptyUser;
        }
      })
      .catch((error) => {
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
          case "auth/weak-password":
            errorMessage = "Password is too weak!";
            break;
          case "auth/network-request-failed":
            errorMessage = "Network error! Please check your connection.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many attempts! Please try again later.";
            break;
          case "auth/operation-not-allowed":
            errorMessage = "Operation not allowed! Please contact support.";
            break;
          case "auth/invalid-credential":
            errorMessage = "Invalid credential";
            break;
          default:
            errorMessage = "An unknown error occurred: " + error.message;
            break;
        }
        alert(errorMessage);
        return emptyUser;
      });
  } catch (error) {
    console.log("errror in signIn:", error);
    return emptyUser;
  }
  return emptyUser;
};
