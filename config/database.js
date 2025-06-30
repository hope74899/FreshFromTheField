const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config();

const connection = async () => {
    try {
        const connect = await mongoose.connect(process.env.URL)
        if (connect) console.log('connection succesfull');
        return connect;
    } catch (error) {
        console.log('error while connecting')
        console.log(error)
        throw error;

    }
}
module.exports = connection