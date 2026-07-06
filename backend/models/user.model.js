import mongoose from "mongoose";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { USER_ROLES } from "../constants/roles.const.js";

const scrypt = promisify(crypto.scrypt);

// Common account and profile fields shared by every user role.
// Stores personal details shared by every hospital role.
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"],
    },
    nic: {
      type: String,
      required: [true, "NIC is required"],
      unique: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be Male, Female, or Other",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: USER_ROLES,
        message: "Invalid role",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/your-cloud/image/upload/v1/default-avatar.png",
      },
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Speeds up lists that group accounts by hospital role.
UserSchema.index({ role: 1 });

// Hashes new and changed passwords without adding an external dependency.
UserSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scrypt(this.password, salt, 64);
  this.password = `scrypt:${salt}:${Buffer.from(hash).toString("hex")}`;
  this.passwordChangedAt = new Date();
});

UserSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password?.startsWith("scrypt:")) {
    return this.password === candidate;
  }
  const [, salt, storedHash] = this.password.split(":");
  const candidateHash = await scrypt(candidate, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");
  const candidateBuffer = Buffer.from(candidateHash);
  return (
    storedBuffer.length === candidateBuffer.length &&
    crypto.timingSafeEqual(storedBuffer, candidateBuffer)
  );
};

// Registers the shared account schema with Mongoose.
const User = mongoose.model("User", UserSchema);

export default User;
