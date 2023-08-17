import { useEffect, useState } from 'react'
import { tryCatch, pipeWith, always, ifElse, identity, compose, 
  cond, either, is, or, bind, invoker, map, prop, curry } from 'ramda'
import memoizee from "memoizee"
import { fetchPriceInUsd, toUsdFormat } from './price'

export function usePrice() {
  const [loading, setLoading] = useState(true)
  const [prices, setPrices] = useState()

  useEffect(() => {
    fetchPriceInUsd('btc')
    .then(setPrices)
    .then(() => setLoading(false))
  }, [])

  function toUsdFormat(code, amount) {
    const price = prices[code]
    const value = amount * price

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    
      // These options are needed to round to whole numbers if that's what you want.
      //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
      //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    })
  
    return formatter.format(value)
  }

  return { loading, prices, toUsdFormat }
}