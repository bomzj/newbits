import { useContext, createContext, useState, useEffect, useCallback } from 'react'
import { tryCatch, pipeWith, always, ifElse, identity, compose, 
  cond, either, is, or, bind, invoker, map } from 'ramda'
import { isError, isOk } from './result'
import { useSessionStorage } from './useSessionStorage'
import { decryptFromLocalStorage, encryptToLocalStorage } from './encryptedLocalStorage'
//import { getAddress } from './bitcoin'

const WalletContext = createContext()

/** 
 * @typedef {'loading' | 'not_exists' | 'locked' | 'loaded'} WalletStatus
 * @typedef {{ 
   status: WalletStatus, 
   error,
   accounts,
   create(password),
   unlock(password)
  }} Wallet 
*/

/** @returns {Wallet} */
export const useWallet = () => useContext(WalletContext)

// TODO: instead of status it maybe better to have 
// loading, loaded, error props
// where error: incorrect_password, wallet_not_exists(not_found)
// or status: loading, not_loaded, loaded with errors
export function WalletProvider({ children }) {
  /** @type [WalletStatus, React.Dispatch<WalletStatus>] */
  const [status, setStatus] = useState('loading')
  const [password, setPassword] = useSessionStorage('password')
  const [accounts, setAccounts] = useState({})

    // try to load private keys on init
    useEffect(() => {
      loadWallet(password)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  
  async function loadWallet(password) {
    setStatus('loading')

    const result = await decryptFromLocalStorage('keys', password) 
    
    const newStatus =
      isOk(result) && !result.value ? 'not_exists' :
      isError(result)               ? 'locked' 
                                    : 'loaded'

    setStatus(newStatus)
    
    if (newStatus == 'loaded') {
      setAccounts(toAccounts(result.value))
    }
  }

  async function saveWallet(accounts, password) {
    const accountToKey = account => account.key
    const accountsToKeys = map(accountToKey)
    const privateKeys = map(accountsToKeys, accounts)
    await encryptToLocalStorage('keys', privateKeys, password)
    console.log('wallet saved to local storage.')
  }

  async function createWallet(password) {
    // empty wallet
    const newAccounts = { btc: [] }
    await saveWallet(newAccounts, password)
    setPassword(password)
    await loadWallet(password)
  }

  function unlockWallet(password) {
    setPassword(password)
    loadWallet(password)
  }

  function toAccounts(privateKeys) {
    const getAddress = () => 1
    const keyToAccount = privateKey => ({ address: getAddress(privateKey), privateKey })
    const keysToAccounts = map(keyToAccount)
    return map(keysToAccounts, privateKeys)
  }

  function toAddresses(accounts) {
    const accountToAddress = account => account.address
    const accountsToAddresses = map(accountToAddress)
    return map(accountsToAddresses, accounts)
  }

  console.log('WalletProvider', status)

  const walletContext = {
    status,
    addresses: toAddresses(accounts),
    createWallet,
    unlockWallet
  }
  
  return (
    <WalletContext.Provider value={walletContext}>
      {children}
    </WalletContext.Provider>
  )
}