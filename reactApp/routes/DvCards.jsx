/* global socket, appProps */
import React, { useMemo, useReducer } from 'react'
import TablePagination from '@material-ui/core/TablePagination'
import '@babel/polyfill'
import DvCardModalForm from '../forms/DvCardModalForm.jsx'
import SetupRightsModalForm from '../forms/SetupRightsModalForm.jsx'
import Grid from '@material-ui/core/Grid'
import Panel from '../stuff/Panel.jsx'
import SearchDvCardForm from '../stuff/SearchDvCardForm.jsx'
import Box from '@material-ui/core/Box'
// import PropTypes from 'prop-types'
import DvCardsTable from '../stuff/DvCardsTable.jsx'
import { useRoute } from 'react-router5'
import DvFolders from '../stuff/DvFolders.jsx'

function reducer (state, action) {
  console.log('action', action)
  switch (action.type) {
    case 'folderClick': {
      const fid = state.searchCondition?.filters?.folderId || []
      const newFid = fid.concat([])

      if (action.selected) {
        !fid.includes(action.id) && newFid.push(action.id)
      } else {
        const idx = newFid.indexOf(action.id)
        idx > -1 && newFid.splice(idx, 1)
      }
      return {
        ...state,
        searchCondition: {
          ...state.searchCondition,
          filters: {
            ...state.searchCondition.filters,
            folderId: newFid
          }
        },
        status: 0
      }
    }
    case 'unsetActiveDoc':
      state.router.navigate('dvCards')
      return {
        ...state,
        activeDoc: null,
        status: 0
      }
    case 'activeDoc':
      state.router.navigate('dvCardsModalForm', { cardId: action.doc._id })
      return { ...state, activeDoc: action.doc }
    case 'childCardClick':
      state.router.navigate('dvCardsModalForm', { cardId: action.id })
      return { ...state, activeDoc: null }
    case 'setRowsAndPages': {
      const newState = {
        ...state,
        rowsAndPages: action.rowsAndPages,
        status: action.status
      }
      if (action.searchCondition) {
        newState.searchCondition = action.searchCondition
      }
      return newState
    }
    case 'openSetupRights':
      return { ...state, setupRights: action.object }
    case 'closeSetupRights':
      return { ...state, setupRights: null }
    default: return state
  }
}

function DvCards (props) {
  const { route, router } = useRoute()
  const [state, dispatch] = useReducer(reducer, {
    searchCondition: {
      filters: {
        inclTags: [],
        exclTags: [],
        folderId: [],
        sdate: new Date(new Date().getTime() - (365 * 24 * 60 * 60000)),
        edate: new Date()
      },
      keywords: ''
    },
    rowsAndPages: {
      rows: null,
      limit: 10,
      page: 0,
      cnt: null
    },
    status: 0,
    router: router
  })
  console.log('state', state)
  const { searchCondition, rowsAndPages, status } = state

  React.useEffect(() => {
    !status && route.name === 'dvCards' && (async () => {
      await socket.waitReady()
      await loadPage()
    })()
  }, [status, route.name]) // Зависит от состояния status

  async function handleChangePage (e, page) {
    dispatch({
      type: 'setRowsAndPages',
      rowsAndPages: {
        ...rowsAndPages,
        page: page
      },
      status: 0
    })
  }

  async function loadPage () {
    dispatch({
      type: 'setRowsAndPages',
      rowsAndPages: {
        ...rowsAndPages,
        rows: null
      },
      status: 1
    })
    await socket.waitReady()
    try {
      var result = await socket.asyncSafeEmit('getDvCards', {
        rowsAndPages: rowsAndPages,
        searchCondition: searchCondition,
        timeout: rowsAndPages.limit * 1500
      })
      console.log('result', result)
      dispatch({
        type: 'setRowsAndPages',
        rowsAndPages: result.rowsAndPages,
        status: 2
      })
    } catch (err) {
      console.log('err', err)
      if (err.toString() === 'Error: Forbidden') {
        document.displayError && document.displayError('У вас нет прав на просмотр данных')
      } else {
        document.displayError && document.displayError(err.toString())
      }
    }
  }

  async function onSearch (searchCondition) {
    dispatch({
      type: 'setRowsAndPages',
      rowsAndPages: { ...rowsAndPages, rowsCnt: 0, page: 0 },
      status: 0,
      searchCondition: searchCondition
    })
  }

  async function handleChangeRowsPerPage (e) {
    dispatch({
      type: 'setRowsAndPages',
      rowsAndPages: {
        ...rowsAndPages,
        page: 0,
        limit: e.target.value
      },
      status: 0
    })
  }

  return (
    <React.Fragment>
      <Panel caption={'Архив Карточек DocsVision'}/>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
      >
        <Grid item></Grid>
        <Grid item>
          { useMemo(() => (
            <SearchDvCardForm onSearch={onSearch} searchCondition={searchCondition}/>
          ), [searchCondition]) }
        </Grid>
      </Grid>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="flex-start"
        spacing={1}
      >
        <Grid item xs={12} sm={3}>
          <DvFolders dispatch={dispatch} />
        </Grid>
        <Grid item xs={12} sm={9}>
          <Box component="span" display={ state.activeDoc ? 'none' : 'block' }>
            {useMemo(() => (<React.Fragment>
              <DvCardsTable dispatch={dispatch} rows={rowsAndPages.rows}/>
              {rowsAndPages.rows && <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50, 100, 2500]}
                component="div"
                count={rowsAndPages.cnt}
                rowsPerPage={rowsAndPages.limit}
                page={rowsAndPages.page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                backIconButtonText='Предедущая страница'
                labelRowsPerPage='Строк на странице'
                nextIconButtonText='Следующая страница'
              />}
            </React.Fragment>), [rowsAndPages])
            }
          </Box>
        </Grid>
      </Grid>
      {route.name === 'dvCardsModalForm' && <DvCardModalForm
        userData={appProps.userData}
        docId={route.params.cardId}
        doc={state.activeDoc}
        onClose={() => {
          dispatch({
            type: 'unsetActiveDoc'
          })
        }}
        dispatch={dispatch}
      />}
      {state.setupRights && <SetupRightsModalForm object={state.setupRights}/>}
    </React.Fragment>
  )
}
DvCards.propTypes = {}

export default DvCards
