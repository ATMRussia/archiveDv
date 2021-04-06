/* global socket */
import React, { useState } from 'react'
import InfiniteTree from 'react-infinite-tree'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolder, faFolderOpen } from '@fortawesome/free-regular-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import PropTypes from 'prop-types'
library.add(faFolder, faFolderOpen)

function DvFolders (props) {
  const [rFolders, setFolders] = useState(null)
  React.useEffect(() => {
    !rFolders && (async () => {
      await socket.waitReady()
      const folders = await socket.asyncSafeEmit('getFolders', {
        parentId: null
      })
      setFolders(folders)
    })()
  }, [rFolders])

  if (!rFolders) return null

  return (<InfiniteTree
    width={300}
    rowHeight={60}
    height={800}
    data={rFolders}
    loadNodes={async (pNode, done) => {
      console.log('loadNodes')
      await socket.waitReady()
      const folders = await socket.asyncSafeEmit('getFolders', {
        parentId: pNode.id
      })
      console.log('subFolders:', folders)
      done(null, folders)
    }}
  >
    {({ node, tree }) => {
      // Determine the toggle state
      let toggleState = ''
      const hasChildren = node.hasChildren()
      if ((!hasChildren && node.loadOnDemand) || (hasChildren && !node.state.open)) {
        toggleState = 'closed'
      }
      if (hasChildren && node.state.open) {
        toggleState = 'opened'
      }
      return (<div
        style={{
          paddingLeft: `${node.state.depth * 18}px`
        }}
      >
        <FontAwesomeIcon
          icon={toggleState === 'opened' ? faFolderOpen : faFolder}
          onClick={() => {
            if (toggleState === 'closed') {
              tree.openNode(node)
            } else if (toggleState === 'opened') {
              tree.closeNode(node)
            }
          }}
        />
        <span
          style={{
            background: node.selected ? '#CCCCCC99' : 'none'
          }}
          onClick={() => {
            node.selected = !node.selected
            props.dispatch({
              type: 'folderClick',
              id: node.id,
              selected: node.selected
            })
          }}>{node.name}</span>
      </div>)
      /* return (
          <TreeNode
              selected={node.state.selected}
              depth={node.state.depth}
              onClick={event => {
                  tree.selectNode(node);
              }}
          >
              <Toggler
                  state={toggleState}
                  onClick={() => {
                      if (toggleState === 'closed') {
                          tree.openNode(node);
                      } else if (toggleState === 'opened') {
                          tree.closeNode(node);
                      }
                  }}
              />
              <span>{node.name}</span>
          </TreeNode>
      ); */
    }}
  </InfiniteTree>)
}
DvFolders.propTypes = {
  dispatch: PropTypes.func
}

export default DvFolders
