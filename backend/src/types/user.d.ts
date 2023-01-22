interface IUser {
  username: string;

  email: string;
  name: string;
  address: IAddress;
}

type TUserSignUpInput = IUser & {
  password: string;
  repeatPassword: string;
};

interface IAddress {
  city: string;
  zip: string;
}
