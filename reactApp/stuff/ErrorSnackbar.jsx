import React from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'

function Alert (props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

class ErrorSnackbar extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      open: false,
      text: '',
      severity: 'error'
    }
  }

  componentDidMount () {
    const thisComponent = this
    // Global trigger
    document.displayError = (errString, severity) => {
      console.log('displayError', errString)
      thisComponent.setState({
        open: true,
        text: errString,
        severity: severity || 'error'
      })
    }
  }

  componentWillUnmount () {
    delete document.displayError
  }

  handleClose (event, reason) {
    if (reason === 'clickaway') {
      return
    }

    this.setState({ open: false })
  };

  render () {
    return (
      <Snackbar open={this.state.open} autoHideDuration={6000} onClose={this.handleClose.bind(this)}>
        <Alert onClose={this.handleClose.bind(this)} severity={this.state.severity}>
          {this.state.text}
        </Alert>
      </Snackbar>
    )
  }
}
export default ErrorSnackbar
