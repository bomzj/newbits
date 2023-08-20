import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
  
export default function Nav({ children }) {
  return (
    <nav className="container">
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/receive">Receive</Link></li>
        <li><Link href="/send">Send</Link></li>
      </ul>
      <ul>
        
      </ul>
    </nav>
  )
}