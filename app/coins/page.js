'use client'

import { useState, useEffect, useCallback} from 'react'
import { useRouter } from 'next/navigation'
import { getPassword, loadWallet, useWallet, WithWallet } from '../wallet'

export default function CoinsPage() {
  const [ready, setReady] = useState(false)
  const { push } = useRouter()

  async function init() {
    const password = getPassword()
    const [error] = await loadWallet(password)
    
    if (error == 'not_found') push('/')
    else if (error == 'locked') push('/unlock-wallet')
    else setReady(true)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { init() }, [])

  return ready && 
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
}

//export default WithWallet(CoinsPage)