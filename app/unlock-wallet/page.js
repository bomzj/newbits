'use client'
import { useState, useEffect, useCallback} from 'react'
import { useWallet } from '../WalletContext'

export default function UnlockWalletPage() {
  const { status, unlockWallet } = useWallet()
  const [password, setPassword] = useState('')
  const [unlockFailed, setUnlockFailed] = useState()

  const unlocking = status == 'loading'
  
  useEffect(() => { 
    console.log('UnlockWalletPage useEffect', status)
    // Unlocking just failed
    if (status == 'locked' && password) {
      setPassword('')
      setUnlockFailed(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])
  
  function onPasswordInput(e) {
    setUnlockFailed(false)
    setPassword(e.target.value)
  }

  function onUnlockButtonClick(e) {
    e.preventDefault()
    
    if (password)
      unlockWallet(password)
    else
      setUnlockFailed(true)
  }
  console.log('UnlockWalletPage', status, 'unlocking', unlocking)
  return (
    <section>
      <h1>Welcome Back!</h1>
      <p>
        Unlock your wallet with your password.
      </p>
      <form onSubmit={onUnlockButtonClick}>
        <input 
          name="password" 
          placeholder="Password" 
          onInput={onPasswordInput} 
          aria-invalid={unlockFailed || null}
          aria-describedby="invalid-helper"
          value={password}
          disabled={unlocking}
        />
        {unlockFailed && 
          <small id="invalid-helper">Incorrect password!</small>
        }
        <input className='secondary' type="submit" value="Unlock" disabled={unlocking} />
      </form>
    </section>
  )
}