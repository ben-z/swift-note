import React from 'react'
import ReactDOM from 'react-dom'
import request from 'superagent'
import moment from 'moment'
import Theme from './theme'
import WindowManager from './util/window-manager'

const API_URL = 'http://localhost:8000/graphql';

 // #     #
 // #     # ###### #      #####  ###### #####   ####
 // #     # #      #      #    # #      #    # #
 // ####### #####  #      #    # #####  #    #  ####
 // #     # #      #      #####  #      #####       #
 // #     # #      #      #      #      #   #  #    #
 // #     # ###### ###### #      ###### #    #  ####

function getPropertyByString(o, s) {
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
//   getPropertyByString(obj,property)===compareObj
function filterOne(array,property,compareObj,i=0){
  if (array.length < i+1) {
    return array;
  }else if (getPropertyByString(array[i],property)===compareObj) {
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
let objFilter = Object.filter = function(obj, predicate) {
    let result = {}, key;

    for (key in obj) {
        if (obj.hasOwnProperty(key) && predicate(obj[key])) {
            result[key] = obj[key];
        }
    }

    return result;
}

let objIsEquiv = Object.isEquiv = function(o1,o2){
  if(typeof o1 !== 'object' || typeof o2 !== 'object'){
    // Case o1 or o2 is not an object
    return ((typeof o1 === typeof o2) && o1===o2)
  }else if(Object.prototype.toString.call(o1) === '[object Array]'||
            Object.prototype.toString.call(o2) === '[object Array]'){
    // Case o1 or o2 is an array
    return (JSON.stringify(o1)===JSON.stringify(o2))
  }else{
    // Case o1 and o2 are objcts
    for (let key in o1) {
      if(!o1.hasOwnProperty(key) || o1[key] === o2[key] || objIsEquiv(o1[key],o2[key])) continue;
      else return false;
    }
    for (let key in o2) {
      if(!o2.hasOwnProperty(key) || o1[key] === o2[key] || objIsEquiv(o1[key],o2[key])) continue;
      else return false;
    }
    return true
  }
}

// Merges js stylesheets
function m(){
  let res = {}
  for (let i = 0; i < arguments.length; ++i){
    let a = arguments[i]
    if (a) {
      // Check if arguments[i] is an array
      if(Object.prototype.toString.call(a) === '[object Array]'){
        a = m.apply(this,a)
      }
      Object.assign(res,a)
    }
  }
  // Filter out children styles
  return Object.filter(res,val=>{return (typeof val !== 'object')})
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
}

function mapAllPrimitive(obj,func,filter=()=>true){
  let t = typeof obj;
  if(t !== 'object'){
    if(filter(obj)){return func(obj)}
    else{return obj}
  }else if(Object.prototype.toString.call(obj) === '[object Array]'){
    return obj.map(v=>mapAllPrimitive(v,func,filter))
  }else{
    let newobj={};
    for(let attr in obj){
      if (obj.hasOwnProperty(attr)) newobj[attr] = mapAllPrimitive(obj[attr],func,filter);
    }
    if (objIsEquiv(newobj,{})) return obj;
    else return newobj;
  }
}

function convertToText(obj) {
    //create an array that will later be joined into a string.
    var string = [];

    //is object
    //    Both arrays and objects seem to return "object"
    //    when typeof(obj) is applied to them. So instead
    //    I am checking to see if they have the property
    //    join, which normal objects don't have but
    //    arrays do.
    if (obj == undefined) {
    	return String(obj);
    } else if (typeof(obj) == "object" && (obj.join == undefined)) {
        for (let prop in obj) {
        	if (obj.hasOwnProperty(prop))
            string.push(prop + ": " + convertToText(obj[prop]));
        };
    return "{" + string.join(",") + "}";

    //is array
    } else if (typeof(obj) == "object" && !(obj.join == undefined)) {
        for(let prop in obj) {
            string.push(convertToText(obj[prop]));
        }
    return "[" + string.join(",") + "]";

    //is function
    } else if (typeof(obj) == "function") {
        string.push(obj.toString())

    //all other values can be done with JSON.stringify
    } else {
        string.push(JSON.stringify(obj))
    }

    return string.join(",");
}

export {getPropertyByString,filterOne,objFilter,objIsEquiv,m,clone,mapAllPrimitive,convertToText};

 //    #
 //   # #   #####  #####
 //  #   #  #    # #    #
 // #     # #    # #    #
 // ####### #####  #####
 // #     # #      #
 // #     # #      #

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      notes: props.notes,
      modal: false,
      original_note: false
    }
    this._updateList = this._updateList.bind(this);
    this._openModal = this._openModal.bind(this);
    this._closeModal = this._closeModal.bind(this);
    this._removeNote = this._removeNote.bind(this);
    this._changeModalText = this._changeModalText.bind(this);
    this._updateNote = this._updateNote.bind(this);
    this._cancelEdit = this._cancelEdit.bind(this);
    this._removeFile = this._removeFile.bind(this);
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
  _renderList(arr){
    return arr.map((item)=>{
      return <NoteItem key={item.id} {...item} _openModal={this._openModal} _removeNote={this._removeNote}/>
    })
  }
  _openModal(id,forEditing=false,e){
    if(e) e.stopPropagation();
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
      if(!note) return alert('note not found, please refresh the window');
      note.forEditing = forEditing;
      // Decode all strings
      note = mapAllPrimitive(note, decodeURI, o=>typeof o === 'string')
      this.setState({
        modal: note,
        original_note: clone(note)
      })
    })
  }
  _fetchNote(id,callback){
    const q = {query:`query{
      note(id:"${id}"){
        id
        timestamp
        title
        description
        tags
        files{
          name
          uid
        }
      }
    }`};
    request.get(API_URL)
      .query(q)
      .end((err,res)=>{
        if(err) throw err;
        callback(res.body.data.note)
      })
  }
  _closeModal(){
    this.setState({
      modal: false,
      original_note: false
    })
  }
  _removeNote(id,e){
    if(e) e.stopPropagation();
    if (!confirm('Remove this note?')) {
      return ;
    }
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
          this.setState({
            notes: notes_removed,
            modal:false
          })
        }
      })
  }
  _changeModalText(property,e){
    let m = this.state.modal;
    if(property==='tags'){
      m[property] = e.target.value.split(',')
    }else{
      m[property] = e.target.value
    }
    this.setState({
      modal: m
    })
  }
  _updateNote(){
    if(objIsEquiv(this.state.modal,this.state.original_note)){
      return this._openModal(this.state.modal.id)
    }
    const q = {query:`
      mutation{
        updateNote(id:"${this.state.modal.id}",title:"${this.state.modal.title||''}",description:"${encodeURI(this.state.modal.description||'')}",tags:${JSON.stringify(this.state.modal.tags||[])},files:${convertToText(this.state.modal.files||[])}){
          id
        }
      }
    `}
    let that = this;
    request.post(API_URL)
      .query(q)
      .end((err,res)=>{
        if(err) throw err;
        else{
          that._openModal(res.body.data.updateNote.id)
          that._updateList()
        }
      })
  }
  _cancelEdit(){
    if(objIsEquiv(this.state.modal,this.state.original_note)||confirm('There are unsaved changes on this page. Do you want to leave without finishing?')){
      this._closeModal();
    }
  }
  _removeFile(uid){
    if(!confirm('Remove this file?')) return;
    let m = this.state.modal
    m.files = filterOne(m.files,'uid',uid);
    this.setState({
      modal:m
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
          {this._renderList(this.state.notes)}
        </div>
        <Modal
          {...this.state.modal}
          _closeModal={this._closeModal}
          _openModal={this._openModal}
          _removeNote={this._removeNote}
          _changeModalText={this._changeModalText}
          _updateNote={this._updateNote}
          _cancelEdit={this._cancelEdit}
          _removeFile={this._removeFile} />
      </div>
    )
  }
}

 // #     #                     ###
 // ##    #  ####  ##### ######  #  ##### ###### #    #
 // # #   # #    #   #   #       #    #   #      ##  ##
 // #  #  # #    #   #   #####   #    #   #####  # ## #
 // #   # # #    #   #   #       #    #   #      #    #
 // #    ## #    #   #   #       #    #   #      #    #
 // #     #  ####    #   ###### ###   #   ###### #    #

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

  // ######
  // #     #   ##   #    # ###### #
  // #     #  #  #  ##   # #      #
  // ######  #    # # #  # #####  #
  // #       ###### #  # # #      #
  // #       #    # #   ## #      #
  // #       #    # #    # ###### ######

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

 // ###
 //  #   ####   ####  #    #
 //  #  #    # #    # ##   #
 //  #  #      #    # # #  #
 //  #  #      #    # #  # #
 //  #  #    # #    # #   ##
 // ###  ####   ####  #    #

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
      <i className={`fa fa-${this.props.type} ${this.props.twox && 'fa-2x'} ${this.props.extraClassName}`} {...this.props} onMouseOver={this._mouseOver} onMouseOut={this._mouseOut} style={m(Theme.panel.icons.icon, this.state.hover && (this.props.twox? Theme.panel.icons.icon.hover.twox:Theme.panel.icons.icon.hover), this.props.extraStyles)}/>
    )
  }
}

