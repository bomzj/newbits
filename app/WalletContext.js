import { useContext, createContext, useState, useEffect, useCallback } from 'react'
import { useSessionStorage } from './useSessionStorage'
import { decrypt } from './encryption'
import { 
  saveDataToStorage,
  saveDataEncryptedToStorage } from './storage'

import safeFn from './safeFn'

/** 
 * @typedef {'not_found' | 'incorrect_password'} LoadError
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
    
    if (error) return ['incorrect_password', null]
    
    const [parseError, data] = safeParse(decryptedJson)
    return [parseError && 'incorrect_password', data]
  }
  
  const [error, data] = safeParse(json)
  return [error && 'incorrect_password', data]
}
  
export async function saveWallet(accounts, password) {
  password ? 
    await saveDataEncryptedToStorage('wallet', accounts, password) : 
    saveDataToStorage('wallet', accounts)
}

const WalletContext = createContext()

/** 
 * @typedef {'loading' | 'not_exists' | 'locked' | 'loaded'} WalletStatus
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

// TODO: instead of status it maybe better to have 
// loading, loaded, error props
// where error: incorrect_password, wallet_not_exists
// or status: loading, not_loaded, loaded with errors
export function WalletProvider({ children }) {
  /** @type [WalletStatus, React.Dispatch<WalletStatus>] */
  const [status, setStatus] = useState('loading')
  const [password, setPassword] = useSessionStorage('password')
  const [accounts, setAccounts] = useState()
  
  const load = useCallback(async () => {
    setStatus('loading')
    const [error, accounts] = await loadWallet(password) 
    
    const newStatus =
      error == 'not_found'          ? 'not_exists' :
      error == 'incorrect_password' ? 'locked' 
                                    : 'loaded'

    setStatus(newStatus)
    setAccounts(accounts)
  }, [password])

  function save() {
    saveWallet(accounts, password)
  }

  //reload locked wallet on password change only
  useEffect(() => {
    console.log('WalletProvider useEffect status:', status)
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load])

  function createWallet(password) {
    // TODO: implement account creating
    saveWallet([], password)
    .then(() => setPassword(password))
  }

  function unlockWallet(password) {
    setPassword(password)
  }

  console.log('WalletProvider', status)

  const wallet = {
    status,
    accounts,
    createWallet,
    unlockWallet
  }
  
  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  )
}