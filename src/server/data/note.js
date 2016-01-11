import mongoose from 'mongoose'

const NoteSchema = new mongoose.Schema({
  timestamp: {
    type: Date
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default:''
  },
  tags: {
    type: [String]
  },
  files: {
    type: [{
      name: String,
      size: Number,
      lastModifiedDate: Date,
      uploadDate: Date,
      file_type: String,
      uid: String
    }]
  }
},{collection: 'swiftnote'});

const Note = mongoose.model('Note', NoteSchema);

export default Note;
