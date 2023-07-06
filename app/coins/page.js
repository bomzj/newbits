'use client'
import { useState, useEffect, useCallback} from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '../WalletContext'

export default function CoinsPage() {

  return (
    <>
      <section>
        <h1 className='center'>$1500</h1>
      </section>
      <section>
        <table>
          <tbody>
          {[1,2].map((i) => (
            <tr key={i}>
              <td>
                <img src='https://placehold.co/48x48'/>
              </td>
              <td style={{width: '100%'}}>
                <hgroup>
                  <h2>BTC</h2>
                  <h3>Bitcoin</h3>
                </hgroup>
              </td>
              <td>
                <hgroup>
                  <h2>0.44</h2>
                  <h3>$144</h3>
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