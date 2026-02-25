'use client'

import { useState } from 'react'
import {
  IconAlertCircle,
  IconArrowLeft,
  IconSearch,
  IconMail,
  IconUser,
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
import { Separator } from '@/components/ui/separator'

interface TransferRecipientStepProps {
  amount: string
  recipientEmail: string
  onRecipientEmailChange: (email: string) => void
  recipientName: string
  onRecipientNameChange: (name: string) => void
  note: string
  onNoteChange: (note: string) => void
  onSubmit: () => Promise<void>
  onBack: () => void
}

export function TransferRecipientStep({
  amount,
  recipientEmail,
  onRecipientEmailChange,
  recipientName,
  onRecipientNameChange,
  note,
  onNoteChange,
  onSubmit,
  onBack,
}: TransferRecipientStepProps) {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchAttempted, setSearchAttempted] = useState(false)

  const numAmount = parseFloat(amount)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSearchRecipient = async () => {
    if (!recipientEmail) {
      setError('Please enter an email address')
      return
    }

    if (!validateEmail(recipientEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSearching(true)
    setSearchAttempted(true)
    setError('')

    try {
      // TODO: Implement backend endpoint for user search
      const token = localStorage.getItem('authToken')
      const response = await fetch(
        ``,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        onRecipientNameChange(data.name || data.username || 'User')
      } else if (response.status === 404) {
        setError(`User with email ${recipientEmail} not found`)
      } else {
        setError('Failed to search for recipient')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('An error occurred while searching for the recipient')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async () => {
    if (!recipientEmail) {
      setError('Please enter recipient email')
      return
    }

    if (!validateEmail(recipientEmail)) {
      setError('Please enter a valid email address')
      return
    }

    if (!recipientName) {
      setError('Please search for and select a recipient')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit()
    } catch (err) {
      setIsSubmitting(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRecipientEmailChange(e.target.value)
    if (error) setError('')
    setSearchAttempted(false)
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <IconArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Transfer to Recipient</h2>
          <p className="text-muted-foreground mt-1">
            Enter the recipient's email address
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold">${numAmount.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-medium">Processing Fee:</span>
              <span className="font-semibold text-green-600">
                Free
              </span>
            </div>
          </div>

          {/* Recipient Email Input */}
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Recipient Email</Label>
            <div className="flex gap-2">
              <Input
                id="recipient-email"
                type="email"
                placeholder="Enter recipient's email address"
                value={recipientEmail}
                onChange={handleEmailChange}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSearchRecipient}
                disabled={isSearching || !recipientEmail}
              >
                <IconSearch className="h-4 w-4" />
              </Button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-md">
                <IconAlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Recipient Name Display */}
          {recipientName && searchAttempted && (
            <div className="space-y-2">
              <Label htmlFor="recipient-name">Recipient Name</Label>
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-200 dark:border-green-800">
                <IconUser className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    {recipientName}
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {recipientEmail}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Optional Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note for the recipient (optional)"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="min-h-20"
            />
            <p className="text-xs text-muted-foreground">
              This note will be visible to the recipient
            </p>
          </div>

          {/* Info Section */}
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              ℹ️ About Transfers
            </p>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Transfers are instant - funds arrive immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>No fees charged for transfers between coinsafehub users</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span>Recipient must have an active coinsafehub account</span>
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!recipientEmail || !recipientName || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Review Transfer'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
