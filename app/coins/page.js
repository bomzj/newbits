'use client'

import { useState, useEffect, useCallback} from 'react'
import { useRouter } from 'next/navigation'
import { getPassword, loadWallet, useWallet, WithWallet } from '../wallet'

export default function CoinsPage() {
  const [ready, setReady] = useState(false)
  const { push } = useRouter()

  async function init() {
    const password = getPassword()
    const [error] = await loadWallet(password)
    
    if (error == 'not_found') push('/')
    else if (error == 'locked') push('/unlock-wallet')
    else setReady(true)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { init() }, [])

  return ready &&
    <h1>Coins</h1>
}

//export default WithWallet(CoinsPage)