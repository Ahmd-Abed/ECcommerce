import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchProductsFromSharePoint,
  fetchAnnouncementsFromSharePoint,
  fetchCategoriesFromSharepoint,
  addReviewToSharePoint,
  addOrderToSharePoint,
  trackOrderFromSharePoint,
  fetchReviewsFromSharepoint,
} from "../services/productService";
import { RootState } from "../store/store";
import { IProduct } from "../../../../IProducts";
import { ICategory } from "../../../../ICategory";
import { IOrder } from "../../../../IOrder";
import { IAnnouncement } from "../../../../IAnnouncement";
import { IReview } from "../../../../IReview";
import { IReviewAccordion } from "../../../../IReviewAccordion";
export interface ProductState {
  announcementItems: IAnnouncement[];
  productItems: IProduct[];
  categories: ICategory[];
  product: IProduct | null;
  order: IOrder | null;
  reviewItems: IReviewAccordion[];
  loading: boolean;
  error: string | null;
  context: any;
}
// Define the initial state with proper types
const initialState: ProductState = {
  announcementItems: [],
  productItems: [],
  product: null,
  categories: [],
  order: null,
  reviewItems: [],
  error: null,
  loading: false,
  context: null,
};

//fetch Prodcut
export const fetchProducts = createAsyncThunk<IProduct[], { context: any }>(
  "product/fetchProducts",
  async ({ context }) => {
    return fetchProductsFromSharePoint(context);
  }
);

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

export const addReview = createAsyncThunk<
  IReview,
  {
    Title: string;
    Description: string;
    ProductId: number;
    UserId: number;
  },
  { state: RootState }
>("user/addReview", async (newReview, { getState }) => {
  const context = getState().product.context;
  return addReviewToSharePoint(context, newReview);
});

//fetch Reviews
export const fetchReviews = createAsyncThunk<IReviewAccordion[]>(
  "review/fetchReviews",
  async () => {
    return fetchReviewsFromSharepoint();
  }
);

//addOrder
export const addOrder = createAsyncThunk<
  IOrder,
  {
    User: number;
    ProductData: number[];
    ProductsQuantities: string;
    TotalPrice: number;
    Status: string;
    Address: string;
  },
  { state: RootState }
>("order/addOrder", async (OrderData) => {
  const newOrder = {
    Title: `Order_${Date.now()}`, // Generate a unique title (e.g., timestamp-based)
    UserId: OrderData.User,
    ProductDataId: { results: OrderData.ProductData },
    ProductsQuantities: OrderData.ProductsQuantities,
    TotalPrice: OrderData.TotalPrice,
    Status: OrderData.Status,
    Address: OrderData.Address,
  };

  return await addOrderToSharePoint(newOrder);
});

//TrackOrder order
export const trackOrder = createAsyncThunk<IOrder, { OrderTitle: string }>(
  "product/trackOrder",
  async ({ OrderTitle }) => {
    return trackOrderFromSharePoint(OrderTitle);
  }
);
/*--------------*/

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      //fetchProducts

      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<IProduct[]>) => {
          state.productItems = action.payload;
          state.loading = false;
          state.error = null;
        }
      )

      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error Fetch Products";
      })

      //fetchCategories

      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<ICategory[]>) => {
          state.categories = action.payload;
          state.loading = false;
          state.error = null;
        }
      )

      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error Fetch Categories";
      })

      //fetchAnnouncements

      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchAnnouncements.fulfilled,
        (state, action: PayloadAction<IAnnouncement[]>) => {
          state.announcementItems = action.payload;
          state.loading = false;
          state.error = null;
        }
      )

      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error Fetch Announcements";
      })
      //Reviews
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchReviews.fulfilled,
        (state, action: PayloadAction<IReviewAccordion[]>) => {
          state.reviewItems = action.payload;
          state.loading = false;
          state.error = null;
        }
      )

      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error Fetch Announcements";
      })

      //addOrder
      .addCase(addOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(addOrder.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })

      .addCase(addOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error  addOrder";
      })

      //fetchOrder
      .addCase(trackOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(trackOrder.fulfilled, (state, action: PayloadAction<IOrder>) => {
        state.order = action.payload;
        state.loading = false;
        state.error = null;
      })

      .addCase(trackOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error  fetchOrder";
      });
  },
});
export default productsSlice.reducer;
