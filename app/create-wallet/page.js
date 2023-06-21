'use client'

import { useState } from 'react'
import { useWallet, WithWallet } from '../wallet'
import Redirect from '../Redirect'

function CreateWalletPage() {
  const [passwordDisabled, setPasswordDisabled] = useState(false)
  const [password, setPassword] = useState('')
  const [createButtonClicked, setCreateButtonClicked] = useState(false)
  const [walletCreating, setWalletCreating] = useState(false)

  const { status, create } = useWallet()
  
  const shouldValidatePassword = !passwordDisabled && createButtonClicked
  const isPasswordValid = !!password

  function onNoPasswordToggle(e) {
    setPasswordDisabled(e.target.checked)
  }

  function onPasswordInput(e) {
    setPassword(e.target.value)
  }

  function onCreateButtonClick(e) {
    e.preventDefault()
    setCreateButtonClicked(true)
    
    const canCreateWallet = 
      status == 'not_created' && 
      (passwordDisabled || isPasswordValid)
    
    if (canCreateWallet) {
      create(password)
      setWalletCreating(true)
      console.log('submit', password)
    }
  }

  console.log('create-wallet')

  return (
    <Redirect to="/coins" when={status == 'loaded'}>
      <Redirect to="/unlock-wallet" when={status == 'locked'}>
        <section>
          <h1>Protect your wallet with a password</h1>
          <p>
            The password you enter encrypts your private key and gives access to your funds. 
            Please store your password in a safe place. 
            We don’t keep your information and can’t restore it.
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
      </Redirect>
    </Redirect>
  )
}

export default WithWallet(CreateWalletPage)