Icon.propTypes = {
  type: React.PropTypes.string.isRequired,
  twox: React.PropTypes.bool,
  extraClassName: React.PropTypes.string,
  extraStyles: React.PropTypes.arrayOf(React.PropTypes.object)
}

Icon.defaultProps = {
  extraClassName: '',
  extraStyles: []
}

 // #     #
 // ##   ##  ####  #####    ##   #
 // # # # # #    # #    #  #  #  #
 // #  #  # #    # #    # #    # #
 // #     # #    # #    # ###### #
 // #     # #    # #    # #    # #
 // #     #  ####  #####  #    # ######

class Modal extends React.Component{
  constructor(props){
    super(props);
  }
  render(){
    let modal,title,description,files,tags,timestamp,footer;
    if(typeof this.props.id==='undefined'){
      return null;
    }else if(typeof this.props.title === 'undefined'){
      modal = 'Updating...'
    }else{
      if(!this.props.forEditing){
        title = (
          <div>
            <h1 style={m(Theme.modal.title)}>{this.props.title}</h1>
            <div style={m(Theme.modal.subtitleActions)}>
              <Icon extraStyles={[Theme.modal.subtitleActions.icon]} type="pencil" onClick={this.props._openModal.bind(this,this.props.id,true)}/>
              <Icon extraStyles={[Theme.modal.subtitleActions.icon]} type="times" onClick={this.props._removeNote.bind(this, this.props.id)} />
            </div>
          </div>
        );
        description = <p>{this.props.description.split(/(?:\r\n|\r|\n)/g).map(v=>[v,<br />])}</p>
        files = <ListFiles files={this.props.files} editing={false} />
        tags = <p>{this.props.tags.join(', ')}</p>
        timestamp = <p>Last Update: {moment(new Date(this.props.timestamp).toISOString()).fromNow()}</p>
      }else{
        title=(
          <div>
            <input
              style={m(Theme.modal.inner.editing.text,Theme.modal.inner.editing.title)}
              value={this.props.title}
              onChange={this.props._changeModalText.bind(this,'title')} />
          </div>
        );
        description=(
          <textarea
            style={m(Theme.modal.inner.editing.text,Theme.modal.inner.editing.description)}
            value={this.props.description}
            onChange={this.props._changeModalText.bind(this,'description')} />
        );
        files=<ListFiles files={this.props.files} editing={true} _removeFile={this.props._removeFile}/>
        tags=(
          <div>
            <input
              type="text"
              style={m(Theme.modal.inner.editing.text,Theme.modal.inner.editing.tags)}
              value={this.props.tags.join(',')}
              onChange={this.props._changeModalText.bind(this,'tags')} />
          </div>
        );
        footer=(
          <div>
            <button onClick={this.props._updateNote} type="button">Update</button>
            <button onClick={this.props._cancelEdit} type="button">Cancel</button>
          </div>
        )
      }
      modal = <div style={m(Theme.modal.inner)}>{title}{description}{files}{tags}{timestamp}{footer}</div>
    }
    return (
      <div style={m(Theme.modal)}>
        <div style={m(Theme.modal.blur)} onClick={this.props._closeModal}/>
        {modal}
        <div style={m(Theme.modal.close)} onClick={this.props._closeModal}><Icon type="times" twox={true}/></div>
      </div>
    )
  }
}

