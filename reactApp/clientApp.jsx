import React from 'react'
import ReactDOM from 'react-dom'
import DvCards from './routes/DvCards.jsx'
import { RouterProvider, useRoute } from 'react-router5'
import createRouter from 'router5'
import loggerPlugin from 'router5-plugin-logger'
import browserPlugin from 'router5-plugin-browser'

const routes = [
  { name: 'dvCards', path: '/table/dvCards' },
  { name: 'dvCardsModalForm', path: '/table/dvCards/:cardId' }
]
const router = createRouter(routes, {
  defaultRoute: 'dvCards'
})
router.usePlugin(loggerPlugin)
router.usePlugin(browserPlugin())
router.start()

export default function App (props) {
  const { route } = useRoute()
  return (<React.Fragment>
    {(route.name === 'dvCards' || route.name === 'dvCardsModalForm') && <DvCards/>}
  </React.Fragment>)
}
ReactDOM.render(<RouterProvider router={router}>
  <App/>
</RouterProvider>, document.getElementById('wrapper'))
