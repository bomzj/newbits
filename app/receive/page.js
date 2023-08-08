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
      <section>
        <table>
          <tbody>
            <tr>
              <td>
                <Image src={"https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg"} width={48} height={48} alt='bitcoin'/>
              </td>
              <td style={{width: '100%'}}>
                <h1>Bitcoin</h1>
              </td>
            </tr>
          </tbody>
        </table>

        <ul>
          {accounts.map(account => 
            <li key={account.address}>
              <hgroup>
                <h5>{account.address}</h5>
                <p>{account.balance} BTC</p>
              </hgroup>
            </li>
          )}
          <li>
            <button 
              className="outline secondary" 
              onClick={onCreateAddressClick}
              disabled={event == 'creating_address'}
            >
              Create a new address
            </button>
          </li>
        </ul>
      </section>
    </>
  )
}