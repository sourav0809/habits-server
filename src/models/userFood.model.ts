import mongoose, { Document, Schema } from "mongoose";

/**
 * UserFood document (food item defined by user).
 * Collection: user_foods. Ref: user_foods.userId > users._id
 */
export interface IUserFood extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  caloriesPerGram: number;
  defaultQuantity: number;
  deletedAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new user food (service layer).
 */
export interface CreateUserFoodInput {
  name: string;
  caloriesPerGram: number;
  defaultQuantity: number;
}

/**
 * Input for updating a user food (service layer). All fields optional.
 */
export interface UpdateUserFoodInput {
  name?: string;
  caloriesPerGram?: number;
  defaultQuantity?: number;
}

const userFoodSchema = new Schema<IUserFood>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    caloriesPerGram: {
      type: Number,
      required: true,
      min: 0,
    },
    defaultQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "user_foods",
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

userFoodSchema.index({ userId: 1, deletedAt: 1, isDeleted: 1 });

const UserFoodModel = mongoose.model<IUserFood>("UserFood", userFoodSchema);

export default UserFoodModel;
