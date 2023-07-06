import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
  
export default function Nav({ children }) {
  return (
    <nav className="container">
      <ul>
        <li><strong>Newbits</strong></li>
        <li><Link href="/coins/send">Send</Link></li>
        <li><Link href="/coins/receive">Receive</Link></li>
      </ul>
      <ul>
        
      </ul>
    </nav>
  )
}