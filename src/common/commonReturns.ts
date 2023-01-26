export const internalServerErrorReturn: ISuccessBasedReturn<any> = {
  /**
   * the actual error is abstracted from the client
   * a placeholder message for the error is populated to inform
   * the client that something is not good in the server
   * at the same time provide little to no information as to
   * what the actual issue is
   * the logging service will log the actual error so as the
   * dev team is informed of what happened
   */
  statusCode: 500,
  success: false,
  message: "Some internal server error occurred",
  errors: [],
};
