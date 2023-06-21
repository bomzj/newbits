import { useContext, createContext, useState, useEffect, useCallback } from 'react'
import { 
  parseJsonFromStorage, 
  parseEncryptedJsonFromStorage,
  saveDataToStorage,
  saveDataEncryptedToStorage } from './storage'

//import { useSessionStorage } from "usehooks-ts"

import safeFn from './safeFn'

export async function loadWallet(password) {
  return password ? 
    await parseEncryptedJsonFromStorage('wallet', password) :
    parseJsonFromStorage('wallet')
}
  
export async function saveWallet(accounts, password) {
  password ? 
    await saveDataEncryptedToStorage('wallet', accounts, password) : 
    saveDataToStorage('wallet', accounts)
}

export function getPassword() {
  return sessionStorage.getItem('password')
}

export function setPassword(password) {
  sessionStorage.setItem('password', password)
}

const WalletContext = createContext()

/** 
 * @typedef {'not_created' | 'locked' | 'loaded'} WalletStatus
 * @typedef {{ 
   status: WalletStatus, 
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
  //const [error, setError] = useState()
  const [accounts, setAccounts] = useState()

  async function load() {
    const notCreated = !localStorage.getItem('wallet')
    
    if (notCreated) {
      setStatus('not_created')
      return
    }
    
    const safeLoad = safeFn(loadWallet)
    const password = getPassword()
    const [, loadedAccounts] = await safeLoad(password)
    setAccounts(loadedAccounts)
    setStatus(loadedAccounts ? 'loaded' : 'locked')
  }

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
    accounts,
    //error,
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