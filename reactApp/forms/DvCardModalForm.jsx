/* global socket */
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import CloseIcon from '@material-ui/icons/Close'
import { useTheme } from '@material-ui/core/styles'
import DvCardBlock from '../stuff/DvCardBlock.jsx'
import DvChildsTree from '../stuff/DvChildsTree.jsx'
import Grid from '@material-ui/core/Grid'

export default function DvCardModalForm (props) {
  const { docId, dispatch } = props
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [doc, setDoc] = useState(props.doc)
  const handleClose = () => {
    props.onClose && props.onClose()
  }

  console.log('dvCard doc is ', doc)

  useEffect(() => {
    if (doc && (!docId || docId === doc._id)) return
    if (!docId) return

    (async () => {
      console.log('load doc')
      await socket.waitReady()
      const ndoc = await socket.asyncSafeEmit('getDvCard', { docId })
      if (!ndoc) {
        document.displayError('Карточка не найдена, либо вам запрещен её просмотр')
        handleClose()
      }
      setDoc(ndoc)
    })()
  }, [doc, docId])

  return (<Dialog
    disableBackdropClick={true}
    open={!!doc}
    onClose={handleClose}
    scroll='paper'
    aria-labelledby="scroll-dialog-title"
    aria-describedby="scroll-dialog-description"
    maxWidth='lg'
    fullScreen={fullScreen}
    fullWidth={true}
  >
    <DialogTitle id="scroll-dialog-title">Карточка</DialogTitle>
    <DialogContent dividers={true}>
      {doc && <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="flex-start"
        spacing={1}
      >
        <Grid item xs={12} sm={3}>
          <DvChildsTree
            rootCardId={doc.rootCardId}
            curDocId={doc._id}
            dispatch={dispatch}
          />
        </Grid>
        <Grid item xs={12} sm={9}>
          <DvCardBlock doc={doc}/>
        </Grid>
      </Grid>}
    </DialogContent>
    <DialogActions>
      <Button
        variant="contained"
        onClick={handleClose}
        color="primary"
      >
        <CloseIcon/>
        Закрыть
      </Button>
    </DialogActions>
  </Dialog>)
}
DvCardModalForm.propTypes = {
  docId: PropTypes.string,
  doc: PropTypes.object,
  onClose: PropTypes.func,
  dispatch: PropTypes.func,
  userData: PropTypes.object
}
