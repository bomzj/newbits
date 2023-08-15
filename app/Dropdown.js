import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useWallet } from './WalletContext'

export default function ProtectRoute({ items, onItemSelect }) {
  const { push } = useRouter()

  useEffect(() => {
    if (shouldRedirect) 
      push(redirectPaths[status])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <details className="dropdown">
      <summary>Dropdown</summary>
      <ul>
        {items.map(account => 
          <li key={account.address}>
            <a href="#" onClick={onFromAddressClick}>
              <hgroup>
                <h5>{account.address}</h5>
                <p>{account.balance} BTC</p>
              </hgroup>
            </a>
          </li>
        )}
      </ul>
    </details>
  )
}