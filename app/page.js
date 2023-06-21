'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useWallet, WithWallet } from './wallet'
import Redirect from './Redirect'

function HomePage() {
  const { status } = useWallet()

  return (
    <Redirect to="/coins" when={status == 'loaded'}>
      <Redirect to="/unlock-wallet" when={status == 'locked'}>
        <section>
          <h1>Crypto Wallet</h1>
          {/* <hgroup>
            <h1>Crypto Wallet</h1>
            <h4>Nullam dui arcu, malesuada et sodales eu, efficitur vitae dolor. Sed ultricies dolor non
            ante vulputate hendrerit. Vivamus sit amet suscipit sapien.</h4>
          </hgroup> */}
          <p>
            Nullam dui arcu, malesuada et sodales eu, efficitur vitae dolor. Sed ultricies dolor non
            ante vulputate hendrerit. Vivamus sit amet suscipit sapien. Nulla iaculis eros a elit
            pharetra egestas. Nunc placerat facilisis cursus. Sed vestibulum metus eget dolor pharetra
            rutrum.
          </p>
          <Link href="/create-wallet" role='button'>Create a new wallet</Link>
          <Link href="/restore-wallet" role='button' className="secondary outline">Restore a wallet</Link>
          <footer><small>Duis nec elit placerat, suscipit nibh quis, finibus neque.</small></footer>
        </section>
      </Redirect>
    </Redirect>
  )
}

export default WithWallet(HomePage)