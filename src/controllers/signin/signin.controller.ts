/// <reference path="../../types/user.d.ts" />
/// <reference path="../../types/returns.d.ts" />
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import Joi from "joi";
import jwt from "jsonwebtoken";
import { internalServerErrorReturn } from "../../common/commonReturns";
import { logger } from "../../logger";

const prisma = new PrismaClient();

const UserSignInSchema = Joi.object<TUserSignInInput>({
  usernameOrEmail: Joi.string().min(3).max(30).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});

const signInController = async (data: TUserSignInInput): Promise<ISuccessBasedReturn<IUserLogin>> => {
  /**
   * validate input data
   */
  const { error } = UserSignInSchema.validate(data);

  if (error)
    return {
      success: false,
      statusCode: 400,
      message: "Bad Input",
      errors: [error.message],
    };

  /**
   * the input usernameOrEmail is checked against the username field
   * as well as the email field
   * if in neither case a record is found the user has entered incorrect
   * details
   */
  let [existingEmail, existingUsername]: [User | null, User | null] = [null, null];

  try {
    [existingEmail, existingUsername] = await prisma.$transaction([
      prisma.user.findUnique({ where: { email: data.usernameOrEmail } }),
      prisma.user.findUnique({ where: { username: data.usernameOrEmail } }),
    ]);
  } catch (errorFetchingUserUsingUsernameOrEmail: any) {
    logger.error(errorFetchingUserUsingUsernameOrEmail?.message);

    return internalServerErrorReturn;
  }

  const existingUser = existingEmail || existingUsername;

  const incorrectEmailOrPasswordResponse = {
    success: false,
    statusCode: 404,
    message: "User does not exist or password is incorrect.",
    errors: [],
  };

  if (existingUser === null) {
    return incorrectEmailOrPasswordResponse;
  }

  /**
   * the user exists in the db
   * can proceed to hashCompare the provided password with the one
   * in the db
   */
  let passwordMatches = false;

  try {
    passwordMatches = await bcrypt.compare(data.password, existingUser.password);
  } catch (errorHashComparingPasswords: any) {
    logger.error(errorHashComparingPasswords?.message);

    return internalServerErrorReturn;
  }

  /**
   * if password mismatch happens, it is better to respond
   * with an incorrect username/email or password response
   * responding with precise information that the password is wrong
   * is giving out the client the guarantee that there exists an
   * account with the input credentials
   * this may lead to compromise the security of the system
   */
  if (!passwordMatches) {
    return incorrectEmailOrPasswordResponse;
  }

  /**
   * the signIn controller returns an authorization token rather than
   * creating a session as this is rest api
   * this behavior can be changed in the future if required
   */
  let token: string = "";

  try {
    token = jwt.sign(
      { username: existingUser.username, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 },
      process.env.JWT_SECRET as string,
      {
        issuer: "sample-auth-api",
      }
    );
  } catch (errorWhileSigningJWT: any) {
    logger.log(errorWhileSigningJWT?.message);

    return internalServerErrorReturn;
  }

  /**
   * all checks are done, auth token is created
   * the client may be handed over the authorization information
   * for access to the system
   */
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
