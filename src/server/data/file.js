import mongoose from 'mongoose'

const FileSchema = new mongoose.Schema({
  name: {
    type: String
  },
  content: {
    type: String
  }
},{collection: 'swiftnote_files'});

const File = mongoose.model('File', FileSchema);

export default File;
