import mongoose from 'mongoose'

const NoteSchema = new mongoose.Schema({
  timestamp: {
    type: Date
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  tags: {
    type: [String]
  },
  file_path: {
    type: String
  }
},{collection: 'swiftnote'});

const Note = mongoose.model('Note', NoteSchema);

export default Note;
