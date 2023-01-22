/// <reference path="../../types/user.d.ts" />
/// <reference path="../../types/returns.d.ts" />
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import Joi from "joi";

const prisma = new PrismaClient();

const UserSignUpSchema = Joi.object<TUserSignUpInput>({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  repeatPassword: Joi.ref("password"),

  name: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } })
    .required(),
  address: Joi.object<TUserSignUpInput["address"]>({
    city: Joi.string().required(),
    zip: Joi.string().pattern(new RegExp("^[0-9]{5}(?:-[0-9]{4})?$")).required(),
  }).required(),
});

const signUpController = async ({ password, repeatPassword, ...user }: TUserSignUpInput): Promise<ISuccessBasedReturn<IUser>> => {
  const { error } = UserSignUpSchema.validate({
    ...user,
    password,
    repeatPassword,
  });

  if (error)
    return {
      success: false,
      statusCode: 400,
      message: "Bad Input",
      errors: [error.message],
    };

  if (password !== repeatPassword) {
    return {
      success: false,
      statusCode: 400,
      message: "Passwords does not match",
      errors: [],
    };
  }

  // check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: {
        username: user.username,
        email: user.email,
      },
    },
  });

  if (existingUser) {
    return {
      success: false,
      statusCode: 409,
      message: "User already exists",
      errors: [],
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // create new user
  const createdUser = await prisma.user.create({
    data: {
      ...user,

      password: hashedPassword,
    },
  });

  return {
    success: true,
    statusCode: 201,
    message: "Signup Successful",
    errors: [],
    data: {
      username: createdUser.username,
      name: createdUser.name,
      email: createdUser.email,
      address: createdUser.address,
    },
  };
};

export default signUpController;
