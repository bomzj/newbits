'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPassword, createWallet, loadWallet, getWallet } from '../wallet'

export default function CreateWalletPage() {
  const [ready, setReady] = useState(false)
  const { push } = useRouter()
  
  const [passwordDisabled, setPasswordDisabled] = useState(false)
  const [password, setPassword] = useState('')
  const [createButtonClicked, setCreateButtonClicked] = useState(false)
  const [walletCreating, setWalletCreating] = useState(false)

  const shouldValidatePassword = !passwordDisabled && createButtonClicked
  const isPasswordValid = !!password
  
  async function init() {
    const password = getPassword()
    const [error] = await loadWallet(password)
    
    if (!error) push('/coins')
    else if (error == 'not_found') setReady(true)
    else push('/unlock-wallet')
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { init() }, [])

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
    const [error] = await createWallet(password)
    
    if (!error) {
      setPassword(password)
      push('/coins')
    } 
    else 
      console.error(error)
  }

  console.log('create-wallet')

  return ready && 
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
}

//export default WithWallet(CreateWalletPage)