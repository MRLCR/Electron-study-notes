import React from 'react';
import ReactDOM from 'react-dom';

const App: React.FunctionComponent = () => {
  return (
    <>
      <div>Hello Electron!</div>
    </>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('app'),
);
