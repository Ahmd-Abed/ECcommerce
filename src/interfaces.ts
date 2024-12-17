export interface User {
  Id: number;
  Title: string;
  Email: string;
  Password: string;
  PhoneNumber: string;
  Token: string;
  ExpirationToken: Date;
  UserUID: string;
}
