import React from 'react'
import ReactDOM from 'react-dom'
import request from 'superagent'
import moment from 'moment'
import Theme from './theme'

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

// filter function for Objects, similar to Array.prototype.filter
Object.filter = function(obj, predicate) {
    let result = {}, key;

    for (key in obj) {
        if (obj.hasOwnProperty(key) && predicate(obj[key])) {
            result[key] = obj[key];
        }
    }

    return result;
}

// Merges js stylesheets
function m(){
  let res = {}
  for (let i = 0; i < arguments.length; ++i){
    if (arguments[i]) {
      Object.assign(res,Object.filter(arguments[i],val=>{return (typeof val !== 'object')}))
    }
  }
  return res;
}

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
      <div style={m(Theme.body)}>
        <div style={m(Theme.wrapper)}>
          {this._renderList(this.state.notes)}
        </div>
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
      <Panel data-id={this.props.id}>
        <span style={m(Theme.panel.title)}>{this.props.title}</span>
        <span style={m(Theme.panel.date)}>{d_fromnow}</span>
        <div style={m(Theme.panel.icons)}>
          <Icon style={m(Theme.panel.icons.icon)} type="pencil" />
          <Icon style={m(Theme.panel.icons.icon)} type="times" />
        </div>
      </Panel>
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

class Panel extends React.Component{
  render(){
    return(
      <div style={m(Theme.panel)} {...this.props}>{this.props.children}</div>
    )
  }
}

class Icon extends React.Component{
  render(){
    return(
      <i className={`fa fa-${this.props.type} ${this.props.extra}`} {...this.props} />
    )
  }
}

Icon.propTypes = {
  type: React.PropTypes.string.isRequired,
  extra: React.PropTypes.string
}

if (typeof document !== 'undefined') {
  let props = JSON.parse(document.getElementById('props').innerHTML);
  ReactDOM.render(<App {...props}/>, document.getElementById('app'));
}

export default App
