'use client'

import { useState } from 'react'
import { useWallet, WithWallet } from '../wallet'
import Redirect from '../Redirect'

function CoinsPage() {
  const { status } = useWallet()

  return (
    <Redirect to="/" when={status == 'not_created'}>
      <Redirect to="/unlock-wallet" when={status == 'locked'}>
        <h1>Coins</h1>
      </Redirect>
    </Redirect>
  )
}

export default WithWallet(CoinsPage)