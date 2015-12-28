import React from 'react'
import ReactDOM from 'react-dom'

class App extends React.Component {
  _handleClick(e){
    alert('hi');
  }
  render(){
    return <h1 onClick={this._handleClick}>It works!</h1>;
  }
}

if (typeof document !== 'undefined') {
  ReactDOM.render(<App />, document.getElementById('app'));
}

export default App
