import { db, redis } from '@/config/database';
import { AuthUtils } from '@/utils/auth.utils';
import { APIError } from '@/utils/APIError';
import type { UserWithoutPassword, UserRegistrationInput, UserLoginInput, UserProfileUpdateInput, UserPasswordChangeInput, AuthTokens, LoginResponse } from '@/types/auth.types';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export class AuthService {
  static async register(userData: UserRegistrationInput): Promise<UserWithoutPassword> {
    const { name, email, password } = userData;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (existingUser) {
      throw new APIError(409, 'User with this email already exists');
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password);

    // Create user
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    }).returning();

    return newUser;
  }

  static async login(credentials: UserLoginInput): Promise<LoginResponse> {
    const { email, password } = credentials;

    // Find user
    const foundUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!foundUser) {
      throw new APIError(401, 'Invalid credentials');
    }

    if (foundUser.status !== 'ACTIVE') {
      throw new APIError(401, 'Account is not active');
    }

    // Verify password
    const isPasswordValid = await AuthUtils.comparePassword(password, foundUser.password);
    if (!isPasswordValid) {
      throw new APIError(401, 'Invalid credentials');
    }

    // Update last login
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, foundUser.id));

    // Generate tokens
    const accessToken = AuthUtils.generateToken({
      userId: foundUser.id,
      email: foundUser.email,
      role: foundUser.role
    });

    const refreshToken = AuthUtils.generateRefreshToken({
      userId: foundUser.id
    });

    return {
      user: (({ password, ...rest }) => rest)(foundUser),
      accessToken,
      refreshToken
    };
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = AuthUtils.verifyToken(refreshToken) as any;

      const foundUser = await db.query.users.findFirst({
        where: eq(users.id, decoded.userId)
      });

      if (!foundUser || foundUser.status !== 'ACTIVE') {
        throw new APIError(401, 'Invalid refresh token');
      }

      const newAccessToken = AuthUtils.generateToken({
        userId: foundUser.id,
        email: foundUser.email,
        role: foundUser.role
      });

      const newRefreshToken = AuthUtils.generateRefreshToken({
        userId: foundUser.id
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new APIError(401, 'Invalid refresh token');
    }
  }

  static async logout(token: string): Promise<void> {
    // Add token to blacklist with expiration
    const decoded = AuthUtils.verifyToken(token) as any;
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

    await redis.setValue(`blacklist:${token}`, 'true', expiresIn);
  }

  static async getProfile(userId: string): Promise<UserWithoutPassword> {
    const foundUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!foundUser) {
      throw new APIError(404, 'User not found');
    }

    return (({ password, ...rest }) => rest)(foundUser);
  }

  static async updateProfile(userId: string, updateData: UserProfileUpdateInput): Promise<UserWithoutPassword> {
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new APIError(404, 'User not found');
    }

    return (({ password, ...rest }) => rest)(updatedUser);
  }

  static async changePassword(userId: string, passwords: UserPasswordChangeInput): Promise<void> {
    const { currentPassword, newPassword } = passwords;

    const foundUser = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!foundUser) {
      throw new APIError(404, 'User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await AuthUtils.comparePassword(currentPassword, foundUser.password);
    if (!isCurrentPasswordValid) {
      throw new APIError(400, 'Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await AuthUtils.hashPassword(newPassword);

    // Update password
    await db.update(users).set({ password: hashedNewPassword }).where(eq(users.id, userId));
  }
}
