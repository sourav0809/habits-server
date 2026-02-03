/**
 * Seed script: creates 3–4 users with goals, foods, activities, water and food intake.
 * Run: npm run seed (requires DATABASE_URL and other env vars from .env)
 * At the end, logs created user credentials for verification.
 */

import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import moment from "moment-timezone";
import { encryptPassword } from "@/utils/encryption";
import { getStartOfDayAsDate } from "@/utils/date";
import {
  UserModel,
  UserGoalModel,
  UserActivityModel,
  UserFoodModel,
  WaterConsumptionModel,
  FoodConsumptionModel,
} from "@/models";
import { USER_STATUS } from "@/constant";

const DEFAULT_TIMEZONE = "Asia/Kolkata";

const SEED_USERS = [
  { email: "souravtest@gmail.com", name: "Soourav", password: "password" },
  { email: "bob@habits.demo", name: "Bob", password: "bob123" },
  { email: "carol@habits.demo", name: "Carol", password: "carol123" },
  { email: "dave@habits.demo", name: "Dave", password: "dave123" },
];

// Different goals per user: [targetWaterMl, targetCalories]
const SEED_GOALS = [
  [2500, 2200],
  [3000, 2500],
  [2000, 1800],
  [3500, 2800],
];

// Food templates: name, caloriesPerGram, defaultQuantity (grams)
const FOOD_TEMPLATES = [
  { name: "Rice", caloriesPerGram: 1.3, defaultQuantity: 150 },
  { name: "Chicken Breast", caloriesPerGram: 1.65, defaultQuantity: 100 },
  { name: "Egg", caloriesPerGram: 1.55, defaultQuantity: 50 },
  { name: "Oatmeal", caloriesPerGram: 0.68, defaultQuantity: 40 },
  { name: "Banana", caloriesPerGram: 0.89, defaultQuantity: 120 },
  { name: "Apple", caloriesPerGram: 0.52, defaultQuantity: 180 },
  { name: "Bread", caloriesPerGram: 2.65, defaultQuantity: 30 },
  { name: "Milk", caloriesPerGram: 0.42, defaultQuantity: 250 },
];

interface CreatedUserCred {
  email: string;
  password: string;
  name: string;
  userId: string;
}

async function runSeed(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
  if (!dbUrl) {
    throw new Error("DATABASE_URL or MONGODB_URI is required. Add it to .env");
  }

  await mongoose.connect(dbUrl);
  console.log("Connected to MongoDB\n");

  const createdCreds: CreatedUserCred[] = [];
  const daysBack = 21; // ~3 weeks of history

  for (let u = 0; u < SEED_USERS.length; u++) {
    const seedUser = SEED_USERS[u];
    const [targetWaterMl, targetCalories] = SEED_GOALS[u];

    const existing = await UserModel.findOne({
      email: seedUser.email,
      status: USER_STATUS.ACTIVE,
      deletedAt: null,
      isDeleted: false,
    }).exec();
    if (existing) {
      console.log(`User ${seedUser.email} already exists, skipping.`);
      createdCreds.push({
        email: seedUser.email,
        password: seedUser.password,
        name: seedUser.name,
        userId: existing._id.toString(),
      });
      continue;
    }

    const hashedPassword = await encryptPassword(seedUser.password);
    const [user] = await UserModel.create([
      {
        email: seedUser.email,
        name: seedUser.name,
        password: hashedPassword,
        status: USER_STATUS.ACTIVE,
      },
    ]);
    const userId = user._id.toString();
    createdCreds.push({
      email: seedUser.email,
      password: seedUser.password,
      name: seedUser.name,
      userId,
    });

    await UserGoalModel.create({
      userId: user._id,
      targetWaterMl,
      targetCalories,
    });

    const userFoods = await UserFoodModel.insertMany(
      FOOD_TEMPLATES.map((f) => ({
        userId: user._id,
        name: f.name,
        caloriesPerGram: f.caloriesPerGram,
        defaultQuantity: f.defaultQuantity,
      }))
    );

    for (let d = 0; d < daysBack; d++) {
      const date = moment().tz(DEFAULT_TIMEZONE).subtract(d, "days");
      const dayStart = getStartOfDayAsDate(date.toDate());

      let activity = await UserActivityModel.findOne({
        userId: user._id,
        date: dayStart,
        deletedAt: null,
        isDeleted: false,
      }).exec();

      if (!activity) {
        const [created] = await UserActivityModel.create([
          {
            userId: user._id,
            date: dayStart,
            totalCalories: 0,
            totalWaterMl: 0,
          },
        ]);
        activity = created;
      }

      const numWaterEntries = 4 + Math.floor(Math.random() * 4);
      let totalWater = 0;
      for (let w = 0; w < numWaterEntries; w++) {
        const amountMl = [200, 250, 300, 400, 500][Math.floor(Math.random() * 5)];
        const dateAndTime = moment(dayStart)
          .add(7 + w * 2, "hours")
          .add(Math.floor(Math.random() * 60), "minutes")
          .toDate();
        await WaterConsumptionModel.create({
          userId: user._id,
          userActivityId: activity._id,
          amountMl,
          dateAndTime,
        });
        totalWater += amountMl;
      }

      const numFoodEntries = 5 + Math.floor(Math.random() * 4);
      let totalCals = 0;
      for (let f = 0; f < numFoodEntries; f++) {
        const food = userFoods[Math.floor(Math.random() * userFoods.length)];
        const quantity = Math.round(
          food.defaultQuantity * (0.5 + Math.random())
        );
        const totalCalories = Math.round(
          quantity * food.caloriesPerGram
        );
        const dateAndTime = moment(dayStart)
          .add(8 + f * 2, "hours")
          .add(Math.floor(Math.random() * 90), "minutes")
          .toDate();
        await FoodConsumptionModel.create({
          userId: user._id,
          userActivityId: activity._id,
          userFoodId: food._id,
          dateAndTime,
          quantity,
          totalCalories,
        });
        totalCals += totalCalories;
      }

      await UserActivityModel.updateOne(
        { _id: activity._id, deletedAt: null, isDeleted: false },
        { $set: { totalWaterMl: totalWater, totalCalories: totalCals } }
      ).exec();
    }

    console.log(
      `Seeded ${seedUser.email}: goal ${targetWaterMl}ml / ${targetCalories} cal, ${userFoods.length} foods, ${daysBack} days of activity.`
    );
  }

  await mongoose.disconnect();
  console.log("\nMongoDB disconnected.\n");

  console.log("========== SEEDED USER CREDENTIALS (use these to log in) ==========\n");
  createdCreds.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name} (${c.email})`);
    console.log(`   Password: ${c.password}`);
    console.log(`   User ID:  ${c.userId}`);
    console.log("");
  });
  console.log("================================================================\n");
}

runSeed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
