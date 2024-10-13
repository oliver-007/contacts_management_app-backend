import { Router } from "express";
import {
  createContact,
  updateContactDetails,
  updateContactAvatar,
  getAllContacts,
  deleteContact,
} from "../controllers/contact.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// +++ CREATE-CONTACT ROUTE ++++
router.route("/create-contact").post(
  // ++++ MULTER MIDDLEWARE INJECTION ++++
  upload.single("avatar"),

  //   ++++ CONTROLLER ++++
  createContact
);

// ++++++++ UPDATE USER DETAILS ROUTE ++++++++
router.route("/update-contact").patch(
  // MULTER MIDDLEWARE INJECTION
  upload.single("avatar"),
  updateContactDetails
);

// +++++++++++ DELETE CONTACT ++++++++++++
router.route("/delete-contact").delete(deleteContact);

// +++++++++ GET ALL CONTACTS +++++++++++
router.route("/").get(getAllContacts);

export default router;
