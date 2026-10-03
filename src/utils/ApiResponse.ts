export class ApiResponse<T = any> {
  public success: boolean;
  public message: string;
  public data: T;

  constructor(message: string = 'Success', data: T = {} as T) {
    this.success = true;
    this.message = message;
    this.data = data;
  }

  static success<T>(message: string, data?: T) {
    return new ApiResponse(message, data);
  }
}
