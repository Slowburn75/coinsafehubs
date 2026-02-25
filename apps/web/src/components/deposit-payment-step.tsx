'use client'

import { useState, useEffect } from 'react'
import {
  IconCopy,
  IconCheck,
  IconAlertCircle,
  IconArrowLeft,
  IconClock,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PaymentMethod } from '@/components/deposit-method-step'

interface DepositPaymentStepProps {
  amount: string
  method: PaymentMethod
  selectedNetwork: string
  onNetworkChange: (network: string) => void
  onContinue: () => void
  onBack: () => void
}

export function DepositPaymentStep({
  amount,
  method,
  selectedNetwork,
  onNetworkChange,
  onContinue,
  onBack,
}: DepositPaymentStepProps) {
  const [copied, setCopied] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes in seconds

  // Hardcoded wallet addresses for each payment method and network
  const walletAddresses: Record<string, Record<string, string>> = {
    bitcoin: {
      BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      Lightning: 'lnbc10u1p3pj257pp5qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
    },
    ethereum: {
      ERC20: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      Polygon: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    },
    usdt: {
      ERC20: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      TRC20: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
      BSC: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    },
    usdc: {
      ERC20: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      Polygon: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      Solana: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    },
    bnb: {
      BSC: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    },
    litecoin: {
      LTC: 'ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    },
  }

  const walletAddress = method.type === 'crypto' 
    ? walletAddresses[method.id]?.[selectedNetwork] || ''
    : ''

  const numAmount = parseFloat(amount)
  const fee = method.feeType === 'flat' 
    ? method.feeValue 
    : (numAmount * method.feeValue) / 100
  const netAmount = numAmount - fee

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0 || method.type !== 'crypto') return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, method.type])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <IconArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Complete Your Payment</h2>
          <p className="text-muted-foreground mt-1">
            {method.type === 'crypto' 
              ? 'Send cryptocurrency to the address below' 
              : 'Follow the instructions below to complete payment'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Payment Method:</span>
              <Badge variant="outline">{method.name}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">${numAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction Fee:</span>
              <span>${fee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-medium">You'll Receive:</span>
              <span className="font-semibold text-green-600 text-lg">
                ${netAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Network Selection for Crypto */}
          {method.type === 'crypto' && method.networks && method.networks.length > 1 && (
            <div className="space-y-2">
              <Label>Select Network</Label>
              <div className="grid grid-cols-3 gap-2">
                {method.networks.map((network) => (
                  <Button
                    key={network}
                    variant={selectedNetwork === network ? 'default' : 'outline'}
                    onClick={() => onNetworkChange(network)}
                    className="w-full"
                  >
                    {network}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Make sure to send on the correct network to avoid loss of funds
              </p>
            </div>
          )}

          {/* Crypto Payment Instructions */}
          {method.type === 'crypto' && (
            <div className="space-y-4">
              {!walletAddress ? (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
                  <IconAlertCircle className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1">
                    No wallet address configured for {method.name} on {selectedNetwork} network
                  </div>
                </div>
              ) : (
                <>
                  {/* Wallet Address */}
                  <div className="space-y-2">
                    <Label htmlFor="wallet-address">Deposit Address</Label>
                    <div className="relative">
                      <Input
                        id="wallet-address"
                        value={walletAddress}
                        readOnly
                        className="pr-24 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => copyToClipboard(walletAddress)}
                      >
                        {copied ? (
                          <>
                            <IconCheck className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-green-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <IconCopy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center gap-3 p-6 bg-muted rounded-lg">
                    <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                      {/* QR Code placeholder - you can use qrcode.react here */}
                      <div className="text-center">
                        <svg className="h-24 w-24 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        <p className="text-xs text-muted-foreground mt-2">QR Code</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Scan with your crypto wallet app
                    </p>
                  </div>

                  {/* Time Remaining */}
                  {timeRemaining > 0 && (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <IconClock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Address expires in{' '}
                        <span className={`font-semibold ${timeRemaining < 300 ? 'text-red-600' : 'text-foreground'}`}>
                          {formatTime(timeRemaining)}
                        </span>
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Bank Wire Instructions */}
          {method.type === 'bank' && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                Bank Wire Transfer Details
              </h4>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[140px_1fr] gap-2">
                  <span className="text-muted-foreground">Bank Name:</span>
                  <span className="font-medium">Chase Bank, N.A.</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-2">
                  <span className="text-muted-foreground">Account Name:</span>
                  <span className="font-medium">CoinSafe Hub Inc.</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-2">
                  <span className="text-muted-foreground">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">1234567890</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard('1234567890')}
                    >
                      {copied ? (
                        <IconCheck className="h-3 w-3 text-green-600" />
                      ) : (
                        <IconCopy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-2">
                  <span className="text-muted-foreground">Routing Number:</span>
                  <span className="font-mono font-medium">021000021</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-2">
                  <span className="text-muted-foreground">SWIFT Code:</span>
                  <span className="font-mono font-medium">CHASUS33</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] gap-2">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-medium">Your Account Email</span>
                </div>
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <IconAlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                Important Instructions
              </p>
              <ul className="space-y-1 text-yellow-800 dark:text-yellow-200 list-disc list-inside">
                <li>Send exactly <strong>${numAmount.toFixed(2)}</strong> to the address above</li>
                <li>Processing time: <strong>{method.processingTime}</strong></li>
                {method.type === 'crypto' && (
                  <>
                    <li>Only send {method.name} on <strong>{selectedNetwork}</strong> network</li>
                    <li>Minimum 3 network confirmations required</li>
                  </>
                )}
                <li>Keep your transaction receipt for verification</li>
                {method.type === 'bank' && (
                  <li>Include your account email in the reference field</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Change Method
          </Button>
          <Button onClick={onContinue} className="flex-1" disabled={method.type === 'crypto' && !walletAddress}>
            I've Completed Payment
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}