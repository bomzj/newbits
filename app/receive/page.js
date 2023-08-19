'use client'
import { useState, useEffect, useCallback} from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { times, is, prop } from 'ramda'
import { useWallet } from '../WalletContext'


export default function ReceivePage() {
  const { event, accounts, createAddress } = useWallet()

  function onCreateAddressClick(e) {
    createAddress('btc')
  }

  return (
    <>
      <h1>Receive Bitcoin</h1>

      <table style={{ width: 'initial'}}>
        <tbody>
          {accounts.map(account => 
            <tr key={account.address}>
              <td>
                <div className='grid'>
                  <p>{account.address}</p>
                </div>
                <small>{account.balance}&nbsp;BTC</small>
              </td>
              <td>
                <div className='grid'>
                  <p><a href='#'>Copy</a></p>
                </div>
                <small>&nbsp;</small>
              </td>
            </tr>
          )}
        </tbody>
      </table>
     
     <div role='group'>
        <button onClick={onCreateAddressClick} disabled={event == 'creating_address'} >
          Generate a new address
        </button>
      </div>
    </>
  )
}