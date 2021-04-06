import React from 'react'
import PropTypes from 'prop-types'
import {
  Table, TableBody, TableRow, TableCell
} from '@material-ui/core'

function DvObjectProps (props) {
  const { obj } = props

  if (/^(string|number)$/.test(typeof (obj))) {
    return <span>{obj}</span>
  } else if (obj instanceof Object) {
    return <Table>
      <TableBody>{
        Object.keys(obj).map((prop, idx) => (<TableRow key={'row' + idx}>
          <TableCell>{prop}</TableCell>
          <TableCell>{obj[prop]}</TableCell>
        </TableRow>))}
      </TableBody>
    </Table>
  } else {
    return <span>{ typeof (obj) }</span>
  }
}

DvObjectProps.propTypes = {
  obj: PropTypes.any
}

export default DvObjectProps
