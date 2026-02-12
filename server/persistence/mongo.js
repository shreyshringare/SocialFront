import mongoose from "mongoose";

const connectMongo = async () => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    console.error("URI not defined.");
    process.exit(1);
  }

  try {
    const connection = await mongoose.connect(MONGO_URI); // Store the connection
    console.log("MongoDB is connected.");

    // ADD THIS LINE: Return the underlying MongoDB driver connection
    return connection.connection;
  } catch (err) {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  }
};

export default connectMongo;
