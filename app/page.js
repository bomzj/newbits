'use client'
import { useState, useEffect, useCallback} from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { tryCatch, pipeWith, always, ifElse, identity, compose, 
  cond, either, is, or, bind, invoker, map } from 'ramda'
import { useWallet } from './WalletContext'
import { format, getPriceInUsd } from './price'

export default function HomePage() {
  const { accounts } = useWallet()
  const [balances, setBalances] = useState([])
  const total = balances.reduce((total, x) => x.balance * x.price + total, 0)
  
  const loadBalances = useCallback(async () => {
    const coinIds = Object.keys(accounts)
    const prices = await Promise.all(coinIds.map(getPriceInUsd))
    
    const balances =
      Object
      .entries(accounts)
      .map(([id, accs]) => ({
        id,
        // eslint-disable-next-line max-nested-callbacks
        balance: accs.reduce((total, acc) => acc.balance + total, 0),
        price: prices[coinIds.indexOf(id)]
      }))
    
    setBalances(balances)
  }, [accounts])
  
  useEffect(() => {
    loadBalances()
  }, [loadBalances])

  return (
    <>
      <section>
        <h1 className='center'>{format(total)}</h1>
      </section>
      <section>
        <table>
          <tbody>
          {balances.map(x => (
            <tr key={x.id}>
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
                  <p>{format(x.balance * x.price)}</p>
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