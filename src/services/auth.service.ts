import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import prisma from "../config/db";
import { config } from "../config/env";
import { AppError } from "../utils/AppError";

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

const loginUserSelect = {
  ...publicUserSelect,
  password: true,
} satisfies Prisma.UserSelect;

export type IUserResponse = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

type IRegisterInput = {
  email: string;
  password: string;
  name: string;
};

type ILoginInput = {
  email: string;
  password: string;
};

export class AuthService {
  static async register(userData: IRegisterInput): Promise<IUserResponse> {
    const { email, password, name } = userData;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new AppError("User already exists with this email", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: publicUserSelect,
    });

    return user;
  }

  static async login(
    credentials: ILoginInput,
  ): Promise<{ token: string; user: IUserResponse }> {
    const { email, password } = credentials;

    const user = await prisma.user.findUnique({
      where: { email },
      select: loginUserSelect,
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token: string = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
    });

    const { password: _password, ...publicUser } = user;

    return {
      token,
      user: publicUser,
    };
  }
}
