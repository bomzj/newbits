import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useWallet } from './WalletContext'

export default function ProtectRoute({children}) {
  const { push } = useRouter()
  const path = usePathname()
  const { status } = useWallet()
  
  const allowedPaths = {
    // everything except /welcome, /create-wallet, /unlock-wallet
    loaded: /^(?!\/(?:unlock-wallet|create-wallet|welcome)(?:\/|$)).*$/,
    // allows /unlock-wallet
    locked: /\/unlock-wallet/,
    // allows /welcome or /create-wallet
    not_exists: /^(\/welcome|\/create-wallet)$/
  }

  const redirectPaths = {
    loaded: '/',
    locked: '/unlock-wallet',
    not_exists: '/welcome'
  }
  
  const shouldRedirect = !(allowedPaths[status] || /(?:)/).test(path)

  useEffect(() => {
    if (shouldRedirect) 
      push(redirectPaths[status])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  console.log('ProtectRoute', status)

  return shouldRedirect ? null : children
}