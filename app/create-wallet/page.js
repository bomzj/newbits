'use client'
import { useState, useEffect } from 'react'
import { useWallet } from '../WalletContext'

export default function CreateWalletPage() {
  const { status, createWallet } = useWallet()
  const [passwordDisabled, setPasswordDisabled] = useState(false)
  const [password, setPassword] = useState('')
  const [createButtonClicked, setCreateButtonClicked] = useState(false)
  const [walletCreating, setWalletCreating] = useState(false)

  const shouldValidatePassword = !passwordDisabled && createButtonClicked
  const isPasswordValid = !!password

  function onNoPasswordToggle(e) {
    setPasswordDisabled(e.target.checked)
  }

  function onPasswordInput(e) {
    setPassword(e.target.value)
  }

  async function onCreateButtonClick(e) {
    e.preventDefault()
    setCreateButtonClicked(true)
    
    const canCreateWallet = passwordDisabled || isPasswordValid
    if (!canCreateWallet) return
    
    setWalletCreating(true)
    createWallet(password)
  }

  return (
    <section>
      <h1>Encrypt your wallet with a password</h1>
      <p>
        Protect your web crypto wallet with a strong password 
        to ensure the highest level of security. 
        Remember, NewBits is a non-custodial platform, which means we don&apos;t have 
        access to your encrypted wallet and cannot assist with its restoration.
      </p>
      <form onSubmit={onCreateButtonClick}>
        <fieldset>
          <label>
            <input type="checkbox" role="switch" onInput={onNoPasswordToggle} />
            No Password
          </label>
        </fieldset>
        <input 
          placeholder="Password" 
          value={password}
          disabled={passwordDisabled} 
          onInput={onPasswordInput}
          aria-invalid={shouldValidatePassword ? !isPasswordValid : null}
          aria-describedby="invalid-helper"
        />
        {shouldValidatePassword && !isPasswordValid &&
          <small id="invalid-helper">Password should not be empty!</small>
        }
        <input type="submit" value="Create" disabled={walletCreating} />
      </form>
    </section>
  )
}