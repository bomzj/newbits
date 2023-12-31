import { useContext, createContext, useState, useEffect, useCallback } from 'react'
import { tryCatch, pipeWith, always, ifElse, identity, compose, prop, pipe,
  cond, either, is, or, bind, invoker, map, partialRight, sort, descend } from 'ramda'
import { isError, isOk } from './result'
import { useSessionStorage } from './useSessionStorage'
import { decryptFromLocalStorage, encryptToLocalStorage } from './encryptedLocalStorage'
import { 
  generatePrivateKey, 
  getAddress, 
  fetchBalances, 
  validateAddress as _validateAddress,
  sendTx as sendTx} from './bitcoin'

const WalletContext = createContext()

/** 
 * @typedef {'loading' | 'not_exists' | 'locked' | 'loaded'} WalletStatus
 * @typedef {{ code, address, privateKey, balance }} Account
 * @typedef {{ 
   status: WalletStatus, 
   error,
   accounts: Account[],
   tx: Object,
   event: Event,
   createWallet(password),
   unlockWallet(password),
   createAddress(code),
   validateAddress(code, address),
   setTx(tx),
   accountBy(address: string): Account,
   sendTransaction({ code, fromAddress, toAddress, amount })
  }} Wallet 
*/

/** 
 * @typedef {
  'creating_address' | 'address_created' |
  'sending_transaction' | 'transaction_sent' | 'transaction_failed'
  } 
 Event 
 
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
  const [password, setPassword] = useState() //useSessionStorage('password')
  /** @type [Account[], React.Dispatch<Account[]>] */
  const [accounts, setAccounts] = useState([])
  const [tx, setTx] = useState()

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
    const newAccounts = sortByValue([...accounts, account])
    await saveWallet(newAccounts, password)
    setAccounts(newAccounts)
    setEvent('address_created')
  }

  function validateAddress(code, address) {
    return _validateAddress(address, true)
  }

  function sortByValue(accounts) {
    const byBalance = descend(prop('balance'))
    return sort(byBalance, accounts)
  }

  async function syncBalances() {
    const addresses = accounts.map(i => i.address)
    const balancesResult = await fetchBalances(addresses, true)
    
    if (isOk(balancesResult)) {
      const balanceBy = addr =>
        balancesResult.value.find(i => i.address == addr).balance

      // const newAccounts = accounts.map(account => ({ 
      //   ...account, 
      //   balance: balanceBy(account.address)
      // }))

      const newAccounts = pipe(
        map(account => ({ ...account, balance: balanceBy(account.address)})),
        sortByValue
      )(accounts)

      setAccounts(newAccounts)
      saveWallet(newAccounts, password)
    } else {
      console.error('Failed to sync balances.')
    }
  }

  function accountBy(address) {
    return accounts.find(i => i.address == address)
  }

  console.log('WalletProvider', status)

  const walletContext = {
    status,
    accounts,
    tx,
    event,

    createWallet,
    unlockWallet,
    createAddress,
    validateAddress,
    setTx,
    accountBy
  }
  
  return (
    <WalletContext.Provider value={walletContext}>
      {children}
    </WalletContext.Provider>
  )
}