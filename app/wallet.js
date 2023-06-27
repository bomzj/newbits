import { useContext, createContext, useState, useEffect, useCallback } from 'react'
import { decrypt } from './encryption'
import { 
  parseJsonFromStorage, 
  parseEncryptedJsonFromStorage,
  saveDataToStorage,
  saveDataEncryptedToStorage } from './storage'

import safeFn from './safeFn'

/** 
 * @typedef {'not_found' | 'locked'} LoadError
 * @typedef {{name:number}} Account
 * @returns {Promise<[LoadError, Account[]]>} 
*/
export async function loadWallet(password) {
  const json = localStorage.getItem('wallet')
  
  if (!json) return ['not_found', null]

  const safeParse = safeFn(JSON.parse)

  if (password) {
    const safeDecrypt = safeFn(decrypt)
    const [error, decryptedJson] = await safeDecrypt(json, password)
    
    if (error) return ['locked', null]
    
    const [parseError, data] = safeParse(decryptedJson)
    return [parseError && 'locked', data]
  }
  
  const [error, data] = safeParse(json)
  return [error && 'locked', data]
}
  
export async function saveWallet(accounts, password) {
  password ? 
    await saveDataEncryptedToStorage('wallet', accounts, password) : 
    saveDataToStorage('wallet', accounts)
}

export async function createWallet(password) {
  const json = localStorage.getItem('wallet')  
  if (json) return [//'wallet_already_exists'
    'Unable to create a new wallet, ' +
    'there is already an existing wallet in the storage.', 
    null]
  
  const safeSave = safeFn(saveWallet)
  return safeSave([], password)
}

export function getPassword() {
  return sessionStorage.getItem('password')
}

export function setPassword(password) {
  sessionStorage.setItem('password', password)
}

export async function getWallet() {
  const json = sessionStorage.getItem('wallet')
  if (json) return [, JSON.parse(json)]

  const password = getPassword()
  const [error, accounts] = await loadWallet(password)
  if (!error) setWallet(accounts)

  return [error, accounts]
}

export function setWallet(accounts) {
  const json = JSON.stringify(accounts)
  sessionStorage.setItem('wallet')
}

export async function unlockWallet(password) {
  // setPassword(password)
  // getWallet()
  const [error, accounts] = await loadWallet(password)
  
  if (!error) {
    setWallet(accounts)
    setPassword(password)
  }

  return [error, accounts]
}

const WalletContext = createContext()

/** 
 * @typedef {'not_created' | 'locked' | 'loaded'} WalletStatus
 * @typedef {{ 
   status: WalletStatus, 
   error,
   accounts: {name:number}[],
   create(password),
   unlock(password)
  }} Wallet 
*/

/** @returns {Wallet} */
export const useWallet = () => useContext(WalletContext)

// TODO: refactor as useWallet hook without any context/provider
// Is it possible to use events for syncing instead of relying on context?
export function WalletProvider({ children }) {
  /** @type [WalletStatus, React.Dispatch<WalletStatus>] */
  const [status, setStatus] = useState()
  // Shared error! Later it should be refactored properly to avoid race conditions
  const [error, setError] = useState()
  const [accounts, setAccounts] = useState()

  // Load wallet on init only once
  useEffect(() => { 
    load() 
  }, [])

  async function create(password) {
    if (status == 'not_created') {
      setPassword(password)
      saveWallet([], password).then(load)
    } else {
      console.error('Unable to create a new wallet as one has already been created.')
    }
  }

  function unlock(password) {
    if (status == 'locked') {
      setPassword(password)
      load()
    } else {
      console.error('Unable to unlock wallet since it\'s not locked.')
    }
  }

  console.log('WalletProvider')

  const wallet = {
    status,
    error,
    accounts,
    create,
    unlock
  }
  
  return (
    <WalletContext.Provider value={wallet}>
      {status && children}
    </WalletContext.Provider>
  )
}

export function WithWallet(Page) {
  return function PageWithWallet() {
    return (
      <WalletProvider>
        <Page />
      </WalletProvider>
    )
  }
}