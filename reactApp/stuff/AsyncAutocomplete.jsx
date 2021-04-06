/* global socket */
import React, { useMemo, useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import PropTypes from 'prop-types'

export default function AsyncAutocomplete (props) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState(null)
  const loading = open && (options === null)
  const {
    saveOptions, copyOptionsTo, eventfunc, eventData, event, label, error,
    disabled, helperText, className, required, ...otherProps
  } = props

  useEffect(() => {
    if (!loading) {
      return
    }

    (async (props) => {
      try {
        var ret = { options: [] }
        if (eventfunc) {
          ret = await eventfunc(eventData)
        } else if (event) {
          ret = await socket.asyncSafeEmit(event, eventData || {})
        }
        setOptions(ret.options)
        if (copyOptionsTo) {
          copyOptionsTo.options = ret.options
        }
      } catch (e) {
        console.log(e.toString())
        document.displayError && document.displayError(e)
      }
    })(props)
  }, [loading])

  useEffect(() => {
    if (!open && !saveOptions) {
      setOptions(null)
    }
  }, [open])

  return useMemo(() => (
    <Autocomplete
      open={open}
      onOpen={() => {
        setOpen(true)
      }}
      onClose={() => {
        setOpen(false)
      }}
      options={options || (props.value ? [props.value] : [])}
      loading={loading}
      loadingText="Загрузка..."
      noOptionsText="Нет вариантов"
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          disabled={disabled}
          label={label}
          error={error}
          helperText={helperText}
          className={className}
          required={required}
        />
      )}
      {...otherProps}
    />
  ), [open, options, loading, props.value, error, helperText, disabled])
}

AsyncAutocomplete.propTypes = {
  eventfunc: PropTypes.func,
  event: PropTypes.string,
  eventData: PropTypes.object,
  label: PropTypes.string,
  saveOptions: PropTypes.bool
}
