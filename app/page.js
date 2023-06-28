'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getPassword, loadWallet, useWallet, WithWallet } from './wallet'

export default function HomePage() {
  const [ready, setReady] = useState(false)
  const { push } = useRouter()
  
  async function init() {
    const password = getPassword()
    const [error] = await loadWallet(password)
    
    if (!error) push('/coins')
    else if (error == 'not_found') setReady(true)
    else push('/unlock-wallet')
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { init() }, [])

  return ready && 
    <section>
      <h1>Welcome to NewBits Web Crypto Wallet!</h1>
      {/* <hgroup>
        <h1>Crypto Wallet</h1>
        <h4>Nullam dui arcu, malesuada et sodales eu, efficitur vitae dolor. Sed ultricies dolor non
        ante vulputate hendrerit. Vivamus sit amet suscipit sapien.</h4>
      </hgroup> */}
      <p>
        It&apos;s a lightweight, non-custodial web wallet with a modern UI that doesn&apos;t require app installations or browser extensions. 
        You solely own your keys; NewBits doesn&apos;t have access to them.
      </p>
      <Link href="/create-wallet" role='button'>Create a new wallet</Link>
      <Link href="/restore-wallet" role='button' className="secondary outline">Restore a wallet</Link>
      <footer><small>Duis nec elit placerat, suscipit nibh quis, finibus neque.</small></footer>
    </section>
}

//export default WithWallet(HomePage)