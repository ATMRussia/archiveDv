import React, { useMemo } from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'
import {
  Table, TableHead, TableBody, TableRow, TableCell
} from '@material-ui/core'
import '@babel/polyfill'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import PropTypes from 'prop-types'
import moment from 'moment'
import Checkbox from '@material-ui/core/Checkbox'
moment.locale('ru')

const useStyles = makeStyles((theme) => ({
  row: {
    '&:hover > td': {
      backgroundColor: 'white'
    }
  },
  itemCell: {
    cursor: 'pointer'
  }
}))

function DvCardRow (props) {
  const classes = useStyles()
  const { dispatch, row, selected, selectable, desktop } = props
  const activateRow = () => {
    dispatch({
      type: 'activeDoc',
      doc: row
    })
  }

  return useMemo(() => (<TableRow data={row} className={classes.row}>
    <TableCell
      className={classes.itemCell}
      component="td"
      onClick={!selectable ? activateRow : undefined}
    >
      {selectable && <Checkbox
        onChange={(e) => {
          dispatch({
            type: 'setSelectItem',
            row,
            checked: e.target.checked
          })
        }}
        checked={!!selected}
      />}
      <span onClick={selectable ? activateRow : undefined}>
        {row.Description}
      </span>
    </TableCell>
    <TableCell
      className={classes.itemCell}
      component="td"
      onClick={!selectable ? activateRow : undefined}
    >
      {moment(row?.instanceDate?.CreationDateTime).format('DD.MM.YY hh:mm') || ''}
    </TableCell>
  </TableRow>), [selected, row, desktop])
}
DvCardRow.propTypes = {
  selectable: PropTypes.bool,
  selected: PropTypes.bool,
  row: PropTypes.object,
  dispatch: PropTypes.func,
  extraColumns: PropTypes.object,
  desktop: PropTypes.bool
}

function DvCardsTable (props) {
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('sm'))
  const { selected, selectable, extraColumns } = props
  return useMemo(() => (<Table>
    <TableHead>
      <TableRow>
        <TableCell>Название</TableCell>
        <TableCell>Дата создания</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {
        props.rows
          ? props.rows.map((row) => (
            <DvCardRow
              key={row._id}
              dispatch={props.dispatch}
              row={row}
              selectable={selectable}
              selected={selectable && selected.includes(row._id)}
              extraColumns={extraColumns}
              desktop={desktop}
            />))
          : <TableRow>
            <TableCell><CircularProgress /></TableCell>
          </TableRow>
      }
    </TableBody>
  </Table>), [desktop, props.rows, selected?.length])
}
DvCardsTable.propTypes = {
  selectable: PropTypes.bool,
  selected: PropTypes.array,
  rows: PropTypes.array,
  dispatch: PropTypes.func,
  extraColumns: PropTypes.object
}

export default DvCardsTable
