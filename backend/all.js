import dvCards from './dvCards.js'
import struct from './struct.js'
export default (socket) => {
  struct(socket)
  dvCards(socket)
}
