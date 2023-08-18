'use client'
import { useState, useEffect, useCallback, useRef} from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { times, is, prop, on, gt, lte, both, __, allPass, always, and } from 'ramda'
import { useWallet } from '../../WalletContext'
import { toUsdFormat, fetchPriceInUsd } from '../../price'
import { isOk } from '@/app/result'

// eslint-disable-next-line complexity
export default function ConfirmTransactionPage() {
  const { push } = useRouter()
  const { sendTransaction, event } = useWallet()
  const [tx, setTx] = useState()
  const [price, setPrice] = useState()

  const networkFee = 0.00001
  const total = tx?.amount + networkFee
  
  const inUsd = amount => toUsdFormat(amount * price)

  const init = useCallback(async () => {
    const json = sessionStorage.getItem('unsent_tx')

    // do not show page if there is nothing to confirm
    if (!json) {
      push('/')
      return
    }

    const tx = JSON.parse(json)
    setTx(tx)

    const priceResult = await fetchPriceInUsd('btc')

    if (isOk(priceResult)) {
      setPrice(priceResult.value[tx.code])
    } 
    else {
      console.error('Failed to fetch prices.')
    }
  }, [push])
  
  useEffect(() => {
    init()
  }, [init])

  function onSendClick(e) {
    e.preventDefault()
    
    sendTransaction({ 
      code: tx.code, 
      fromAddress: tx.from, 
      toAddress: tx.to, 
      amount: tx.amount
    })

    sessionStorage.removeItem('unsent_tx')
  }

  return tx && (
    <>
      <h1>Confirm Transaction</h1>
      <table>
        <tbody>
          <tr>
            <td>
              <strong>From</strong>
            </td>
            <td>
              {tx.from}
            </td>
          </tr>
          <tr>
            <td>
              <strong>To</strong>
            </td>
            <td>
              {tx.to}
            </td>
          </tr>
          <tr>
            <td>
              <strong>Amount</strong>
            </td>
            <td>
              {tx.amount}&nbsp;BTC <sup>{inUsd(tx.amount)}</sup>
            </td>
          </tr>
          <tr>
            <td>
              <strong>Network Fee</strong>
            </td>
            <td>
              {networkFee}&nbsp;BTC <sup>{inUsd(networkFee)}</sup>
            </td>
          </tr>
          <tr>
            <td>
            <strong>Total</strong>
            </td>
            <td>
            {total}&nbsp;BTC <sup>{inUsd(total)}</sup>
            </td>
          </tr>
        </tbody>
      </table>

      {event != 'transaction_sent' &&
        <div role='group'>
          <button 
            onClick={onSendClick} 
            aria-busy={event == 'sending_transaction'}
            disabled={event == 'sending_transaction'}
          >
            {event == 'sending_transaction' ? 'Sending...' : 'Send'}
          </button> 
        </div>
      }
      {event == 'transaction_sent' && 
        <i><ins>Transaction sent.</ins></i> 
      }
      {event == 'transaction_failed' && 
        <del>An error occurred while sending the transaction.</del> 
      }
    </>
  )
}