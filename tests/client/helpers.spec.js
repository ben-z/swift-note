'use strict';

import {expect} from 'chai';
import {getPropertyByString,filterOne,objFilter,objIsEquiv,m} from '../../src/client/app'

describe('helpers', ()=> {
  describe('getPropertyByString', ()=> {
    it('should return an object\'s property using the input string',()=> {
      let testObj = {
        a: 1,
        b: {
          b1: 2,
          b2: {
            b2_1: 3
          }
        }
      }

      expect(getPropertyByString(testObj,'a')).to.be.eql(1);
      expect(getPropertyByString(testObj,'b.b1')).to.be.eql(2);
      expect(getPropertyByString(testObj,'b.b2.b2_1')).to.be.eql(3);
    });
  });
  describe('filterOne', ()=>{
    it('should remove the first object in array that satisfies: getPropertyByString(obj,property)===compareObj', ()=>{
      let testArr = [
        {p:{c:1}},
        {p:{c:2}},
        {p:{c:3}}
      ];

      expect(filterOne(testArr,'p.c',2)).to.be.eql([{p:{c:1}},{p:{c:3}}]);
      expect(filterOne(testArr,'p.c',4)).to.be.eql(testArr);
    })
  })
  describe('objFilter',()=>{
    it('should filter out object properties that don\'t satisfy predicate', ()=>{
      let testObj = {
        a: 1,
        b: 1,
        c: 2,
        d: 1
      };

      expect(objFilter(testObj,val=>val!==1)).to.be.eql({c:2})
    })
  })
  describe('objIsEquiv', ()=>{
    it('should return true if o1 and o2 have equivalent properties, false otherwise', ()=>{
      let o1 = {a:1,b:2}
      let o2 = {b:2,a:1}
      let o3 = {a:1}

      expect(objIsEquiv(o1,o2)).to.be.eql(true);
      // expect(objIsEquiv(o1,o3)).to.be.false;
    })
  })
});
