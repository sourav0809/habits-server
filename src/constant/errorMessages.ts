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
  WATER_CONSUMPTION: {
    NOT_FOUND: "Water consumption not found",
    CREATE_FAILED: "Failed to add water intake",
    DELETE_FAILED: "Failed to delete water intake",
  },
  USER_GOAL: {
    NOT_FOUND: "User goal not found",
    ALREADY_EXISTS: "Goal already exists for this user; use PATCH to update",
    CREATE_FAILED: "Failed to create goal",
    UPDATE_FAILED: "Failed to update goal",
  },
  USER_ACTIVITY: {
    GET_USER_ACTIVITY_ERROR: "Failed to get user activity",
  },
};

export default ERROR_MESSAGES;