import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  // 'name' will match your 'documentId' from the frontend
  name: { type: String, required: true, unique: true },

  // 'data' stores the Yjs binary state as a Buffer
  data: { type: Buffer, required: true },

  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Document", DocumentSchema);
