'use client'
import { useState, useEffect, useCallback} from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { tryCatch, pipeWith, always, ifElse, identity, compose, 
  cond, either, is, or, bind, invoker, map, groupBy } from 'ramda'
import { useWallet } from './WalletContext'
import { toUsdFormat, fetchPriceInUsd } from './price'

export default function HomePage() {
  const { accounts } = useWallet()
  const [balances, setBalances] = useState([])
  const total = balances.reduce((total, x) => x.valueInUsd + total, 0)
  
  const calculateBalances = useCallback(async () => {
    const byCode = groupBy(acc => acc.code)
    const accountsByCode = byCode(accounts) 
    const codes = Object.keys(accountsByCode)
    const prices = await Promise.all(codes.map(fetchPriceInUsd))
    
    const balances =
      Object
      .entries(accountsByCode)
      .map(([code, accs]) => {
        // eslint-disable-next-line max-nested-callbacks
        const balance = accs.reduce((total, acc) => acc.balance + total, 0)
        const valueInUsd = balance * prices[codes.indexOf(code)]
        return { code, balance, valueInUsd }
      })
    
    setBalances(balances)
  }, [accounts])
  
  useEffect(() => {
    calculateBalances()
  }, [calculateBalances])

  return (
    <>
      <section>
        <h1 className='center'>{toUsdFormat(total)}</h1>
      </section>
      <section>
        <table>
          <tbody>
          {balances.map(x => (
            <tr key={x.code}>
              <td>
                <Image src={"https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg"} width={48} height={48} alt='bitcoin'/>
              </td>
              <td style={{width: '100%'}}>
                <hgroup>
                  <h3>Bitcoin</h3>
                  {/* <h3>Bitcoin</h3> */}
                </hgroup>
              </td>
              <td>
                <hgroup>
                  <h3>{x.balance}&nbsp;BTC</h3>
                  <p>{toUsdFormat(x.valueInUsd)}</p>
                </hgroup> 
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </section>
    </>
  )
}