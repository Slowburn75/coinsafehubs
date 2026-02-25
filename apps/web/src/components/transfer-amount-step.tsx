'use client'

import { useState } from 'react'
import { IconAlertCircle, IconSend } from '@tabler/icons-react'
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

interface TransferAmountStepProps {
  amount: string
  onAmountChange: (amount: string) => void
  onContinue: () => void
  minAmount?: number
  maxAmount?: number
}

export function TransferAmountStep({
  amount,
  onAmountChange,
  onContinue,
  minAmount = 1,
  maxAmount = 100000,
}: TransferAmountStepProps) {
  const [error, setError] = useState('')
  const quickAmounts = [10, 50, 100, 500, 1000, 5000]

  const handleSubmit = () => {
    const numAmount = parseFloat(amount)
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (numAmount < minAmount) {
      setError(`Minimum transfer amount is $${minAmount}`)
      return
    }
    
    if (numAmount > maxAmount) {
      setError(`Maximum transfer amount is $${maxAmount.toLocaleString()}`)
      return
    }

    setError('')
    onContinue()
  }

  const handleQuickAmount = (quickAmount: number) => {
    onAmountChange(quickAmount.toString())
    setError('')
  }

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^\d.]/g, '')
    // Ensure only one decimal point
    const parts = sanitized.split('.')
    const formatted = parts.length > 2 ? `${parts[0]}.${parts[1]}` : sanitized
    
    onAmountChange(formatted)
    if (error) setError('')
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconSend className="h-5 w-5" />
          <div>
            <CardTitle>Transfer Amount</CardTitle>
            <CardDescription>
              Enter the amount you want to transfer
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USD)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="pl-8 text-lg"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <IconAlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Min: ${minAmount} | Max: ${maxAmount.toLocaleString()}
          </p>
        </div>

        {/* Quick Amount Buttons */}
        <div className="space-y-2">
          <Label>Quick amounts</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                type="button"
                variant={amount === quickAmount.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickAmount(quickAmount)}
                className="text-xs sm:text-sm"
              >
                ${quickAmount}
              </Button>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-medium">💡 Tip:</span> Transfers between coinsafehub users are instant and free!
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={!amount}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
}
