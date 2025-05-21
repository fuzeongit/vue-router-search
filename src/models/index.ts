export interface IOrderFilter {
  sort: string[];
}

export interface IPageable extends IOrderFilter {
  pageNumber: number;

  pageSize: number;
}
