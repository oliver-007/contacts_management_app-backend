import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Contact } from "../models/contact.model.js";

// =-=-=-=-=-=-=- CREATE-CONTACT  =-=-=--=-=-=-=-=
const createContact = asyncHandler(async (req, res) => {
  // +++ CONTACT PAYLOAD ++++
  const { name, email, phoneNumber, address } = req.body;
  // console.log("address lineNo:15 =-=: ", address);

  // ++++ REQUIRED FILEDS NOT EMPTY VALIDATION +++++
  if (
    [name, phoneNumber, address].some((field) => {
      return field?.trim() === "";
    })
  ) {
    throw new ApiError(404, "Name, phoneNumber, address are required !");
  }

  // +++++ USER EXISTANCE VALIDATION  +++++
  const contactExist = await Contact.findOne({
    $or: [{ phoneNumber }, { email }],
  });
  // console.log(" contactExist from contact controller lineNo:36", contactExist);

  if (contactExist) {
    throw new ApiError(
      409,
      "Contact with email or phone-number already exists !"
    );
  }

  // console.log("req files--", req.file);

  // +++ AVATAR TEMP STORING ON LOCAL STORAGE USING MULTER +++
  let avatarLocalPath;
  // ++++ AVATAR LOCAL PATH VALIDATION +++++
  if (req.file) {
    avatarLocalPath = req.file.path;
  } else {
    throw new ApiError(400, "Avatar is required !");
  }

  // +++++ AVATAR UPLOAD ON CLOUDINARY ++++
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar upload on Cloudinary failed!");
  }

  // ++++ USER CREATION ON DB ++++
  const contact = await Contact.create({
    name,
    avatar: avatar?.url,
    avatar_public_id: avatar?.public_id,
    email,
    address,
    phoneNumber,
  });

  if (!contact) {
    throw new ApiError(
      500,
      "somethisg went worng while creating the contact !"
    );
  }

  // +++++ RETURN RESPONSE ++++
  return res
    .status(201)
    .json(new ApiResponse(200, contact, "Contact Created Successfully"));
});

// +++++++++++++ DELETE CONTACT ++++++++++++++
const deleteContact = asyncHandler(async (req, res) => {
  const { cId } = req.query;
  // console.log("cId from lineNo : 82 ", cId);

  if (!cId) {
    throw new ApiError(400, "Contact Id is required !");
  }

  if (!isValidObjectId(cId)) {
    throw new ApiError(400, "Invalid contact id !");
  }

  const contactExist = await Contact.findById(cId);

  if (!contactExist) {
    throw new ApiError(400, "Contact not found !");
  }

  const deletedContact = await Contact.findByIdAndDelete(cId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedContact, "Contact Deleted Successfully .")
    );
});

// +++++++++ UPDATE CONTACT DETAILS +++++++++
const updateContactDetails = asyncHandler(async (req, res) => {
  const { cId } = req.query;
  const { name, email, phoneNumber, address } = req.body;

  if (!(name && email && phoneNumber && address)) {
    throw new ApiError(400, "All fields are required ! ");
  }

  if (!isValidObjectId(cId)) {
    throw new ApiError(400, "Invalid Contact Id !!");
  }

  const contactDetailsBeforeUpdate = await Contact.findById(cId);

  const previousContactAvatarPublicId =
    contactDetailsBeforeUpdate?.avatar_public_id;

  if (!previousContactAvatarPublicId) {
    throw new ApiError(400, "Previous Contact Avatar public id not found !!!");
  }

  // ------ UPDATED AVATAR LOCAL FILE PATH ------
  const updatedAvatarLocalPath = req.file?.path;

  //  ---------- UPLOAD ON CLOUDINARY UPDATED AVATAR ----------
  const updatedAvatarCloudinaryResponse =
    updatedAvatarLocalPath &&
    (await uploadOnCloudinary(updatedAvatarLocalPath));

  const updatedAvatarCloudinaryUrl =
    updatedAvatarCloudinaryResponse && updatedAvatarCloudinaryResponse?.url;

  // ----- FULL & FINAL UPDATE -----
  const updatedContact = await Contact.findByIdAndUpdate(
    cId,
    {
      $set: {
        name,
        email,
        phoneNumber,
        address,
        avatar: updatedAvatarCloudinaryUrl || contactDetailsBeforeUpdate.avatar,
      },
    },
    {
      new: true,
    }
  ).select(" -avatar_public_id ");

  // -------- DELETE PREVIOUS AVATAR FROM CLOUDINARY CLOUD --------
  updatedAvatarCloudinaryUrl &&
    (await deleteFromCloudinary(previousContactAvatarPublicId));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedContact,
        "Contact details updated successfully."
      )
    );
});

// +++++++++ GET ALL CONTACTS +++++++++++
const getAllContacts = asyncHandler(async (_, res) => {
  const totalContacts = await Contact.countDocuments();

  const allContacts = await Contact.find();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { allContacts, totalContacts },
        "All Contacts Fetched Successfully."
      )
    );
});

// +++++++++++ FAVORITE CONTACT TOGGLE ++++++++++++++
const favoriteToggle = asyncHandler(async (req, res) => {
  const { cId } = req.query;

  if (!cId) {
    throw new ApiError(400, "Contact Id is required !!!");
  }

  if (!isValidObjectId(cId)) {
    throw new ApiError(400, "Invalid Contact Id !!!");
  }

  const contactExist = await Contact.findById(cId);

  if (!contactExist) {
    return res.status(400).json(new ApiError(400, "Contact not found !!"));
  }

  const favoriteState = contactExist.isFavorite;

  const updatedContact = await Contact.findByIdAndUpdate(
    cId,
    {
      $set: {
        isFavorite: !favoriteState,
      },
    },
    { new: true }
  );

  const isFavoriteState = {
    isFavorite: updatedContact.isFavorite,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        isFavoriteState,
        isFavoriteState.isFavorite
          ? "Marked as Favorite successfully."
          : "Removed from Favorite contact list successfully."
      )
    );
});

export {
  getAllContacts,
  createContact,
  deleteContact,
  updateContactDetails,
  favoriteToggle,
};
