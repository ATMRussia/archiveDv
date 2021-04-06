/* global socket */
import React, { useState } from 'react'
import InfiniteTree from 'react-infinite-tree'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStickyNote, faFolderOpen, faFolder } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import PropTypes from 'prop-types'
library.add(faStickyNote, faFolderOpen, faFolder)

function fillSelected (treeNodes, selectedId) {
  treeNodes.forEach((node) => {
    node.selected = node.id === selectedId
    node.children && fillSelected(node.children, selectedId)
  })
}

function DvChildsTree (props) {
  const [rFolders, setFolders] = useState(null)
  const { rootCardId, curDocId } = props
  React.useEffect(() => {
    if (rFolders && rFolders[0].id === rootCardId) return
    (async () => {
      await socket.waitReady()
      const folders = await socket.asyncSafeEmit('getChildsDvCards', {
        rootCardId: rootCardId,
        curDocId: curDocId
      })
      setFolders(folders)
    })()
  }, [rFolders, rootCardId])

  React.useEffect(() => {
    if (!rFolders) return
    fillSelected(rFolders, curDocId)
    setFolders(rFolders.concat([]))
  }, [curDocId])

  if (!rFolders) return null

  return (<InfiniteTree
    width={300}
    rowHeight={60}
    height={600}
    data={rFolders}
    autoOpen
  >
    {({ node, tree }) => {
      const hasChildren = node.hasChildren()
      return (<div
        style={{
          paddingLeft: `${node.state.depth * 18}px`
        }}
      >
        {hasChildren && <FontAwesomeIcon
          icon={node.state.open ? faFolderOpen : faFolder}
          onClick={() => {
            if (!node.state.open) {
              tree.openNode(node)
            } else {
              tree.closeNode(node)
            }
          }}
        />}
        <FontAwesomeIcon icon={faStickyNote}/>
        <span
          style={{
            background: node.selected ? '#CCCCCC99' : 'none'
          }}
          onClick={() => {
            // node.selected = !node.selected
            props.dispatch({
              type: 'childCardClick',
              id: node.id
            })
          }}>{node.name}</span>
      </div>)
    }}
  </InfiniteTree>)
}
DvChildsTree.propTypes = {
  rootCardId: PropTypes.string,
  curDocId: PropTypes.string,
  dispatch: PropTypes.func
}
export default DvChildsTree