Modal.propTypes = {
  id: React.PropTypes.string,
  title: React.PropTypes.string,
  description: React.PropTypes.string,
  files: React.PropTypes.arrayOf(React.PropTypes.object),
  tags: React.PropTypes.arrayOf(React.PropTypes.string),
  timestamp: React.PropTypes.string,
  forEditing: React.PropTypes.bool,
  _closeModal: React.PropTypes.func.isRequired,
  _removeFile: React.PropTypes.func.isRequired
}

Modal.defaultProps = {
  forEditing: false
}

 // #                      #######
 // #       #  ####  ##### #       # #      ######  ####
 // #       # #        #   #       # #      #      #
 // #       #  ####    #   #####   # #      #####   ####
 // #       #      #   #   #       # #      #           #
 // #       # #    #   #   #       # #      #      #    #
 // ####### #  ####    #   #       # ###### ######  ####

class ListFiles extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      progress_bars: []
    }
    this._handleFileUpload = this._handleFileUpload.bind(this)
  }
  _renderList(files,editing){
    return files.map(file=><FileItem {...file} key={file.uid} editing={editing} _removeFile={this.props._removeFile}/>);
  }
  _handleFileUpload(e){
    let that = this;
    // Check for the various File API support.
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
      return alert('No HTML5 File API found, please try again with another browser.')
    }

    let files = e.target.files;
    window.files_ = files;
    for(let i=0,f;f=files[i];i++) {
      let fileInfo = {
        name: f.name,
        type: f.type,
        size: f.size,
        lastModifiedDate: f.lastModifiedDate
      }

      console.log(fileInfo);

      let reader = new FileReader();

      reader.onload = (theFile=>{
        return function(e){
          console.log(e.target);
          let progress_bars = that.state.progress_bars
          progress_bars.push(<UploadProgress file_name={fileInfo.name} file_content={e.target.result} />)
          that.setState({
            progress_bars:progress_bars
          })
        }
      })(f)

      reader.readAsText(f)
    }
  }
  render(){
    let fileInput;
    if(this.props.editing)
      fileInput=(
        <form encType="multipart/form-data" method="post" ref="files">
          <input type="file" multiple onChange={this._handleFileUpload}/>
        </form>
      );
    return (
      <div>
        {this._renderList(this.props.files,this.props.editing)}
        {fileInput}
        {this.state.progress_bars}
      </div>
    );
  }
}

