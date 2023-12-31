'use client'
import { useState, useEffect } from 'react'
import { WalletProvider } from './WalletContext'
import WaitWalletInit from './WaitWalletInit'
import ProtectRoute from './ProtectRoute'
import Nav from './Nav'
import Image from 'next/image'
import Link from 'next/link'

export default function WalletLayout({ children }) {
  console.log('WalletLayout')
  return (
    <WalletProvider>
      <WaitWalletInit>
        <ProtectRoute>
          <Nav />
          <main className="container">
            {children}
          </main>
        </ProtectRoute>
      </WaitWalletInit>
    </WalletProvider>
  )
}