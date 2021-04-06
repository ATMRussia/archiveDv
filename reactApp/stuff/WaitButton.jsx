import React, { useMemo, useState, useCallback } from 'react'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import PropTypes from 'prop-types'
import '@babel/polyfill'

export default function WaitButton (props) {
  const [waiting, setWaiting] = useState(false)
  const { onClickFinish, closeOnSuccess, onClick, ...nprops } = props
  const clickFunction = useCallback(async (e) => {
    setWaiting(true)
    var good = true
    try {
      await onClick(e)
      !closeOnSuccess && setWaiting(false)
    } catch (e) {
      console.log('Error:', e.toString())
      document.displayError && document.displayError(e.extended || e.toString())
      good = false
      setWaiting(false)
    }
    good && onClickFinish && await onClickFinish()
  }, [onClick])

  return useMemo(() => (
    <Button
      {...nprops}
      disabled={waiting || nprops.disabled}
      onClick={clickFunction}
    >
      {waiting && <CircularProgress size={16}/>}
      {nprops.children}
    </Button>
  ), [waiting, nprops.disabled, nprops.children, clickFunction])
}

WaitButton.propTypes = {
  onClickFinish: PropTypes.func,
  onClick: PropTypes.func,
  closeOnSuccess: PropTypes.bool
}
