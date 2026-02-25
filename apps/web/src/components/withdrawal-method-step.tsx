'use client'

import { useState } from 'react'
import {
  IconWallet,
  IconCurrencyBitcoin,
  IconCurrencyEthereum,
  IconCurrencyDollar,
  IconClock,
  IconAlertCircle,
  IconArrowLeft,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface WithdrawalMethod {
  id: string
  name: string
  type: 'crypto' | 'bank'
  icon: React.ReactNode
  processingTime: string
  fee: string
  feeType: 'percentage' | 'flat'
  feeValue: number
  minAmount: number
  maxAmount: number
  recommended?: boolean
  networks?: string[]
  description?: string
}

const withdrawalMethods: WithdrawalMethod[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    type: 'crypto',
    icon: <IconCurrencyBitcoin className="h-8 w-8 text-orange-500" />,
    processingTime: '10-30 mins',
    fee: '1%',
    feeType: 'percentage',
    feeValue: 1,
    minAmount: 50,
    maxAmount: 50000,
    recommended: true,
    networks: ['BTC', 'Lightning'],
    description: 'Fast and secure blockchain payments'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    type: 'crypto',
    icon: <IconCurrencyEthereum className="h-8 w-8 text-blue-600" />,
    processingTime: '5-15 mins',
    fee: '1.5%',
    feeType: 'percentage',
    feeValue: 1.5,
    minAmount: 50,
    maxAmount: 50000,
    networks: ['ERC20', 'Polygon'],
    description: 'Multiple network options available'
  },
  {
    id: 'usdt',
    name: 'USDT (Tether)',
    type: 'crypto',
    icon: <IconCurrencyDollar className="h-8 w-8 text-green-600" />,
    processingTime: '5-15 mins',
    fee: '1%',
    feeType: 'percentage',
    feeValue: 1,
    minAmount: 50,
    maxAmount: 100000,
    networks: ['ERC20', 'TRC20', 'BSC'],
    description: 'Stablecoin - minimal price fluctuation'
  },
  {
    id: 'usdc',
    name: 'USDC',
    type: 'crypto',
    icon: <IconCurrencyDollar className="h-8 w-8 text-blue-500" />,
    processingTime: '5-15 mins',
    fee: '1%',
    feeType: 'percentage',
    feeValue: 1,
    minAmount: 50,
    maxAmount: 100000,
    networks: ['ERC20', 'Polygon', 'Solana'],
    description: 'USD-backed stablecoin'
  },
  {
    id: 'bnb',
    name: 'BNB (Binance Coin)',
    type: 'crypto',
    icon: <IconWallet className="h-8 w-8 text-yellow-600" />,
    processingTime: '5-10 mins',
    fee: '1.2%',
    feeType: 'percentage',
    feeValue: 1.2,
    minAmount: 50,
    maxAmount: 50000,
    networks: ['BSC'],
    description: 'Low fees on Binance Smart Chain'
  },
  {
    id: 'litecoin',
    name: 'Litecoin',
    type: 'crypto',
    icon: <IconCurrencyBitcoin className="h-8 w-8 text-gray-600" />,
    processingTime: '10-20 mins',
    fee: '1%',
    feeType: 'percentage',
    feeValue: 1,
    minAmount: 50,
    maxAmount: 50000,
    networks: ['LTC'],
    description: 'Reliable and fast transactions'
  },
  {
    id: 'bank-wire',
    name: 'Bank Wire Transfer',
    type: 'bank',
    icon: <IconCurrencyDollar className="h-8 w-8 text-purple-600" />,
    processingTime: '1-3 business days',
    fee: '$25',
    feeType: 'flat',
    feeValue: 25,
    minAmount: 500,
    maxAmount: 500000,
    description: 'Traditional bank transfer for larger amounts'
  },
]

interface WithdrawalMethodStepProps {
  amount: string
  selectedMethod: string | null
  onMethodSelect: (methodId: string, method: WithdrawalMethod) => void
  onBack: () => void
}

export function WithdrawalMethodStep({
  amount,
  selectedMethod,
  onMethodSelect,
  onBack,
}: WithdrawalMethodStepProps) {
  const [error, setError] = useState('')
  const numAmount = parseFloat(amount || '0')

  const calculateFee = (method: WithdrawalMethod) => {
    if (method.feeType === 'flat') {
      return method.feeValue
    }
    return (numAmount * method.feeValue) / 100
  }

  const calculateNetAmount = (method: WithdrawalMethod) => {
    return numAmount - calculateFee(method)
  }

  const handleMethodClick = (method: WithdrawalMethod) => {
    if (numAmount < method.minAmount) {
      setError(`Minimum withdrawal for ${method.name} is $${method.minAmount}`)
      return
    }
    
    if (numAmount > method.maxAmount) {
      setError(`Maximum withdrawal for ${method.name} is $${method.maxAmount.toLocaleString()}`)
      return
    }
    
    setError('')
    onMethodSelect(method.id, method)
  }

  const isMethodDisabled = (method: WithdrawalMethod) => {
    return numAmount < method.minAmount || numAmount > method.maxAmount
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
        >
          <IconArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Select Withdrawal Method</h2>
          <p className="text-muted-foreground mt-1">
            Withdrawing <span className="font-semibold text-foreground">${numAmount.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* Withdrawal Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {withdrawalMethods.map((method) => {
          const fee = calculateFee(method)
          const netAmount = calculateNetAmount(method)
          const isDisabled = isMethodDisabled(method)
          
          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all ${
                isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : selectedMethod === method.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'hover:border-primary hover:shadow-md'
              }`}
              onClick={() => !isDisabled && handleMethodClick(method)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      {method.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{method.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-1">
                        <IconClock className="h-3.5 w-3.5" />
                        {method.processingTime}
                      </CardDescription>
                    </div>
                  </div>
                  {method.recommended && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Recommended
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {method.description && (
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                )}
                
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaction fee:</span>
                    <span className="font-medium">${fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You'll receive:</span>
                    <span className="font-semibold text-green-600">
                      ${netAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>Limits:</span>
                  <span>${method.minAmount.toLocaleString()} - ${method.maxAmount.toLocaleString()}</span>
                </div>

                {method.networks && method.networks.length > 1 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {method.networks.map((network) => (
                      <Badge key={network} variant="outline" className="text-xs">
                        {network}
                      </Badge>
                    ))}
                  </div>
                )}

                {isDisabled && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded-md mt-3">
                    <IconAlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>
                      {numAmount < method.minAmount 
                        ? `Minimum $${method.minAmount} required`
                        : `Maximum $${method.maxAmount.toLocaleString()} exceeded`
                      }
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-4 rounded-md border border-red-200 dark:border-red-800">
          <IconAlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Info Section */}
      <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
        <p className="font-medium">💡 Tips for choosing a withdrawal method:</p>
        <ul className="space-y-1 text-muted-foreground ml-4">
          <li>• Choose crypto for faster processing (5-30 minutes)</li>
          <li>• Bank wire is best for large amounts ($500+)</li>
          <li>• Stablecoins (USDT, USDC) have consistent value</li>
          <li>• Lower fees mean more money to your account</li>
        </ul>
      </div>
    </div>
  )
}
