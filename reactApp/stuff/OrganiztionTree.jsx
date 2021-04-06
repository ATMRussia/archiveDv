/* global socket */
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import TreeView from '@material-ui/lab/TreeView'
import TreeItem from '@material-ui/lab/TreeItem'
import Typography from '@material-ui/core/Typography'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import ArrowRightIcon from '@material-ui/icons/ArrowRight'
import CircularProgress from '@material-ui/core/CircularProgress'
import LocationCityIcon from '@material-ui/icons/LocationCity'
import AccountTreeIcon from '@material-ui/icons/AccountTree'
import GroupIcon from '@material-ui/icons/Group'
import PersonIcon from '@material-ui/icons/Person'
import Checkbox from '@material-ui/core/Checkbox'
import { InputLabel } from '@material-ui/core'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

const useTreeItemStyles = makeStyles((theme) => ({
  content: {
    // color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightRegular,
    '$expanded > &': {
      fontWeight: theme.typography.fontWeightMedium
    }
  },
  group: {
    '& $content': {
      paddingLeft: theme.spacing(2)
    }
  },
  expanded: {},
  selected: {},
  label: {
    fontWeight: 'inherit',
    color: 'inherit'
  },
  labelRoot: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0)
  },
  labelIcon: {
    marginRight: theme.spacing(1)
  },
  labelText: {
    fontWeight: 'inherit',
    flexGrow: 1
  }
}))

const labelIconsByLevel = {
  1: LocationCityIcon,
  2: AccountTreeIcon,
  3: GroupIcon
}

function StyledTreeItem (props) {
  const classes = useTreeItemStyles()
  const { item, dispatch, rootState, constant, parentId, ...other } = props
  const { selected, expanded, selectedChildsCount } = item

  const Icon = (item.peoplePosition && PersonIcon) || labelIconsByLevel[item.level] || null

  function onClick (place) {
    return (event) => {
      if (item.peoplePosition && place === 'caption') {
        dispatch({
          type: 'setSelected',
          itemId: item._id,
          newCheckboxState: !selected
        })
        return null
      }
      if (item.peoplePosition) return null
      // event = event || window.event
      // if (event.ctrlKey || event.shiftKey) return

      // развернуть свернуть
      dispatch({
        type: 'expandCollapse',
        ids: [item._id],
        expand: !expanded,
        parentId: parentId
      })
    }
  }

  function onCheckboxChange (event) {
    dispatch({
      type: 'setSelected',
      itemId: item._id,
      newCheckboxState: event.target.checked
    })
  }

  if (item.peoplePosition) {
    other.collapseIcon = null
    other.expandIcon = null
  }

  return useMemo(() => (
    <TreeItem
      nodeId={item._id}
      label={
        <div className={classes.labelRoot}>
          <Icon color="inherit" className={classes.labelIcon} onClick={onClick('icon')}/>
          {!constant && <Checkbox
            checked={selected}
            indeterminate={!selected && selectedChildsCount > 0}
            onChange={onCheckboxChange} />}
          <Typography variant="body2" className={classes.labelText}>
            <span onClick={onClick('caption')}>
              {item.caption || ''}
            </span>
          </Typography>
          <Typography variant="caption" color="inherit">
            {item.activePeople}
          </Typography>
        </div>
      }
      onIconClick={onClick('iconTree')}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        selected: classes.selected,
        group: classes.group,
        label: classes.label
      }}
      {...other}
    >
      {expanded && <OrganiztionBranch
        parentId={item._id}
        rootState={rootState}
        dispatch={dispatch}
        constant={props.constant}
      />}
    </TreeItem>
  ), [item])
}

StyledTreeItem.propTypes = {
  item: PropTypes.object,
  rootState: PropTypes.object,
  dispatch: PropTypes.func,
  constant: PropTypes.bool,
  parentId: PropTypes.string
}

function getIdsRecursive (items) {
  var ret = []
  items && items.forEach((item) => {
    ret.push(item._id)
    ret = ret.concat(getIdsRecursive(item.items))
  })
  return ret
}

function OrganiztionBranch (props) {
  const parentId = props.parentId || 'root'
  const parentItem = props.rootState.byIds[parentId]
  const itemsIds = parentItem && parentItem.itemsIds
  const items = itemsIds && itemsIds.map((id) => props.rootState.byIds[id])
  const itemsIdsLen = itemsIds ? itemsIds.len : -1

  React.useEffect(() => {
    !items && (async () => {
      await socket.waitReady()
      try {
        const Ritems = await socket.asyncSafeEmit('getStruct', {
          bottomId: props.bottomId,
          topId: props.topId,
          parentId: props.parentId
        })
        props.dispatch({
          type: 'struct',
          parentId: parentId,
          items: Ritems
        })
        props.constant && props.bottomId && props.dispatch({
          type: 'expandCollapse',
          ids: getIdsRecursive(Ritems),
          expand: true
        })
      } catch (err) {
        document.displayError && document.displayError(err.toString())
      }
    })()
  }, [itemsIdsLen, props.topId, props.bottomId, props.parentId])

  if (items && items.length === 0) return null

  return <React.Fragment>
    {items && items.map((item) => (
      <StyledTreeItem
        key={item._id}
        parentId={props.parentId}
        item={item}
        dispatch={props.dispatch}
        rootState={props.rootState}
        constant={props.constant} />
    ))}
    {!items && <CircularProgress key={'parent' + (props.parentId || 'Root')}/>}
  </React.Fragment>
}

OrganiztionBranch.propTypes = {
  constant: PropTypes.bool,
  rootState: PropTypes.object,
  dispatch: PropTypes.func,
  bottomId: PropTypes.string,
  topId: PropTypes.string,
  parentId: PropTypes.string
}

