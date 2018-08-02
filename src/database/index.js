import mongoose from 'mongoose'

mongoose.connect('mongodb://localhost:27017/nodeapi', { useNewUrlParser:true })
mongoose.Promise = global.Promise

export default mongoose