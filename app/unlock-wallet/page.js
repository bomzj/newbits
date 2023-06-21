'use client'

import { useState } from 'react'
import { useWallet, WithWallet } from '../wallet'
import Redirect from '../Redirect'

function UnlockWalletPage() {
  const [password, setPassword] = useState('')
  const [unlocking, setUnlocking] = useState(false) 
  const { status, unlock } = useWallet()
  
  function onPasswordInput(e) {
    setPassword(e.target.value)
  }

  function onUnlockButtonClick(e) {
    e.preventDefault()
    setUnlocking(true)
    unlock(password)
  }

  return (
    <Redirect to="/" when={status == 'not_created'}>
      <Redirect to="/coins" when={status == 'loaded'}>
        <section>
          <h1>Welcome Back!</h1>
          <p>
            Unlock your Guarda Wallet with your password.
          </p>
          <form onSubmit={onUnlockButtonClick}>
            <input name="password" placeholder="Password" onInput={onPasswordInput} />
            <button type="submit" disabled={!password || unlocking}>Unlock</button>
          </form>
        </section>
      </Redirect>
    </Redirect>
  )
}

export default WithWallet(UnlockWalletPage)