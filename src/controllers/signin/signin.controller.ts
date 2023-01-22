/// <reference path="../../types/user.d.ts" />
/// <reference path="../../types/returns.d.ts" />
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import Joi from "joi";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const UserSignInSchema = Joi.object<TUserSignInInput>({
  usernameOrEmail: Joi.string().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});

const signInController = async (data: TUserSignInInput): Promise<ISuccessBasedReturn<IUserLogin>> => {
  const { error } = UserSignInSchema.validate(data);

  if (error)
    return {
      success: false,
      statusCode: 400,
      message: "Bad Input",
      errors: [error.message],
    };

  // check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          email: data.usernameOrEmail,
        },
        {
          username: data.usernameOrEmail,
        },
      ],
    },
  });

  const incorrectEmailOrPasswordResponse = {
    success: false,
    statusCode: 404,
    message: "User does not exist or password is incorrect.",
    errors: [],
  };

  if (!existingUser) {
    return incorrectEmailOrPasswordResponse;
  }

  const passwordMatches = await bcrypt.compare(data.password, existingUser.password);

  if (!passwordMatches) {
    return incorrectEmailOrPasswordResponse;
  }

  // create and sign a JSON web token
  const token = jwt.sign(
    { username: existingUser.username, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 },
    process.env.JWT_SECRET as string,
    {
      issuer: "sample-auth-api",
    }
  );

  return {
    success: true,
    statusCode: 200,
    message: "Login Successful",
    errors: [],
    data: {
      token: token,
      username: existingUser.username,
      email: existingUser.email,
    },
  };
};

export default signInController;