function expandCollapse (state, action) {
  const { ids, expand } = action
  const newExpIds = state.expanded.concat([])
  ids.forEach((id) => {
    expand ? newExpIds.push(id) : newExpIds.splice(newExpIds.indexOf(id), 1)
    var cur = state.byIds[id]
    state.byIds[id] = {
      ...cur,
      expanded: expand
    }

    !cur && console.log('Err', id)

    // Update parents
    cur = state.byIds[cur.parentId]
    while (cur && cur._id) {
      state.byIds[cur._id] = { ...cur }
      cur = state.byIds[cur.parentId]
    }
  })
  return newExpIds
}

function eachParent (state, startId, func) {
  var cur = state.byIds[startId]
  while (cur && cur._id) {
    func(cur)
    cur = state.byIds[cur.parentId]
  }
}

function setSelected (state, action) {
  const { itemId, newCheckboxState } = action
  const ids = itemId instanceof Array ? itemId : [itemId]
  const newIds = state.selected.concat([])
  ids.forEach((id) => {
    newCheckboxState ? newIds.push(id) : newIds.splice(newIds.indexOf(id), 1)
    var cur = state.byIds[id]
    state.byIds[id] = { ...cur, selected: newCheckboxState }
    eachParent(state, cur.parentId, (pItem) => {
      pItem.selectedChildsCount += newCheckboxState ? 1 : -1
      state.byIds[pItem._id] = { ...pItem }
    })
  })
  return newIds
}

function recursiveFill (state, action) {
  const parentObj = state.byIds[action.parentId]
  parentObj.itemsIds = []
  action.items.forEach((item) => {
    parentObj.itemsIds.push(item._id)
    item.selectedChildsCount = 0
    item.parentId = action.parentId
    state.byIds[item._id] = item
    item.selected = state.selected.includes(item._id)
    item.selected && eachParent(state, item.parentId, (pItem) => {
      pItem.selectedChildsCount++
    })

    item.expanded = state.expanded.includes(item._id)
    item.items && recursiveFill(state, {
      type: 'structFill',
      parentId: item._id,
      items: item.items,
      skipParentUpdates: true
    })
    delete item.items
  })

  // update parent items
  if (!action.skipParentUpdates) {
    var cur = parentObj
    while (cur && cur._id) {
      state.byIds[cur._id] = { ...cur }
      cur = state.byIds[cur.parentId]
    }
  }
}

function reducer (state, action) {
  switch (action.type) {
    case 'struct':
      recursiveFill(state, action)
      return { ...state }
    case 'expandCollapse':
      return {
        ...state,
        expanded: expandCollapse(state, action)
      }
    case 'setSelected': {
      const newSelectedNodes = setSelected(state, action)
      state.onNodeSelect && state.onNodeSelect(newSelectedNodes)
      return {
        ...state,
        selected: newSelectedNodes
      }
    }
    case 'updState':
      return action.newState
    case 'setOnNodeSelect':
      return {
        ...state,
        onNodeSelect: action.onNodeSelect
      }
  }
}

export default function OrganiztionTree (props) {
  const [rootState, dispatch] = React.useReducer(reducer, {
    expanded: props.defaultExpanded || [],
    selected: props.defaultSelected || [],
    byIds: { root: {} }
  })
  const [loaded, setLoaded] = React.useState(false)
  const {
    collapsible, disableSelection, multiSelect,
    onNodeSelect, defaultSelected, ...other
  } = props

  onNodeSelect && rootState.onNodeSelect !== onNodeSelect && dispatch({
    type: 'setOnNodeSelect',
    onNodeSelect
  })

  React.useEffect(() => {
    !loaded && (async () => {
      await socket.waitReady()
      try {
        if (rootState.selected.length) {
          const parentIds = await socket.asyncSafeEmit('getParentItems', {
            ids: rootState.selected
          })
          dispatch({
            type: 'updState',
            newState: {
              ...rootState,
              expanded: parentIds
            }
          })
        }
      } catch (err) {
        document.displayError && document.displayError(err.toString())
      }
      setLoaded(true)
    })()
  }, [loaded])

  const treeElem = (<TreeView
    multiSelect={props.constant ? false : multiSelect}
    disableSelection={props.constant || disableSelection}
    expanded={rootState.expanded}
    defaultCollapseIcon={<ArrowDropDownIcon />}
    defaultExpandIcon={<ArrowRightIcon />}
    defaultEndIcon={<div style={{ width: 24 }} />}
  >
    {loaded && <OrganiztionBranch
      rootState={rootState}
      dispatch={dispatch}
      {...other}
    />}
  </TreeView>)

  return (
    <React.Fragment>
      {collapsible &&
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
      >
        <InputLabel>{props.label}</InputLabel>
      </AccordionSummary>
      <AccordionDetails>
        {treeElem}
      </AccordionDetails>
    </Accordion>}
      {!collapsible && <React.Fragment>
        {props.label && <InputLabel>{props.label}</InputLabel>}
        {treeElem}
      </React.Fragment>}
    </React.Fragment>
  )
}
OrganiztionTree.propTypes = {
  constant: PropTypes.bool,
  defaultExpanded: PropTypes.array,
  multiSelect: PropTypes.bool,
  disableSelection: PropTypes.bool,
  items: PropTypes.array,
  bottomId: PropTypes.string,
  topId: PropTypes.string,
  parentId: PropTypes.string,
  label: PropTypes.string,
  onNodeSelect: PropTypes.func,
  defaultSelected: PropTypes.array,
  collapsible: PropTypes.bool
}
