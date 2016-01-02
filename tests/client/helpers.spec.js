'use strict';

import {expect} from 'chai';
import {getPropertyByString,filterOne,objFilter,objIsEquiv,m as mergeStylesheets,clone,mapAllPrimitive} from '../../src/client/app'

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
      let o4 = {a:1,b:2,c:[1,2]} // with arrays
      let o4_copy = {a:1,b:2,c:[1,2]}
      let o5 = {a:1,b:2,c:{d:3,e:4,f:{g:5,h:6}}} // nested
      let o5_copy = {a:1,b:2,c:{d:3,e:4,f:{g:5,h:6}}}
      let o6 = {a: ""}
      let o6_2 = {a: "123"}

      expect(objIsEquiv(o1,o2)).to.be.true;
      expect(objIsEquiv(o1,o3)).to.be.false;
      expect(objIsEquiv(o4,o4_copy)).to.be.true;
      expect(objIsEquiv(o5,o5_copy)).to.be.true;
      expect(objIsEquiv('string','string')).to.be.true;
      expect(objIsEquiv(o5,o4)).to.be.false;
      expect(objIsEquiv(o5,'string')).to.be.false;
      expect(objIsEquiv(o6,o6_2)).to.be.false;
    })
  })
  describe('mergeStylesheets',()=>{
    it('should return the union of two object\'s properties excluding nested Objects',()=>{
      let o1 = {
        color: '#fff',
        textAlign: 'center',
        something: {a:1}
      }
      let o2 = {
        verticalAlign: 'top',
        fontSize: '1.5em',
        textAlign: 'left',
        somethingelse: {b:2}
      }
      let res = {
        color: '#fff',
        verticalAlign: 'top',
        fontSize: '1.5em',
        textAlign: 'left'
      }

      expect(mergeStylesheets(o1,o2)).to.be.eql(res)
    })
  })
  describe('clone',()=>{
    it('should return an object with the exact the same properties as the original',()=>{
      let o = {a:1,b:2}

      expect(clone(o)).to.be.eql(o)
    })
  })
  describe('mapAllPrimitive',()=>{
    it('should apply func to all primitive values in obj',()=>{
      let o = {a:1,b:2}

      expect(mapAllPrimitive(o,val=>++val)).to.be.eql({a:2,b:3})
    })
    it('should apply func to all primitive values in an array',()=>{
      let o = [1,2,3,4]

      expect(mapAllPrimitive(o,val=>++val)).to.be.eql([2,3,4,5])
    })
    it('should apply func to all primitive values in a nested object',()=>{
      let o = {a:1,b:[1,2],c:{d:5}}

      expect(mapAllPrimitive(o,val=>++val)).to.be.eql({a:2,b:[2,3],c:{d:6}})
    })
    it('should be able to handle custom filters',()=>{
      let o = {a:1,b:[1,2],c:{d:'something'}}

      expect(mapAllPrimitive(o,val=>val,o=>typeof o !== 'number')).to.be.eql(o)
      expect(mapAllPrimitive(o,v=>v.concat(' edited'),o=>typeof o === 'string')).to.be.eql({a:1,b:[1,2],c:{d:'something edited'}})
    })
  })
});
