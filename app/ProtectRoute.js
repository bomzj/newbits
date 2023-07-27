import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useWallet } from './WalletContext'

export default function ProtectRoute({children}) {
  const { push } = useRouter()
  const path = usePathname()
  const { status } = useWallet()
  
  const allowedPaths = {
    //  /coins or /coins/*
    loaded: /^\/coins(\/.*)?$/,
    //  /unlock-wallet
    locked: /\/unlock-wallet/,
    //  / or /create-wallet
    not_exists: /^(\/|\/create-wallet)$/
  }

  const redirectPaths = {
    loaded: '/coins',
    locked: '/unlock-wallet',
    not_exists: '/'
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