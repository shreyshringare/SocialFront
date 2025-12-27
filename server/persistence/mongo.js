import mongoose from 'mongoose';

const connectMongo = async () =>{
const {MONGO_URI} = process.env;

if(!MONGO_URI){
    console.error('URI not defined.');
    process.exit(1);
}

try{
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB is connected.');
}catch(err){
    console.error('MongoDB connection failed',err);
    process.exit(1);
}
};

export default connectMongo;