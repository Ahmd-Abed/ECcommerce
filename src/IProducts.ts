export interface IProduct {
  Id: number;
  Title: string;
  Description: string;
  Image: string;
  Price: number;
  Category: string | { Title: string };
  ShowInBanner: boolean;
}
