/* global appProps */
import React, { useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import AccountCircle from '@material-ui/icons/AccountCircle'
import MoreIcon from '@material-ui/icons/MoreVert'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import CookieConsent from './CookieConsent.jsx'
import Button from '@material-ui/core/Button'
import ErrorSnackbar from './ErrorSnackbar.jsx'
import TableChartIcon from '@material-ui/icons/TableChart'
import { Link } from 'react-router5'
import PropTypes from 'prop-types'
import '@babel/polyfill'

const useStyles = makeStyles((theme) => ({
  logoLink: {
    'margin-right': '1em'
  },
  logo: {
    height: '3em'
  },
  grow: {
    flexGrow: 1
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block'
    }
  }
}))

function MenuLink ({ to, children }) {
  return <Link
    routeName={to}
    style={{ textDecoration: 'none', display: 'block', color: 'black' }}
  >
    <MenuItem>
      {children}
    </MenuItem>
  </Link>
}
MenuLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.array
}

export default function Panel (panelProps) {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const isMenuOpen = Boolean(anchorEl)

  const userData = appProps.userData || { displayName: 'Гость', rights: {} }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const menuId = 'primary-search-account-menu'
  const renderMenu = useMemo(() => (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem
        component={Button}
        href="https://auth.ans.aero/profile"
      >
        <AccountCircle />
        {userData.displayName}
      </MenuItem>
      <MenuItem
        component={Button}
        href="/logout"
      >
        <IconButton color="inherit">
          <ExitToAppIcon/>
        </IconButton>
        <p>Выйти</p>
      </MenuItem>
      <MenuItem
        component={Button}
        href="/login"
      >
        <IconButton color="inherit">
          <ExitToAppIcon/>
        </IconButton>
        <p>Перезайти</p>
      </MenuItem>
      <MenuLink to="dvCards">
        <IconButton color="inherit">
          <TableChartIcon/>
        </IconButton>
        <p>Архив DocsVision</p>
      </MenuLink>
    </Menu>
  ), [isMenuOpen])

  return <React.Fragment>
    {useMemo(() => (
      <div className={classes.grow}>
        <CookieConsent/>
        <AppBar position="static">
          <Toolbar>
            <a href="/" className={classes.logoLink}>
              <img src="/files/favicon.png" className={classes.logo}/>
            </a>
            <Typography className={classes.title} variant="h6" noWrap>
              {panelProps.caption}
            </Typography>
            <div className={classes.grow} />
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        {renderMenu}
      </div>
    ), [panelProps.caption, isMenuOpen])}
    <ErrorSnackbar/>
  </React.Fragment>
}
