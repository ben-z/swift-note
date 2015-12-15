require("babel-polyfill"); // Needed for Regenerator Runtime
'use strict';

import {
  expect
}
from 'chai';
import request from 'co-supertest';
import mongoose from 'mongoose';
import server from '../../src/server/app';

var Note = mongoose.model('Note');

describe('graphql', ()=>{
  describe('query', ()=>{
    it('should return with note by id', function*() {
      const note = new Note({
        title: 'Note 1'
      });

      let findByIdStub = this.sandbox.stub(Note, 'findById').returnsWithResolve(note);

      var resp = yield request(server.listen())
        .get('/graphql')
        .query({
          query: `
          {
            note(id: "${note._id}") {
              title
            }
          }
          `,
          params: {
            id: note._id.toString()
          }
        })
        .expect(200)
        .end();

      expect(findByIdStub).to.calledWithMatch(note._id.toString(), {
        title: 1
      });

      expect(resp.body).to.be.eql({
        data: {
          note: {
            title: 'Note 1'
          }
        }
      });
    })
  })
})
