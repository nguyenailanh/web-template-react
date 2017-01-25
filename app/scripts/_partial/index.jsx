((React, ReactDOM) => {
  class Index extends React.Component {
    render() {
      return (
        <h1>Welcome to Web Template</h1>
      )
    }
  }

  ReactDOM.render(
    <Index />,
    document.getElementById('app')
  );
})(window.React, window.ReactDOM)
