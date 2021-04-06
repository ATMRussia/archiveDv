import React from 'react'
import MUICookieConsent from 'material-ui-cookie-consent'

export default function CookieConsent () {
  return (<MUICookieConsent
    cookieName="CookieConsent"
    acceptButtonLabel="Согласен"
    message="Этот веб-сайт использует файлы cookie для повышения удобства работы с веб-сайтом. Переход по ссылке на наш веб-сайт или работа на веб-сайте подразумевают согласие со сбором данных посредством файлов cookie."
  />)
}
