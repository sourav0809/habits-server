import ApiError from "@/utils/apiError";
import { UserModel } from "@/models";
import type { CreateUserInput, IUser, UpdateUserInput } from "@/models";
import { USER_STATUS } from "@/constant";

/**
 * User Service
 * Handles all CRUD operations for User with MongoDB/Mongoose.
 */
class UserService {
  /**
   * Create a new user.
   */
  async create(data: CreateUserInput): Promise<{
    id: string;
    email: string;
    name: string;
  }> {
    try {
      const user = await UserModel.create({
        ...data,
        status: USER_STATUS.ACTIVE,
      });
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      };
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (err.code === 11000) {
        throw new ApiError(409, "Email already exists");
      }
      throw new ApiError(
        500,
        `Failed to create user: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Delete a user by id (hard delete).
   */
  async delete(id: string): Promise<void> {
    const result = await UserModel.deleteOne({
      _id: id,
      status: USER_STATUS.ACTIVE,
      deletedAt: null,
    });
    if (result.deletedCount === 0) {
      throw new ApiError(404, "User not found");
    }
  }

  /**
   * Find users with pagination and optional filter.
   */
  async find(
    filter: Record<string, unknown> = {},
    page: number = 0,
    size: number = 10
  ): Promise<{
    data: Array<{ id: string; email: string; name: string }>;
    pagination: { hasMore: boolean; page: number; size: number; total: number };
  }> {
    const safePage = Number.isFinite(page) && page >= 0 ? page : 0;
    const safeSize = Number.isFinite(size) && size >= 1 ? size : 10;
    const skip = safePage * safeSize;

    const baseFilter = {
      ...filter,
      status: USER_STATUS.ACTIVE,
      deletedAt: null,
    };

    const [users, total] = await Promise.all([
      UserModel.find(baseFilter)
        .select("email name ")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeSize)
        .lean()
        .exec(),
      UserModel.countDocuments(baseFilter).exec(),
    ]);

    return {
      data: users,
      pagination: {
        hasMore: skip + safeSize < total,
        page: safePage,
        size: safeSize,
        total,
      },
    };
  }

  /**
   * Find a single user by id or email (unique). Throws if not found.
   * Includes password for auth (e.g. login).
   */
  async findOne(where: { id?: string; email?: string }): Promise<IUser> {
    const filter: Record<string, unknown> = {
      status: USER_STATUS.ACTIVE,
      deletedAt: null,
    };
    if (where.id) filter._id = where.id;
    if (where.email) filter.email = where.email;

    const user = await UserModel.findOne(filter).select("+password").exec();
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  /**
   * Find a single user by any condition (e.g. { email } or { $or: [{ email }, { phoneNumber }] }).
   * Returns null if not found.
   */
  async findOneByCondition(condition: Record<string, unknown>): Promise<IUser | null> {
    const filter: Record<string, unknown> = {
      ...condition,
      status: USER_STATUS.ACTIVE,
      deletedAt: null,
    };
    const user = await UserModel.findOne(filter).select("+password").exec();
    return user ?? null;
  }

  /**
   * Update an existing user by id.
   */
  async update(
    id: string,
    data: UpdateUserInput
  ): Promise<{ id: string; email: string; name: string }> {
    try {
      const user = await UserModel.findOneAndUpdate(
        { _id: id, status: USER_STATUS.ACTIVE, deletedAt: null },
        { $set: data },
        { new: true, runValidators: true }
      )
        .select("email name ")
        .exec();

      if (!user) {
        throw new ApiError(404, "User not found");
      }
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      };
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      const err = error as { code?: number };
      if (err.code === 11000) {
        throw new ApiError(409, "Email already exists");
      }
      throw new ApiError(
        500,
        `Failed to update user: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

export default new UserService();
