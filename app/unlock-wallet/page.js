'use client'

import { useState, useEffect, useCallback} from 'react'
import { useRouter } from 'next/navigation'
import { getPassword, setPassword, loadWallet, useWallet, WithWallet } from '../wallet'

export default function UnlockWalletPage() {
  const [ready, setReady] = useState(false)
  const { push } = useRouter()

  const [inputPassword, setInputPassword] = useState('')
  const [unlocking, setUnlocking] = useState(false) 
  const [unlockFailed, setUnlockFailed] = useState(false)
  
  const unlock = useCallback(async (password) => {
    setUnlocking(true)
    const [error] = await loadWallet(password)
    setUnlocking(false)

    if (!error) {
      setPassword(password)
      push('/coins')
    }
    else if (error == 'not_found') 
      push('/')
    else 
      setReady(true)

    return !!error
  }, [push])

  useEffect(() => { 
    unlock(getPassword()) 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  function onPasswordInput(e) {
    setInputPassword(e.target.value)
    // reset on password change
    setUnlockFailed(false)
  }

  async function onUnlockButtonClick(e) {
    e.preventDefault()
    
    const error = await unlock(inputPassword)
    setUnlockFailed(!!error)
  }

  return ready &&
    <section>
      <h1>Welcome Back!</h1>
      <p>
        Unlock your Guarda Wallet with your password.
      </p>
      <form onSubmit={onUnlockButtonClick}>
        <input 
          name="password" 
          placeholder="Password" 
          onInput={onPasswordInput} 
          aria-invalid={unlockFailed || null}
          aria-describedby="invalid-helper"
        />
        {unlockFailed && 
          <small id="invalid-helper">Incorrect password!</small>
        }
        <button className="grid" type="submit" disabled={unlocking}>Unlock</button>
      </form>
    </section>
}

//export default WithWallet(UnlockWalletPage)