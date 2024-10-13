import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(express.static("public"));

// ROUTES IMPORT
import contactRouter from "./routes/contact.routes.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { ApiResponse } from "./utils/ApiResponse.js";

//++++++++++++ ROUTES DECLARATION +++++++++++++
// ++++++ WELCOME ROUTE +++++++
app.get(
  "/",
  asyncHandler(async (req, res) => {
    return res
      .status(200)
      .json(
        new ApiResponse(200, {}, " Welcome to Contact_management_backend 💝 ")
      );
  })
);

// +++++ USER ROUTE ++++++++
app.use("/api/v1/contacts", contactRouter);

export { app };
