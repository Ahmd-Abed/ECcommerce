export interface IReviewAccordion {
  Id: number;
  Title: string;
  Description: string;
  Product: string | { Title: string };
  User: string | { Title: string };
  ProductId: number;
}
