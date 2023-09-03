/* eslint-disable fp/no-mutation */
const isNode = typeof global === 'object' && '[object global]' === global.toString.call(global)
const isBrowser = typeof window === 'object' && '[object Window]' === window.toString.call(window)

// Fix bn.js to support Buffer globally in Browser that is used by bitcore-lib
if (isBrowser) {
  Buffer = Uint8Array
}