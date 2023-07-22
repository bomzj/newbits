import { useContext, createContext, useState, useEffect, useCallback } from 'react'
import { tryCatch, pipeWith, always, ifElse, identity, compose, curry,  otherwise,
  cond, either, is, andThen, or, bind, pipe, partialRight } from 'ramda'
import { Either } from 'ramda-fantasy'
import { isError, isOk } from './result'
import { useSessionStorage } from './useSessionStorage'
import { encrypt, decrypt } from './encryption'

export async function parseEncryptedLocalStorage(key, password) {
  const decryptOrPass = partialRight(
    async (data, password) => data && password ? decrypt(data, password) : data,
    [password]
  )

  return pipe(
    key => localStorage.getItem(key),
    decryptOrPass,
    andThen(JSON.parse),
    andThen(Either.Right),
    otherwise(Either.Left)
  )(key)
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
// where error: incorrect_password, wallet_not_exists(not_found)
// or status: loading, not_loaded, loaded with errors
export function WalletProvider({ children }) {
  /** @type [WalletStatus, React.Dispatch<WalletStatus>] */
  const [status, setStatus] = useState('loading')
  const [password, setPassword] = useSessionStorage('password')
  const [accounts, setAccounts] = useState()
  
  const loadWallet = useCallback(async () => {
    setStatus('loading')
    const result = await parseEncryptedLocalStorage('wallet', password) 
    
    const newStatus =
      isOk(result) && !result.value ? 'not_exists' :
      isError(result)               ? 'locked' 
                                    : 'loaded'

    setStatus(newStatus)
    setAccounts(accounts)
  }, [password])

  async function saveWallet() {
    password ? 
      await saveDataEncryptedToStorage('wallet', wallet, password) : 
      saveDataToStorage('wallet', wallet)
  }

  //reload locked wallet on password change only
  useEffect(() => {
    console.log('WalletProvider useEffect status:', status)
    loadWallet()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadWallet])

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