import React from 'react'
import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import SaveIcon from '@material-ui/icons/Save'
import CloseIcon from '@material-ui/icons/Close'

export default function SetupRightsModalForm (props) {
  const { dispatch } = props

  function handleClose () {
    dispatch({ type: 'closeSetupRights' })
  }
  function handleSave () {
    console.log('Save click')
  }

  return <Dialog
    disableBackdropClick={true}
    open
    onClose={handleClose}
    scroll='paper'
    aria-labelledby="scroll-dialog-title"
    aria-describedby="scroll-dialog-description"
    maxWidth='lg'
  >
    <DialogTitle id="scroll-dialog-title">Настройка прав</DialogTitle>
    <DialogContent dividers={true}>
      Тест
    </DialogContent>
    <DialogActions>
      <Button
        variant="contained"
        onClick={handleSave}
        color="primary"
      >
        <SaveIcon/>
        Сохранить
      </Button>
      <Button
        variant="contained"
        onClick={handleClose}
      >
        <CloseIcon/>
        Закрыть
      </Button>
    </DialogActions>
  </Dialog>
}

SetupRightsModalForm.propTypes = {
  dispatch: PropTypes.func
}
