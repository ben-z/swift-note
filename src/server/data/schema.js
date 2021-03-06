import {
  graphql,
  GraphQLSchema,
  GraphQLID,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInt
} from 'graphql';

import Note from './note'

/**
 * generate projection object for mongoose
 * @param  {Object} fieldASTs
 * @return {Project}
 */
export function getProjection (fieldASTs) {
  return fieldASTs.selectionSet.selections.reduce((projections, selection) => {
    projections[selection.name.value] = 1;

    return projections;
  }, {});
}

const FileOutputType = new GraphQLObjectType({
  name: 'FileOut',
  fields: {
    name: {
      type: GraphQLString
    },
    size:{
      type: GraphQLInt
    },
    lastModifiedDate:{
      type: GraphQLString
    },
    uploadDate:{
      type: GraphQLString
    },
    file_type: {
      type: GraphQLString
    },
    uid: {
      type: GraphQLString
    }
  }
})

const FileInputType = new GraphQLInputObjectType({
  name: 'FileIn',
  fields: {
    name: {
      type: GraphQLString
    },
    size:{
      type: GraphQLInt
    },
    lastModifiedDate:{
      type: GraphQLString
    },
    uploadDate:{
      type: GraphQLString
    },
    file_type: {
      type: GraphQLString
    },
    uid: {
      type: GraphQLString
    }
  }
})

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
    files: {
      type: new GraphQLList(FileOutputType)
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
        }
      },
      resolve(parent, {id, title}, {fieldASTs}) {
        // Obtain only needed fields from mongoose
        var projections = getProjection(fieldASTs[0]);

        if(id) return Note.findById(id, projections)
        else if(title) return Note.findOne({title:title},projections)
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
        },
        sort_field: {
          type: GraphQLString
        },
        sort_direction: {
          type: new GraphQLEnumType({
            name: 'SortDirection',
            values: {
              'ASC': {value: 1},
              'DES': {value: -1}
            }
          })
        }
      },
      resolve(parent, {ids, tags,sort_field='_id',sort_direction=1}, {fieldASTs}) {
        var projections = getProjection(fieldASTs[0]);

        let sortObj = {};
        sortObj[sort_field] = sort_direction;

        if(ids) return Note.find({'_id':{$in:ids}}, projections).sort(sortObj)
        else if(tags) return Note.find({'tags':{$in:tags}}, projections).sort(sortObj)
        else return Note.find({}, projections).sort(sortObj)
      }
    }
  }
})

const NoteMutation = new GraphQLObjectType({
  name: 'NoteMutation',
  fields: {
    // @return: The created Note
    createNote: {
      type: NoteType,
      args: {
        title: {
          type: GraphQLString
        },
        description: {
          type: GraphQLString
        },
        tags: {
          type: new GraphQLList(GraphQLString)
        },
        files: {
          type: new GraphQLList(FileInputType)
        }
      },
      resolve(parent, noteobj) {
        noteobj.timestamp = Date();
        console.log(noteobj);
        let note = new Note(noteobj)

        return note.save()
      }
    },
    // @return: The updated Note
    updateNote: {
      type: NoteType,
      args: {
        id: {
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
        files: {
          type: new GraphQLList(FileInputType)
        }
      },
      resolve(parent,{id, title, description, tags, files},{fieldASTs}){
        id = id || (new Note()).id;
        var projections = getProjection(fieldASTs[0]);
        let updateObj = {}
        if(typeof title !== 'undefined') updateObj.title = title;
        if(typeof description !== 'undefined') updateObj.description = description;
        if(typeof tags !== 'undefined') updateObj.tags = tags;
        if(typeof files !== 'undefined') updateObj.files = files;
        if(0 !== Object.keys(updateObj).length) updateObj.timestamp = Date();

        return Note.findByIdAndUpdate(id,updateObj,
          {new:true,upsert:true,select:projections});
      }
    },
    // @return: The removed Note
    removeNote: {
      type: NoteType,
      args: {
        id: {
          type: GraphQLString
        }
      },
      resolve(parent, {id}) {
        return Note.findByIdAndRemove(id)
      }
    }
  }
})


export var Schema = new GraphQLSchema({
  query: NoteQuery,
  mutation: NoteMutation
});
