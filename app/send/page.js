'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { and, isEmpty } from 'ramda'
import { useWallet } from '../WalletContext'

// eslint-disable-next-line complexity
export default function SendPage() {
  const { event, accounts, validateAddress } = useWallet()
  const { push } = useRouter()
  const senderDropdownRef = useRef()
  const [senderAddress, setSenderAddress] = useState(() => accounts[0]?.address)
  const balance = accounts.find(i => i.address == senderAddress)?.balance
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [submitClicked, setSubmitClicked] = useState()

  const networkFee = 0.00001
  const code = 'btc'

  const isAmountValid = amount > 0 && amount <= balance - networkFee
  const invalidAmountAttr = and(submitClicked, !isAmountValid) || null

  const isRecipientAddressValid = validateAddress(code, recipientAddress)
  const invalidRecipientAddressAttr = 
    and(submitClicked, !isRecipientAddressValid) || null

  useEffect(restoreUnconfirmedTransaction, [])
  
  function restoreUnconfirmedTransaction() {
    const json = sessionStorage.getItem('unsent_tx')

    if (!json) return

    const tx = JSON.parse(json)
    setSenderAddress(tx.from)
    setRecipientAddress(tx.to)
    setAmount(tx.amount)
  }

  function onSenderAddressClick(e) {
    e.preventDefault()
    senderDropdownRef.current.removeAttribute('open')

    const selectedAddress = e.target.closest('a').dataset.address
    setSenderAddress(selectedAddress)
  }

  async function onRecipientAddressPasteClick(e) {
    const addr = await navigator.clipboard.readText()
    setRecipientAddress(addr)
  }

  function onAmountInput(e) {
    const value = e.target.valueAsNumber >= 0 ? e.target.valueAsNumber : ''
    setAmount(value)
  }

  function onMaxClick() {
    setAmount(balance)
  }

  function onSubmit(e) {
    e.preventDefault()
    setSubmitClicked(true)
    
    const isValid = isAmountValid && isRecipientAddressValid
    if (!isValid) return
    
    const tx = JSON.stringify({ 
      code, 
      from: senderAddress,
      to: recipientAddress, 
      amount 
    })

    sessionStorage.setItem('unsent_tx', tx)
    push(`/send/confirm`)
  }

  return (
    <>
      <h1>Send Bitcoin</h1>

      {isEmpty(accounts) &&
        <p>
          The wallet is empty. 
          Go to <Link href='/receive'>Receive</Link> page to create accounts.
        </p>
      } 
      
      {!isEmpty(accounts) && 
        <form onSubmit={onSubmit}>
          <div>
            <label>
              From
              <details className="dropdown address-dropdown" ref={senderDropdownRef}>
                <summary>
                  <div role='group'>
                    <p>{senderAddress}</p>
                    <small>{balance}&nbsp;BTC</small>
                  </div>
                </summary>
                <ul>
                  {accounts.map(account => 
                    <li key={account.address}>
                      <a href="#" onClick={onSenderAddressClick} data-address={account.address}>
                        <div role='group'>
                          <p>{account.address}</p>
                          <small>{account.balance}&nbsp;BTC</small>
                        </div>
                      </a>
                    </li>
                  )}
                </ul>
              </details>
            </label>
            <label >
              To
              <div role='group'>
                <input 
                  name="toAddress" 
                  placeholder="Recipient Address" 
                  value={recipientAddress} 
                  aria-invalid={invalidRecipientAddressAttr}
                  readOnly
                />
                <button 
                  className='secondary'
                  onClick={onRecipientAddressPasteClick} 
                  type='button'
                >
                  Paste
                </button>
              </div>
            </label>
            <label>
              Amount
              <div role='group'>
                <input 
                  name="amount" 
                  placeholder="0 BTC" 
                  value={amount} 
                  onInput={onAmountInput} 
                  type='number'
                  aria-invalid={invalidAmountAttr}
                />
                <button 
                  className='secondary'
                  onClick={onMaxClick} 
                  type='button'
                >
                  &nbsp;Max&nbsp;
                </button>
              </div>
            </label>
          </div>
          
          <input className='secondary' type="submit" value="Next" />
        </form>
      }
    </>
  )
}