import * as pnp from "sp-pnp-js";
import { IProduct } from "../../../../IProducts";
import { ICategory } from "../../../../ICategory";
import { IAnnouncement } from "../../../../IAnnouncement";
import { IReview } from "../../../../IReview";
import { IReviewAccordion } from "../../../../IReviewAccordion";
import { IOrder } from "../../../../IOrder";

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

//Add Review

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

// Fetch reviews from SharePoint
export const fetchReviewsFromSharepoint = async (): Promise<
  IReviewAccordion[]
> => {
  try {
    const reviewItems: any[] = await pnp.sp.web.lists
      .getByTitle("Review")
      .items.select(
        "Id",
        "Title",
        "Description",
        "ProductId",
        "Product/Title",
        "User/Title"
      )
      .expand("Product", "User")
      .get();

    return reviewItems.map((item) => ({
      Id: item.Id,
      Title: item.Title,
      Description: item.Description,
      ProductId: item.ProductId,
      Product:
        typeof item.Product === "string" ? item.Product : item.Product?.Title,
      User: typeof item.User === "string" ? item.User : item.User?.Title,
    }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

//addOrderToSharePoint
export const addOrderToSharePoint = async (newOrder: {
  Title: string;
  UserId: number;
  ProductDataId: { results: number[] };
  ProductsQuantities: string;
  TotalPrice: number;
  Status: string;
  Address: string;
}): Promise<IOrder> => {
  try {
    const response = await pnp.sp.web.lists
      .getByTitle("Order")
      .items.add(newOrder);

    return {
      Id: response.data.Id,
      Title: newOrder.Title,
      UserId: newOrder.UserId,
      ProductDataId: newOrder.ProductDataId,
      ProductsQuantities: newOrder.ProductsQuantities,
      TotalPrice: newOrder.TotalPrice,
      Status: newOrder.Status,
      Address: newOrder.Address,
    };
  } catch (error) {
    console.error("Error adding order to SharePoint:", error);
    throw new Error("Failed to add order to SharePoint.");
  }
};

export const trackOrderFromSharePoint = async (
  OrderTitle: string
): Promise<IOrder> => {
  const orderItem = await pnp.sp.web.lists
    .getByTitle("Order")
    .items.filter(`Title eq '${OrderTitle}'`)
    .select(
      "Id",
      "Title",
      "ProductsQuantities",
      "ProductDataId",
      "UserId",
      "TotalPrice",
      "Address",
      "Status"
    )
    .top(1)
    .get();
  if (orderItem.length > 0) {
    return {
      Id: orderItem[0].Id,
      Title: orderItem[0].Title,
      UserId: orderItem[0].UserId,
      ProductDataId: orderItem[0].ProductDataId,
      ProductsQuantities: orderItem[0].ProductsQuantities,
      TotalPrice: orderItem[0].TotalPrice,
      Status: orderItem[0].Status || "Unknown",
      Address: orderItem[0].Address,
    };
  } else {
    throw new Error("Order not found");
  }
};
