interface ISuccessBasedReturn<T> {
  success: boolean;
  statusCode: number;
  message: string;
  errors: string[];

  data?: T;
}
