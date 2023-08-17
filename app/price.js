import { tryCatch, pipeWith, always, ifElse, identity, compose, 
  cond, either, is, or, bind, invoker, map, prop, curry } from 'ramda'
import { Either } from 'ramda-fantasy'
import memoizee from "memoizee"

const codesToCoingeckoIds = {
  btc: 'bitcoin'
}

const toCoingeckoId = code => codesToCoingeckoIds[code]
const toCode = coingeckoId => 
  Object
  .entries(codesToCoingeckoIds)
  .find(([key, val]) => val == coingeckoId )[0]

// TODO:
// As of now, it uses client-side caching/memoizing 
// since this free API is limitted to 10-30 requests/minute.
// Need to check how this free API blocks by domain or IP-address.
// if it blocks by domain then appropriate cloud caching is required.
export const fetchPriceInUsd = memoizee(async (code) => {
  const id = toCoingeckoId(code)
  
  return (
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`)
    .then(
      ifElse(res => res.ok, res => res.json(), res => Promise.reject(res))
    )
    .then(data => 
      Object
      .entries(data)
      // eslint-disable-next-line max-nested-callbacks
      .map(([k, v]) => [toCode(k), v.usd])
      // eslint-disable-next-line max-nested-callbacks
      .reduce((acc, curr) => ({ ...acc, [curr[0]]: curr[1] }), {})
    )
    .then(Either.Right)
    .catch(Either.Left)
  )
}, { maxAge: 60000, preFetch: true })

export function toUsdFormat(value) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  
    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  })

  return formatter.format(value)
}