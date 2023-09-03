'use client'
import { useState, useEffect, useCallback, useRef} from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { times, is, prop, on, gt, lte, both, __, allPass, always, and } from 'ramda'
import { useWallet } from '@/app/WalletContext'
import { toUsdFormat, fetchPriceInUsd } from '@/app/price'
import { isOk } from '@/app/result'
import { parseTx, sendTx } from '@/app/bitcoin'

// eslint-disable-next-line complexity
export default function ConfirmTransactionPage() {
  const { push } = useRouter()
  const { tx, setTx } = useWallet()
  const [tokenPrice, setTokenPrice] = useState()
  const [walletTx, setWalletTx] = useState()
  const [sending, setSending] = useState()
  const [txResultMessage, setTxResultMessage] = useState()

  const total = walletTx?.amount + walletTx?.fee
  const inUsd = amount => toUsdFormat(amount * tokenPrice)

  const init = useCallback(async () => {
    // do not show this page if there is no tx to confirm
    if (!tx) {
      push('/')
      return
    }
    
    const walletTx = parseTx(tx)
    setWalletTx(walletTx)

    const priceResult = await fetchPriceInUsd('btc')

    if (isOk(priceResult)) {
      setTokenPrice(priceResult.value[walletTx.token])
    } 
    else {
      console.error('Failed to fetch prices.')
    }
  }, [])
  
  useEffect(() => {
    init()
  }, [init])

  async function onSendClick(e) {
    e.preventDefault()
    setSending(true)
    const result = await sendTx(tx, true)
    
    if (isOk(result)) {
      setTxResultMessage('Transaction sent! Hash: ' + result.tx.hash)
      setTx(null)
    } else {
      setTxResultMessage('An error occurred while sending the transaction.')
      console.error(result.value)
    }

    setSending(false)
  }

  return walletTx && (
    <>
      <h1>Confirm Transaction</h1>
      <table>
        <tbody>
          <tr>
            <td>
              <strong>From</strong>
            </td>
            <td>
              {walletTx.from}
            </td>
          </tr>
          <tr>
            <td>
              <strong>To</strong>
            </td>
            <td>
              {walletTx.to}
            </td>
          </tr>
          <tr>
            <td>
              <strong>Amount</strong>
            </td>
            <td>
              {walletTx.amount}&nbsp;BTC <sup>{inUsd(walletTx.amount)}</sup>
            </td>
          </tr>
          <tr>
            <td>
              <strong>Network Fee</strong>
            </td>
            <td>
              {walletTx.fee}&nbsp;BTC <sup>{inUsd(walletTx.fee)}</sup>
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

      {tx &&
        <div role='group'>
          <button 
            className='secondary'
            onClick={onSendClick} 
            aria-busy={sending}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </button> 
        </div>
      }
      
      <p>{txResultMessage}</p> 
    </>
  )
}