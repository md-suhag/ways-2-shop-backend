export interface IMonthlyAll {
  label: string;
  month: string;
  revenue: number;
  customers: number;
  providers: number;
}

export type MonthlyRevenue = Pick<IMonthlyAll, "label" | "month" | "revenue">;
export type MonthlyCustomers = Pick<
  IMonthlyAll,
  "label" | "month" | "customers"
>;
export type MonthlyProviders = Pick<
  IMonthlyAll,
  "label" | "month" | "providers"
>;