ListFiles.propTypes = {
  files: React.PropTypes.arrayOf(React.PropTypes.object),
  editing: React.PropTypes.bool,
  _removeFile: React.PropTypes.func
}

ListFiles.defaultProps = {
  files: [],
  editing: false
}

class UploadProgress extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      progress: 0
    }
    this._upload = this._upload.bind(this)
  }
  componentDidMount(){
    this._upload()
  }
  _upload(){
    let that = this;

    let updateProgress = function(e){
      if(e.lengthComputable){
        let percentComplete = e.loaded / e.total * 100;
        console.log(percentComplete);
        that.setState({
          progress: percentComplete
        })
      }else{
        console.log('Unable to compute length');
      }
    }
    let transferComplete = function(e){
      console.log('transfer complete');
    }
    let transferFailed = function(e){
      console.log('transfer failed');
    }
    let transferCanceled = function(e){
      console.log('transfer cancelled');
    }

    let xhr = new XMLHttpRequest();
    xhr.addEventListener('progress',updateProgress);
    xhr.addEventListener("load", transferComplete);
    xhr.addEventListener("error", transferFailed);
    xhr.addEventListener("abort", transferCanceled);

    xhr.open('POST','upload',true);
    xhr.send(`name=${escape(this.props.file_name)}&content=${this.props.file_content}`);
  }
  render(){
    return <progress value={this.state.progress.toString()} max="100" />
  }
}

UploadProgress.propTypes = {
  file_name: React.PropTypes.string,
  file_content: React.PropTypes.string
}

 // #######                 ###
 // #       # #      ######  #  ##### ###### #    #
 // #       # #      #       #    #   #      ##  ##
 // #####   # #      #####   #    #   #####  # ## #
 // #       # #      #       #    #   #      #    #
 // #       # #      #       #    #   #      #    #
 // #       # ###### ###### ###   #   ###### #    #

class FileItem extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
    let removeButton;
    if(this.props.editing) removeButton = <Icon type="times" onClick={this.props._removeFile.bind(this, this.props.uid)} />

    return (
      <div>
        <a href={`getFile/${this.props.uid}`}>{this.props.name}</a>
        {removeButton}
      </div>
    );
  }
}

FileItem.propTypes = {
  name: React.PropTypes.string.isRequired,
  uid: React.PropTypes.string.isRequired,
  editing: React.PropTypes.bool,
  _removeFile: React.PropTypes.func
}

FileItem.defaultProps = {
  editing: false
}

if (typeof document !== 'undefined') {
  let props = JSON.parse(document.getElementById('props').innerHTML);
  ReactDOM.render(<App {...props}/>, document.getElementById('app'));
}

export default App
