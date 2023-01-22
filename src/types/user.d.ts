interface IUser {
  username: string;

  email: string;
  name: string;
  address: IAddress;
}

interface IUserLogin {
  username: string;
  email: string;

  /**
   * JWT
   */
  token: string;
}

type TUserSignUpInput = IUser & {
  password: string;
  repeatPassword: string;
};

interface TUserSignInInput {
  usernameOrEmail: string;
  password: string;
}

interface IAddress {
  city: string;
  zip: string;
}
