'use client'

import { useState } from 'react'
import {
  IconCopy,
  IconCheck,
  IconAlertCircle,
  IconArrowLeft,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { WithdrawalMethod } from '@/components/withdrawal-method-step'

interface WithdrawalAddressStepProps {
  amount: string
  method: WithdrawalMethod
  selectedNetwork: string
  onNetworkChange: (network: string) => void
  withdrawalAddress: string
  onAddressChange: (address: string) => void
  onSubmit: () => Promise<void>
  onBack: () => void
}

export function WithdrawalAddressStep({
  amount,
  method,
  selectedNetwork,
  onNetworkChange,
  withdrawalAddress,
  onAddressChange,
  onSubmit,
  onBack,
}: WithdrawalAddressStepProps) {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const numAmount = parseFloat(amount)
  const fee = method.feeType === 'flat' 
    ? method.feeValue 
    : (numAmount * method.feeValue) / 100
  const netAmount = numAmount - fee

  const validateAddress = (address: string) => {
    if (!address || address.trim().length === 0) {
      setError('Please enter a withdrawal address')
      return false
    }

    // Basic validation for different address types
    if (method.type === 'crypto') {
      if (address.length < 20) {
        setError('Address seems too short. Please check and try again.')
        return false
      }
    } else if (method.type === 'bank') {
      if (address.length < 10) {
        setError('Please enter a valid account number or IBAN')
        return false
      }
    }

    setError('')
    return true
  }

  const handleSubmit = async () => {
    if (!validateAddress(withdrawalAddress)) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit()
    } catch (err) {
      setIsSubmitting(false)
    }
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onAddressChange(e.target.value)
    if (error) setError('')
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <IconArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {method.type === 'crypto' ? 'Enter Withdrawal Address' : 'Enter Bank Details'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {method.type === 'crypto' 
              ? 'Provide the destination wallet address for your withdrawal' 
              : 'Provide your bank account details'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Withdrawal Method:</span>
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
                Make sure you enter an address for the correct network to avoid loss of funds
              </p>
            </div>
          )}

          {/* Address Input */}
          <div className="space-y-2">
            <Label htmlFor="withdrawal-address">
              {method.type === 'crypto' ? 'Wallet Address' : 'Account Details'}
            </Label>
            <Textarea
              id="withdrawal-address"
              placeholder={
                method.type === 'crypto'
                  ? 'Enter your withdrawal wallet address (e.g., 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1)'
                  : 'Enter your bank account number, IBAN, or other account details'
              }
              value={withdrawalAddress}
              onChange={handleAddressChange}
              className="font-mono text-sm min-h-24"
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
                <IconAlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {method.type === 'crypto'
                ? 'Double-check the address. Withdrawals cannot be reversed if sent to a wrong address.'
                : 'Make sure all details are correct. We cannot reverse transactions to incorrect accounts.'}
            </p>
          </div>

          {/* Important Info */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex gap-3">
              <IconAlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  {method.type === 'crypto' ? 'Crypto withdrawals are irreversible' : 'Bank transfers cannot be reversed'}
                </p>
                <p className="text-yellow-800 dark:text-yellow-200">
                  {method.type === 'crypto'
                    ? 'Once a withdrawal is submitted to the blockchain, it cannot be cancelled. Please verify the address before confirming.'
                    : 'Ensure all bank details are accurate before submitting. Incorrect details may result in failed transfers.'}
                </p>
              </div>
            </div>
          </div>

          {/* Processing Time Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm">
              <span className="font-medium text-blue-900 dark:text-blue-100">Processing time:</span>
              <span className="text-blue-800 dark:text-blue-200 ml-2">{method.processingTime}</span>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!withdrawalAddress || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Submit Withdrawal'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
