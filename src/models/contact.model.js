import { Schema, model } from "mongoose";

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Nname is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: [true, "avatar is required"],
    },
    avatar_public_id: {
      // FROM CLOUDINARY
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Contact = model("Contact", contactSchema);
