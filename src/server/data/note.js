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
  file_path: {
    type: String,
    default:''
  }
},{collection: 'swiftnote'});

const Note = mongoose.model('Note', NoteSchema);

export default Note;
