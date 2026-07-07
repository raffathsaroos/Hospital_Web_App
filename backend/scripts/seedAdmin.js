import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/user.model.js";

const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/hospital_db";

const required = [
  "ADMIN_FIRST_NAME",
  "ADMIN_LAST_NAME",
  "ADMIN_EMAIL",
  "ADMIN_PHONE",
  "ADMIN_NIC",
  "ADMIN_DOB",
  "ADMIN_GENDER",
  "ADMIN_PASSWORD",
];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing environment values: ${missing.join(", ")}`);
  process.exit(1);
}

await mongoose.connect(LOCAL_MONGO_URI);
try {
  const adminData = {
    firstName: process.env.ADMIN_FIRST_NAME,
    lastName: process.env.ADMIN_LAST_NAME,
    email: process.env.ADMIN_EMAIL,
    phone: process.env.ADMIN_PHONE,
    nic: process.env.ADMIN_NIC,
    dob: process.env.ADMIN_DOB,
    gender: process.env.ADMIN_GENDER,
    role: "Admin",
    isActive: true,
  };
  const existing = await User.findOne({
    email: process.env.ADMIN_EMAIL.toLowerCase().trim(),
  }).select("+password");

  if (existing) {
    Object.assign(existing, adminData, {
      password: process.env.ADMIN_PASSWORD,
    });
    await existing.save();
    console.log("Admin account synchronized and password reset.");
  } else {
    await User.create({
      ...adminData,
      password: process.env.ADMIN_PASSWORD,
    });
    console.log("Initial admin account created.");
  }
} finally {
  await mongoose.disconnect();
}
