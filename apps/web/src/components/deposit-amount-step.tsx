'use client'

import { useState } from 'react'
import { IconAlertCircle, IconWallet } from '@tabler/icons-react'
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

interface DepositAmountStepProps {
  amount: string
  onAmountChange: (amount: string) => void
  onContinue: () => void
  minAmount?: number
  maxAmount?: number
}

export function DepositAmountStep({
  amount,
  onAmountChange,
  onContinue,
  minAmount = 50,
  maxAmount = 100000,
}: DepositAmountStepProps) {
  const [error, setError] = useState('')
  const quickAmounts = [50, 100, 500, 1000, 5000, 10000]

  const handleSubmit = () => {
    const numAmount = parseFloat(amount)
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (numAmount < minAmount) {
      setError(`Minimum deposit amount is $${minAmount}`)
      return
    }
    
    if (numAmount > maxAmount) {
      setError(`Maximum deposit amount is $${maxAmount.toLocaleString()}`)
      return
    }
    
    setError('')
    onContinue()
  }

  const handleQuickAmount = (amt: number) => {
    onAmountChange(amt.toString())
    setError('')
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <IconWallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Make a Deposit</CardTitle>
            <CardDescription>Enter the amount you want to deposit</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USD)</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-medium">
              $
            </span>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                onAmountChange(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="pl-10 text-2xl h-14 font-semibold"
              min="0"
              step="0.01"
              autoFocus
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Min: ${minAmount} • Max: ${maxAmount.toLocaleString()}
          </p>
        </div>

        <div className="space-y-3">
          <Label>Quick Amounts</Label>
          <div className="grid grid-cols-3 gap-3">
            {quickAmounts.map((amt) => (
              <Button
                key={amt}
                variant={amount === amt.toString() ? 'default' : 'outline'}
                onClick={() => handleQuickAmount(amt)}
                className="h-12 text-base font-semibold"
              >
                ${amt.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <IconAlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Instant Deposits Available
              </p>
              <p className="text-blue-800 dark:text-blue-200">
                Deposits are processed within 10-30 minutes. Choose from multiple payment methods in the next step.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-800">
            <IconAlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          className="w-full h-12 text-base font-semibold" 
          size="lg"
        >
          Continue to Payment Method
        </Button>
      </CardFooter>
    </Card>
  )
}