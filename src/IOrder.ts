export interface IOrder {
  Id: number;
  Title: string;
  UserId: number;
  ProductDataId: { results: number[] };
  ProductsQuantities: string;
  TotalPrice: number;
}
