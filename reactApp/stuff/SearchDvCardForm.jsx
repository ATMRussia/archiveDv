import React, { useMemo } from 'react'
import Button from '@material-ui/core/Button'
import FiltersDvCardsDialog from './FiltersDvCardsDialog.jsx'
import PropTypes from 'prop-types'
import { TextField } from '@material-ui/core'
import FilterListIcon from '@material-ui/icons/FilterList'
import SearchIcon from '@material-ui/icons/Search'
import { makeStyles } from '@material-ui/core/styles'
import InputAdornment from '@material-ui/core/InputAdornment'
import Popper from '@material-ui/core/Popper'

const useStyles = makeStyles((theme) => ({
  popperBg: {
    border: '1px solid',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    'min-width': '400px'
  },
  popperButton: {
    margin: '10px 5px 0px 5px'
  },
  keyWordsField: {
    padding: '5px',
    'min-width': '400px'
  },
  button: {
    'margin-left': '5px',
    'margin-right': '5px'
  }
}))

export default function SearchDvCardForm (props) {
  const inputRef = React.createRef()
  const { filters } = props.searchCondition

  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const FiltersDvCardsDialogOpened = Boolean(anchorEl)
  // console.log('draw filters', anchorEl, FiltersDvCardsDialogOpened)
  var filtersCnt = 0
  filtersCnt += (filters.hierarchy?.length) || 0
  filtersCnt += (filters.inclTags?.length) || 0
  filtersCnt += (filters.exclTags?.length) || 0
  filtersCnt += filters.sdate ? 1 : 0
  filtersCnt += filters.edate ? 1 : 0

  async function emitSearch (newFilters) {
    // newFilters && setFilters(newFilters)
    if (!inputRef.current) return// Пропуск, блока поиска не видно,
    // возможно изменились условия в блоке родителе

    delayTimeout && clearTimeout(delayTimeout)
    delayTimeout = null
    props.onSearch && await props.onSearch({
      keywords: ((inputRef.current && inputRef.current.value) || ''),
      filters: newFilters || filters
    })
  }

  var delayTimeout = null
  function delayedEmit () {
    delayTimeout && clearTimeout(delayTimeout)
    delayTimeout = setTimeout(emitSearch, 500)
  }

  return useMemo(() => (
    <React.Fragment>
      <div>
        <TextField
          inputProps={{
            className: classes.keyWordsField
          }}
          inputRef={inputRef}
          onChange={delayedEmit}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon/>
              </InputAdornment>
            )
          }}
        />
        <Button
          className={classes.button}
          variant="contained"
          onClick={(event) => {
            setAnchorEl(anchorEl ? null : event.currentTarget)
          }}>
          <FilterListIcon/>
            Фильтры ({filtersCnt})
        </Button>
      </div>
      <Popper open={FiltersDvCardsDialogOpened} anchorEl={anchorEl}>
        <div className={classes.popperBg}>
          <FiltersDvCardsDialog
            parentClasses={classes}
            filters={filters}
            onClose={() => {
              setAnchorEl(null)
            }}
            onApply={async (fil) => {
              await emitSearch(fil)
            }}
          />
        </div>
      </Popper>
    </React.Fragment>), [props.searchCondition, FiltersDvCardsDialogOpened])
}

SearchDvCardForm.propTypes = {
  onSearch: PropTypes.func,
  searchCondition: PropTypes.object
}
