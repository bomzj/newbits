'use client'
import { useState, useEffect } from 'react'
import { WalletProvider } from './WalletContext'
import WaitWalletInit from './WaitWalletInit'
import ProtectRoute from './ProtectRoute'
import Nav from './Nav'

export default function WalletLayout({ children }) {
  console.log('WalletLayout')
  return (
    <WalletProvider>
      <WaitWalletInit>
        <ProtectRoute>
          <main className="container">
            {children}
          </main>
          <Nav />
        </ProtectRoute>
      </WaitWalletInit>
    </WalletProvider>
  )
}