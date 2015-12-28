import React from 'react'
import ReactDOM from 'react-dom'
import request from 'superagent'
import moment from 'moment'

function byString(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}
// removes the first object in array that satisfies:
//   byString(obj,property)===compareObj
function filterOne(array,property,compareObj,i=0){
  if (array.length < i+1) {
    return array;
  }else if (byString(array[i],property)===compareObj) {
    array.splice(i,1);
    return array;
  }else{
    return filterOne(array,property,compareObj,i+1);
  }
}
// Test:
// console.log(filterOne([
//     {p:{c:1}},
//     {p:{c:2}},
//     {p:{c:3}}
// ],'p.c',2));
// => [{p:{c:1}},{p:{c:3}}]

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      notes: props.notes
    }
    this._updateList = this._updateList.bind(this);
  }
  static fetchList(url='http://localhost:8000/graphql',callback){
    const sort_field = 'timestamp';
    const sort_direction = 'DES';
    const q = {query:`{
      notes(sort_field:"${sort_field}",sort_direction:${sort_direction}){
        id
        timestamp
        title
      }
    }`};
    request.get(url)
      .query(q)
      .end((err,res)=>{
        callback(res.body.data)
      })
  }
  _updateList(){
    this.constructor.fetchList(void 0,(data)=>{
      this.setState({
        notes: data.notes
      })
    })
  }
  _renderList(arr){
    return arr.map((item)=>{
      return <NoteItem key={item.id} {...item} />
    })
  }
  render(){
    return (
      <div>
        {this._renderList(this.state.notes)}
      </div>
    )
  }
}

class NoteItem extends React.Component{
  render(){
    const d = moment(new Date(this.props.timestamp).toISOString());
    const d_fromnow = d.fromNow();
    const d_exact = d.format('LLLL');

    return (
      <div data-id={this.props.id}>
        {this.props.title}&nbsp;
        {d_fromnow}
      </div>
    )
  }
}

NoteItem.propTypes = {
  id: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  timestamp: React.PropTypes.string.isRequired
}
NoteItem.defaultProps = {
  title:''
}

if (typeof document !== 'undefined') {
  let props = JSON.parse(document.getElementById('props').innerHTML);
  ReactDOM.render(<App {...props}/>, document.getElementById('app'));
}

export default App
