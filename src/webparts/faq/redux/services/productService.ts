import { SPFI } from "@pnp/sp";
import { User } from "../../../../interfaces";
import { getSP } from "../../../../pnpjsConfig";
import * as pnp from "sp-pnp-js";
import { v4 as uuidv4 } from "uuid";
import { IProduct } from "../../../../IProducts";

export const fetchUserItemsFromSharePoint = async (
  context: any
): Promise<User[]> => {
  const _sp: SPFI = getSP(context);
  const items = await _sp.web.lists.getByTitle("User").items();
  return items.map((user: any) => ({
    Id: user.Id,
    Title: user.Title,
    Email: user.Email,
    Password: user.Password,
    PhoneNumber: user.PhoneNumber,
    Token: user.Token,
    ExpirationToken: user.ExpirationToken,
  }));
};
export const fetchProductsFromSharePoint = async (
  context: any
): Promise<IProduct[]> => {
  // const _sp: SPFI = getSP(context);
  const items = await pnp.sp.web.lists.getByTitle("Product").items.get();
  console.log("Liutems hene " + items);
  return items.map((product: any) => ({
    Id: product.Id,
    Title: product.Title,
    Description: product.Description,
    Quantity: product.Quantity,
    sell: product.sell,
    // category: product.category,
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
    Token: string;
    ExpirationToken: Date;
  }
): Promise<User> => {
  const _sp: SPFI = getSP(context);
  const response = await _sp.web.lists.getByTitle("User").items.add(newUser);
  console.log(" Ltokne heye " + newUser.Token);
  return {
    Id: response.Id,
    Title: newUser.Title,
    Email: newUser.Email,
    Password: newUser.Password,
    PhoneNumber: newUser.PhoneNumber,
    Token: newUser.Token,
    ExpirationToken: newUser.ExpirationToken,
  };
};

export const signInService = async (userState: {
  Email: string;
  Password: string;
}): Promise<User> => {
  const users = await pnp.sp.web.lists
    .getByTitle("User")
    .items.filter(
      `Email eq '${userState.Email}' and Password eq '${userState.Password}'`
    )
    .get();
  console.log(users);
  if (users.length > 0) {
    const userData: any = users[0];
    const token = uuidv4();
    const expirationToken = new Date();
    expirationToken.setHours(expirationToken.getHours() + 24);
    console.log("Generated Token:", token);
    console.log("Expiration Time:", expirationToken);

    await pnp.sp.web.lists
      .getByTitle("User")
      .items.getById(userData.Id)
      .update({
        Token: token,
        ExpirationToken: expirationToken,
      });
    const updatedUser = {
      ...userData,
      Token: token,
      ExpirationToken: expirationToken,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    // localStorage.setItem("user", JSON.stringify(userData));
    console.log("Login Success and Token Updated");
    return updatedUser;
  } else {
    const emptyUser: any = {
      Id: 0,
      Email: "",
      Password: "",
      PhoneNumber: "",
      Title: "",
      Token: "",
      ExpirationToken: "",
    };
    return emptyUser;
  }
};
