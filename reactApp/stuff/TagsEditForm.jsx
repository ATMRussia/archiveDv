import React, { useState, useMemo } from 'react'
import FormLabel from '@material-ui/core/FormLabel'
import PropTypes from 'prop-types'
import Chips from 'react-chips'
// docs at https://github.com/gregchamberlain/react-chips

export default function TagsEditForm (props) {
  const [tags, setTags] = useState(props.defaultValue || [])
  const { defaultValue, label, onChange, handlers, ...other } = props

  if (handlers) {
    handlers.getTags = () => tags
  }

  return useMemo(() => (
    <div>
      {label && <FormLabel>{label}</FormLabel>}
      <Chips
        value={tags}
        onChange={(newTags) => {
          setTags(newTags)
          onChange && onChange(newTags)
        }}
        fetchSuggestionsThrushold={5}
        fromSuggestionsOnly={false}
        uniqueChips={true}
        createChipKeys={[13]}
        renderLoading={() => (<span>Загрузка...</span>)}
        {...other}
      />
    </div>), [tags, onChange])
}

TagsEditForm.propTypes = {
  label: PropTypes.string,
  defaultValue: PropTypes.array,
  onChange: PropTypes.func,
  handlers: PropTypes.object,
  'handlers.getTags': PropTypes.func
}
