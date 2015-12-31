import React from 'react'
import ReactDOM from 'react-dom'
import request from 'superagent'
import moment from 'moment'
import Theme from './theme'
import WindowManager from './util/window-manager'

const API_URL = 'http://localhost:8000/graphql';

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
      notes: props.notes,
      modal: false
    }
    this._updateList = this._updateList.bind(this);
    this._openModal = this._openModal.bind(this);
    this._closeHandler = this._closeHandler.bind(this);
    this._removeNote = this._removeNote.bind(this);
  }
  static fetchList(callback){
    const sort_field = 'timestamp';
    const sort_direction = 'DES';
    const q = {query:`{
      notes(sort_field:"${sort_field}",sort_direction:${sort_direction}){
        id
        timestamp
        title
      }
    }`};
    request.get(API_URL)
      .query(q)
      .end((err,res)=>{
        if(err) throw err;
        callback(res.body.data)
      })
  }
  _updateList(){
    this.constructor.fetchList((data)=>{
      this.setState({
        notes: data.notes
      })
    })
  }
  _renderList(arr,_openModal){
    return arr.map((item)=>{
      return <NoteItem key={item.id} {...item} _openModal={_openModal} _removeNote={this._removeNote}/>
    })
  }
  _openModal(id,forEditing,e){
    e.stopPropagation();
    // console.log('id',id);
    // console.log('forEditing',forEditing);
    // console.log('event',e);
    this.setState({
      modal: {
        id: id,
        forEditing: forEditing
      }
    })
    this._fetchNote(id,(note)=>{
      note.forEditing = forEditing;
      this.setState({
        modal: note
      })
    })
  }
  _fetchNote(id,callback){
    const q = {query:`{
      note(id:"${id}"){
        id
        timestamp
        title
        description
        tags
        file_path
      }
    }`};
    request.get(API_URL)
      .query(q)
      .end((err,res)=>{
        if(err) throw err;
        callback(res.body.data.note)
      })
  }
  _closeHandler(){
    this.setState({
      modal: false
    })
  }
  _removeNote(id,e){
    e.stopPropagation();
    const q = {query: `mutation{
      removeNote(id:"${id}"){
        id
      }
    }`};
    request.post(API_URL)
      .query(q)
      .end((err,res)=>{
        if (err) throw (err);
        else{
          if(!res.body.data.removeNote.id) console.log('note does not exist');
          let notes_removed = filterOne(this.state.notes,'id',id);
          console.log(notes_removed);
          this.setState({
            notes: notes_removed
          })
        }
      })
  }
  componentDidUpdate(){
    // window.manager = WindowManager;
    // if(this.state.modal){
    //   WindowManager.disableScroll();
    // }else{
    //   WindowManager.enableScroll();
    // }
  }
  render(){
    return (
      <div style={m(Theme.body)}>
        <div style={m(Theme.wrapper)}>
          {this._renderList(this.state.notes,this._openModal)}
        </div>
        <Modal {...this.state.modal} _closeHandler={this._closeHandler} />
      </div>
    )
  }
}

class NoteItem extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      hover: false
    }
    this._mouseOver = this._mouseOver.bind(this)
    this._mouseOut = this._mouseOut.bind(this)
  }
  _mouseOver(){
    this.setState({hover:true})
  }
  _mouseOut(){
    this.setState({hover:false})
  }
  render(){
    const d = moment(new Date(this.props.timestamp).toISOString());
    const d_fromnow = d.fromNow();
    const d_exact = d.format('LLLL');

    return (
      <Panel onMouseOver={this._mouseOver} onMouseOut={this._mouseOut} hover={this.state.hover} onClick={this.props._openModal.bind(this,this.props.id,false)}>
        <span style={m(Theme.panel.title, this.state.hover && Theme.panel.hover.title)}>{this.props.title}</span>
        <span style={m(Theme.panel.date)} title={d_exact}>{d_fromnow}</span>
        <div style={m(Theme.panel.icons)}>
          <Icon type="pencil" onClick={this.props._openModal.bind(this,this.props.id,true)}/>
          <Icon type="times" onClick={this.props._removeNote.bind(this, this.props.id)} />
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
      <div style={m(Theme.panel,this.props.hover && Theme.panel.hover)} {...this.props}>{this.props.children}</div>
    )
  }
}

Panel.propTypes = {
  hover: React.PropTypes.bool
}

class Icon extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      hover: false
    }
    this._mouseOver = this._mouseOver.bind(this)
    this._mouseOut = this._mouseOut.bind(this)
  }
  _mouseOver(){
    this.setState({hover:true})
  }
  _mouseOut(){
    this.setState({hover:false})
  }
  render(){
    return(
      <i className={`fa fa-${this.props.type} ${this.props.twox && 'fa-2x'} ${this.props.extra}`} {...this.props} onMouseOver={this._mouseOver} onMouseOut={this._mouseOut} style={m(Theme.panel.icons.icon, this.state.hover && (this.props.twox? Theme.panel.icons.icon.hover.twox:Theme.panel.icons.icon.hover))}/>
    )
  }
}

Icon.propTypes = {
  type: React.PropTypes.string.isRequired,
  twox: React.PropTypes.bool,
  extra: React.PropTypes.string
}

Icon.defaultProps = {
  extra: ''
}

class Modal extends React.Component{
  constructor(props){
    super(props);
  }
  render(){
    let modal,title,description,file_path,tags,timestamp;
    if(typeof this.props.id==='undefined'){
      return null;
    }else if(typeof this.props.title === 'undefined'){
      modal = 'Updating...'
    }else{
      if(!this.props.forEditing){
        title = <h1>{this.props.title}</h1>
        description = <p>{this.props.description}</p>
        file_path = <a href={this.props.file_path}>Attachment</a>
        tags = <p>{this.props.tags.join(', ')}</p>
        timestamp = <p>Last Update: {moment(new Date(this.props.timestamp).toISOString()).fromNow()}</p>
      }else{console.log('something');}
      modal = <div style={m(Theme.modal.inner)}>{title}{description}{file_path}{tags}{timestamp}</div>
    }
    return (
      <div style={m(Theme.modal)}>
        <div style={m(Theme.modal.blur)} onClick={this.props._closeHandler}/>
        {modal}
        <div style={m(Theme.modal.close)} onClick={this.props._closeHandler}><Icon type="times" twox={true}/></div>
      </div>
    )
  }
}

Modal.propTypes = {
  id: React.PropTypes.string,
  title: React.PropTypes.string,
  description: React.PropTypes.string,
  file_path: React.PropTypes.string,
  tags: React.PropTypes.arrayOf(React.PropTypes.string),
  timestamp: React.PropTypes.string,
  forEditing: React.PropTypes.bool,
  _closeHandler: React.PropTypes.func
}

Modal.defaultProps = {
  forEditing: false
}

if (typeof document !== 'undefined') {
  let props = JSON.parse(document.getElementById('props').innerHTML);
  ReactDOM.render(<App {...props}/>, document.getElementById('app'));
}

export default App
