import "dotenv/config";
import dbConnect from "./db/index.js";
import { app } from "./app.js";

// ++++++++ DATABASE CONNECTION ++++++++++++
dbConnect()
  .then(() => {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`🌍  Server is running at port : ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed ! ! ! ", error);
  });
