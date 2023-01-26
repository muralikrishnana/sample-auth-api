/// <reference path="../../types/user.d.ts" />
/// <reference path="../../types/returns.d.ts" />
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import Joi from "joi";
import { internalServerErrorReturn } from "../../common/commonReturns";
import { logger } from "../../logger";

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
  /**
   * validate input data
   */
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

  /**
   * ensure that no user exists in the db with the same
   * email or username as the one entered now
   */
  let [existingUserWithEmail, existingWithUsername]: [User | null, User | null] = [null, null];

  try {
    [existingUserWithEmail, existingWithUsername] = await prisma.$transaction([
      prisma.user.findUnique({ where: { email: user.email } }),
      prisma.user.findUnique({ where: { username: user.username } }),
    ]);
  } catch (errorFetchingUser: any) {
    logger.error(errorFetchingUser?.message);

    return internalServerErrorReturn;
  }

  const existingUser = existingUserWithEmail || existingWithUsername;

  if (existingUser) {
    return {
      success: false,
      statusCode: 409,
      message: "User already exists",
      errors: [],
    };
  }

  let hashedPassword = null;

  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (errorHashingPassword: any) {
    logger.error(errorHashingPassword?.message);

    return internalServerErrorReturn;
  }

  /**
   * all checks are done
   * create a new user in the db
   */
  let createdUser = null;

  try {
    createdUser = await prisma.user.create({
      data: {
        ...user,

        password: hashedPassword,
      },
    });
  } catch (errorCreatingUser: any) {
    logger.error(errorCreatingUser?.message);

    return internalServerErrorReturn;
  }

  if (!user) {
    /**
     * couldn't signup user
     */
    logger.error("Cannot create user");

    return internalServerErrorReturn;
  }

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
