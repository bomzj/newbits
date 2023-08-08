import { useContext, createContext, useState, useEffect, useCallback } from 'react'
import { tryCatch, pipeWith, always, ifElse, identity, compose, 
  cond, either, is, or, bind, invoker, map, partialRight } from 'ramda'
import { isError, isOk } from './result'
import { useSessionStorage } from './useSessionStorage'
import { decryptFromLocalStorage, encryptToLocalStorage } from './encryptedLocalStorage'
import { generatePrivateKey, getAddress, fetchBalance } from './bitcoin'

const WalletContext = createContext()

/** 
 * @typedef {'loading' | 'not_exists' | 'locked' | 'loaded'} WalletStatus
 * @typedef {{ 
   status: WalletStatus, 
   error,
   accounts: { code, address, privateKey, balance }[],
   event: Event,
   createWallet(password),
   unlockWallet(password),
   createAddress(coinCode)
  }} Wallet 
*/

/** @typedef {'creating_address' | 'address_created' } Event */

/** @returns {Wallet} */
export const useWallet = () => useContext(WalletContext)

// TODO: instead of status it maybe better to have 
// loading, loaded, error props
// where error: incorrect_password, wallet_not_exists(not_found)
// or status: loading, not_loaded, loaded with errors
export function WalletProvider({ children }) {
  /** @type [WalletStatus, React.Dispatch<WalletStatus>] */
  const [status, setStatus] = useState('loading')
  const [password, setPassword] = useState() //useSessionStorage('password')
  const [accounts, setAccounts] = useState([])
  
  // TODO: Rethink wallet statuses to play nicely with events
  /** @type [Event, React.Dispatch<Event>] */
  const [event, setEvent] = useState()

  // try to load private keys on init
  useEffect(() => {
    const password = sessionStorage.getItem('password')
    setPassword(password)
    loadWallet(password)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync balances every 1 minute
  useEffect(() => {
    if (status != 'loaded') return
    syncBalances()
    const intervalId = setInterval(syncBalances, 60 * 1000)
    return () => clearInterval(intervalId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])
  
  async function loadWallet(password) {
    setStatus('loading')

    const result = await decryptFromLocalStorage('accounts', password) 
    
    const newStatus =
      isOk(result) && !result.value ? 'not_exists' :
      isError(result)               ? 'locked' 
                                    : 'loaded'

    setStatus(newStatus)
    
    if (newStatus == 'loaded') {
      setAccounts(result.value)
    }
  }

  async function saveWallet(accounts, password) {
    // const accountToKey = account => account.privateKey
    // const accountsToKeys = map(accountToKey)
    // const privateKeys = map(accountsToKeys, accounts)
    await encryptToLocalStorage('accounts', accounts, password)
    console.log('wallet saved to local storage.')
  }

  async function createWallet(password) {
    // empty wallet
    const newAccounts = []
    await saveWallet(newAccounts, password)
    setPassword(password)
    sessionStorage.setItem('password', password)
    await loadWallet(password)
  }

  function unlockWallet(password) {
    setPassword(password)
    sessionStorage.setItem('password', password)
    loadWallet(password)
  }

  async function createAddress(code) {
    // TODO: Implement address generation based on code argument
    setEvent('creating_address')
    const privateKey = generatePrivateKey(true)
    const address = getAddress(privateKey, true)
    const account = { code, address, privateKey, balance: 0 }
    const newAccounts = [...accounts, account]
    await saveWallet(newAccounts, password)
    setAccounts(newAccounts)
    setEvent('address_created')
  }

  async function syncBalances() {
    // update balances
    //const fetchBalanceFromTestnet = partialRight(fetchBalance, true)
    const fetchingBalances = accounts.map(x => fetchBalance(x.address, true))
    const balances = await Promise.all(fetchingBalances)
    const newAccounts = accounts.map((acc, i) => ({ ...acc, balance: balances[i] }))
    setAccounts(newAccounts)
    saveWallet(newAccounts, password)
  }

  console.log('WalletProvider', status)

  const walletContext = {
    status,
    accounts,
    event,
    createWallet,
    unlockWallet,
    createAddress
  }
  
  return (
    <WalletContext.Provider value={walletContext}>
      {children}
    </WalletContext.Provider>
  )
}