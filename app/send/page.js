/* eslint-disable complexity */
/* eslint-disable max-lines */
'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { and, curry, isEmpty, pipeWith, andThen, __ } from 'ramda'
import { Either } from 'ramda-fantasy'
import { useWallet } from '../WalletContext'
import { createTx, signTx, toBtc, validateTx, parseTx, TxError } from '../bitcoin'
import { isOk, isError } from '../result'

// eslint-disable-next-line complexity
export default function SendPage() {
  const { event, accounts, validateAddress, setTx, tx, accountBy } = useWallet()
  const { push, } = useRouter()
  const senderDropdownRef = useRef()
  
  const [sender, setSender] = useState(() => accounts[0])
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [fee, setFee] = useState(0)

  const [validateClicked, setValidateClicked] = useState()
  const [validating, setValidating] = useState(false)
  
  // TODO: Get this value from dynamic route segment e.g. /send/[token]
  const token = 'btc'

  const amountValid = amount > 0 && amount <= sender.balance - fee
  const invalidAmountAttr = and(validateClicked, !amountValid) || null

  const recipientAddressValid = validateAddress(token, recipientAddress)
  const invalidRecipientAddressAttr = 
    and(validateClicked, !recipientAddressValid) || null

  useEffect(() => {
    if (!tx) return

    const { from, to, amount } = parseTx(tx)
    const sender = accountBy(from)
    setSender(sender)
    setRecipientAddress(to)
    setAmount(amount)
  }, [])

  function onSenderClick(e) {
    e.preventDefault()
    senderDropdownRef.current.removeAttribute('open')

    const selectedAddress = e.target.closest('a').dataset.address
    const sender = accountBy(selectedAddress)
    setSender(sender)
  }

  async function onRecipientAddressPasteClick(e) {
    const addr = await navigator.clipboard.readText()
    setRecipientAddress(addr)
  }

  function onAmountInput(e) {
    const value = e.target.valueAsNumber >= 0 ? e.target.valueAsNumber : ''
    setAmount(value)
  }

  // TODO: one more candidate to move to bitcoin.js
  async function calculateNetworkFee() {
    const txResult = await createTx({ 
      from: sender.address, 
      to: recipientAddress, 
      amount: 'Max' 
    }, true)
    
    if (isOk(txResult)) {
      return toBtc(txResult.value.tx.fees)
    } else {
      console.error(`Couldn't determine network fee`, txResult.value)
    }
  }

  async function onMaxClick() {
    const fee = await calculateNetworkFee()
    setFee(fee)
    setAmount(sender.balance - fee)
  }

  // TODO: maybe it's better to move this function to bitcoin.js
  // prepareTx() as an use-case function should propagate errors 
  // from create/validate/sign functions instead of overriding them
  async function prepareTx({ from, to, amount }) {
    const createTxResult = await createTx({ from, to, amount }, true)
    
    if (isError(createTxResult)) return createTxResult
      // return Either.Left(`Couldn't create a tx.`, createTxResult.value)

    const fee = toBtc(createTxResult.value.tx.fees)
    const change = +(sender.balance - amount - fee).toFixed(8)
    const validateTxResult = 
      validateTx(createTxResult.value, { from, to, amount, change, fee }, true)
    
    if (isError(validateTxResult)) 
      return Either.Left(`Couldn't validate a created tx.`, validateTxResult.value)

    const signedTxResult = signTx(validateTxResult.value, sender.privateKey, true)
    
    if (isError(signedTxResult)) 
      return Either.Left(`Couldn't sign a tx.`, signedTxResult.value)

    return signedTxResult
  }

  async function onValidate(e) {
    e.preventDefault()
    setValidateClicked(true)

    const valid = amountValid && recipientAddressValid
    if (!valid) return

    setValidating(true)
    
    //const fee = await calculateNetworkFee()

    const signedTxResult = await prepareTx({ 
      from: sender.address, 
      to: recipientAddress, 
      amount
    })

    if (isOk(signedTxResult)) {
      setTx(signedTxResult.value)
      push(`/send/confirm`)
    } 
    else {
      handleTxError(signedTxResult.value)
      setValidating(false)
    }
  }

  async function handleTxError(error) {
    if (error == TxError.NotEnoughFundsToCoverFee) {
      const fee = await calculateNetworkFee()
      setFee(fee)
      console.error(
        'Not enough funds to cover fee.' + 
        'Click Max to use available balance.'
      )
    } else {
      console.error(error)
    }
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
        <form onSubmit={onValidate}>
          <div>
            <label>
              From
              <details className="dropdown address-dropdown" ref={senderDropdownRef}>
                <summary>
                  <div role='group'>
                    <p>{sender.address}</p>
                    <small>{sender.balance}&nbsp;BTC</small>
                  </div>
                </summary>
                <ul>
                  {accounts.map(account => 
                    <li key={account.address}>
                      <a 
                        href="#" 
                        onClick={onSenderClick} 
                        data-address={account.address}
                      >
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
              {/* <small>Invalid recipient address</small> */}
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
                  disabled={validating}
                  onWheel={e => e.target.blur()}
                />
                <button 
                  className='secondary'
                  onClick={onMaxClick} 
                  type='button'
                  disabled={validating || !recipientAddressValid}
                >
                  &nbsp;Max&nbsp;
                </button>
              </div>
              {/* <small>Insufficient funds</small> */}
            </label>
            
            {/* <label>
              Network fee
              <p>{networkFee || '-'}</p>
            </label>

            <label>
              Recipient will receive
              <p>{networkFee || '-'}</p>
            </label>*/}
          </div> 
          
          <input 
            className='secondary' 
            type="submit" 
            value="Validate" 
            disabled={validating} 
          />
        </form>
      }
    </>
  )
}