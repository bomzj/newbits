import { useState, useEffect } from 'react'
import { useWallet } from './WalletContext'

export default function WaitWalletInit({ children }) {
  const { status } = useWallet()
  const [shouldRenderChildren, setShouldRenderChildren] = useState(false)

  useEffect(() => {
    if (status != 'loading') setShouldRenderChildren(true)
  }, [status])

  console.log('WaitWalletInit', status)

  return shouldRenderChildren ? children : null
}