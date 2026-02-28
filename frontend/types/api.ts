export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorResponse {
  message: string;
  errors?: Array<{
    msg: string;
    param: string;
    location?: string;
  }>;
  error?: string;
  statusCode?: number;
}
