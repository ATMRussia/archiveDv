/* global socket */
import React from 'react'
import Button from '@material-ui/core/Button'
import PropTypes from 'prop-types'
import OrganiztionTree from './OrganiztionTree.jsx'
import TagsEditForm from './TagsEditForm.jsx'

export default function FiltersDvCardsDialog (props) {
  const [searchHierarchy, setSearchHierarchy] = React.useState(props.filters.hierarchy || [])
  const [inclTags, setInclTags] = React.useState(props.filters.inclTags || [])
  const [exclTags, setExclTags] = React.useState(props.filters.exclTags || [])

  const handleClose = () => {
    props.onClose && props.onClose()
  }

  const applyClick = async () => {
    props.onApply({
      hierarchy: searchHierarchy,
      inclTags,
      exclTags
    })
    props.onClose && props.onClose()
  }

  const resetClick = async () => {
    props.onApply({})
    props.onClose && props.onClose()
  }

  async function getDistinctTags (txt) {
    await socket.waitReady()
    return await socket.asyncSafeEmit('getDocDistinctTags', {
      txt: txt
    })
  }

  return (
    <React.Fragment>
      <TagsEditForm
        defaultValue={props.filters.inclTags}
        label="Включить пометки:"
        fetchSuggestions={getDistinctTags}
        onChange={setInclTags}
        createChipKeys={[]}
      />
      <TagsEditForm
        defaultValue={props.filters.exclTags}
        fetchSuggestions={getDistinctTags}
        label="Исключить пометки:"
        onChange={setExclTags}
        createChipKeys={[]}
      />
      <OrganiztionTree
        collapsible={true}
        label="Подразделения"
        onNodeSelect={(selected) => {
          setSearchHierarchy(selected)
        }}
        defaultSelected={props.filters.hierarchy}
        multiSelect={true}
      />
      <Button
        className={props.parentClasses.popperButton}
        onClick={resetClick}
        color="secondary"
        variant="contained"
      >
        Сбросить фильтры
      </Button>
      <Button
        className={props.parentClasses.popperButton}
        onClick={handleClose}
        color="secondary"
        variant="contained"
      >
        Отмена
      </Button>
      <Button
        className={props.parentClasses.popperButton}
        onClick={applyClick}
        color="primary"
        variant="contained"
      >
        Применить
      </Button>
    </React.Fragment>
  )
}

FiltersDvCardsDialog.propTypes = {
  onApply: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  filters: PropTypes.object.isRequired,
  parentClasses: PropTypes.object
}
