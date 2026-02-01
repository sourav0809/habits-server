const ERROR_MESSAGES = {
  AUTH: {
    UNAUTHORIZED: "You are not authorized to access this resource",
    INVALID_CREDENTIALS: "Invalid credentials",
    USER_NOT_FOUND: "User not found",
    USER_ALREADY_EXISTS: "User already exists",
  },
  FOOD: {
    CREATE_FAILED: "Failed to add food",
    NOT_FOUND: "Food not found",
    UPDATE_FAILED: "Failed to update food",
    DELETE_FAILED: "Failed to delete food",
    USED_IN_MEALS: "Cannot delete food that is already used in meals",
  },
  FOOD_CONSUMPTION: {
    NOT_FOUND: "Food consumption not found",
    CREATE_FAILED: "Failed to add food consumption",
    DELETE_FAILED: "Failed to delete food consumption",
  },
};

export default ERROR_MESSAGES;