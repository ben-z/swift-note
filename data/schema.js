import {
  graphql,
  GraphQLSchema,
  GraphQLID,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull
} from 'graphql';

import Note from './note'

/**
 * generate projection object for mongoose
 * @param  {Object} fieldASTs
 * @return {Project}
 */
function getProjection (fieldASTs) {
  return fieldASTs.selectionSet.selections.reduce((projections, selection) => {
    projections[selection.name.value] = 1;

    return projections;
  }, {});
}

const NoteType = new GraphQLObjectType({
  name: 'Note',
  fields:()=> ({
    id: {
      type: new GraphQLNonNull(GraphQLString)
    },
    timestamp: {
      type: GraphQLString
    },
    title: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    },
    tags: {
      type: new GraphQLList(GraphQLString)
    },
    file_path: {
      type: GraphQLString
    }
  })
})

const NoteQuery = new GraphQLObjectType({
  name: 'NoteQuery',
  fields: {
    // Query a single note
    note: {
      type: NoteType,
      args: {
        id: {
          type: GraphQLString
        },
        title: {
          type: GraphQLString
        },
        file_path: {
          type: GraphQLString
        }
      },
      resolve(parent, {id, title, file_path}, {fieldASTs}) {
        // Obtain only needed fields from mongoose
        var projections = getProjection(fieldASTs[0]);

        if(id) return Note.findById(id, projections)
        else if(title) return Note.findOne({title:title},projections)
        else if(file_path) return Note.findOne({file_path:file_path},projections)
        else return Note.findOne({},projections)

      }
    },
    // Query a list of notes satsfying some conditions outlined in args
    notes: {
      type: new GraphQLList(NoteType),
      args: {
        ids: {
          type: new GraphQLList(GraphQLString)
        },
        tags: {
          type: new GraphQLList(GraphQLString)
        }
      },
      resolve(parent, {ids, tags}, {fieldASTs}) {
        var projections = getProjection(fieldASTs[0]);

        if(ids) return Note.find({'_id':{$in:ids}}, projections)
        else if(tags) return Note.find({'tags':{$in:tags}}, projections)
        else return Note.find({}, projections)
      }
    }
  }
})


export var Schema = new GraphQLSchema({
  query: NoteQuery
});
