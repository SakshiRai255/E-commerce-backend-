import mongoose from "mongoose";
import app from "./app.js";
import config from "./config/index.js";

(async () => {
  try {
    await mongoose.connect(config.MONGODB_URL);
    console.log("Data Base Connected");
    app.on("error", (err) => {
      console.log("ERROR: ", err);
      throw err;
    });

    const onListening = () => {
      console.log(`Listening On ${config.PORT}`);
    };

    app.listen(config.PORT,onListening);
    
  } catch (err) {
    console.log("ERROR", err);
    throw err;
  }
})();
