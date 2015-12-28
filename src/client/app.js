import React from 'react'
import ReactDOM from 'react-dom'
import request from 'superagent'

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      notes: props.notes
    }
    this._updateList = this._updateList.bind(this);
  }
  static fetchList(url='http://localhost:8000/graphql',callback){
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
  render(){
    return <h1 onClick={this._updateList}>It works!</h1>;
  }
}

if (typeof document !== 'undefined') {
  let props = JSON.parse(document.getElementById('props').innerHTML);
  ReactDOM.render(<App {...props}/>, document.getElementById('app'));
}

export default App
