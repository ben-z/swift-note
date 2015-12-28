import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      notes: props.notes
    }
    this._updateList = this._updateList.bind(this);
  }
  _handleClick(e){
    alert('hi');
  }
  static fetchList(url='http://localhost:8000/graphql',callback){
    console.log(url);
    let q = {query:`{
      notes{
        id
        timestamp
        title
        description
        tags
        file_path
      }
    }`};
    $.get(url,q,(res)=>{
      console.log(res.data);
      callback(res.data)
    })
  }
  _updateList(){
    this.constructor.fetchList(void 0,(data)=>{
      this.setState({
        notes: data.notes
      })
    })
  }
  render(){
    return <h1 onClick={this._updateList}>It works!</h1>;
  }
}

if (typeof document !== 'undefined') {
  ReactDOM.render(<App />, document.getElementById('app'));
}

export default App
