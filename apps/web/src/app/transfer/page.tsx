'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { TransferAmountStep } from '@/components/transfer-amount-step'
import { TransferRecipientStep } from '@/components/transfer-recipient-step'
import { TransferConfirmationStep } from '@/components/transfer-confirmation-step'
import { TransferSummaryCard } from '@/components/transfer-summary-card'
import { TransferProgressStepper, TransferStep } from '@/components/transfer-progress-stepper'

export default function TransferPage() {
  const [currentStep, setCurrentStep] = useState<TransferStep>('amount')
  const [amount, setAmount] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [note, setNote] = useState('')
  const [transferReference, setTransferReference] = useState('')

  const handleAmountContinue = () => {
    setCurrentStep('recipient')
  }

  const handleRecipientSubmit = async () => {
    // Submit transfer to API
    try {
      const token = localStorage.getItem('authToken')
      
      // TODO: Implement backend endpoint for transfer
      const response = await fetch(
        '',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            recipient_email: recipientEmail,
            recipient_name: recipientName,
            note: note || '',
          }),
        }
      )

      const data = await response.json()
      
      if (response.ok) {
        setTransferReference(data.reference || data.transaction_id || data.id || `TRN-${Date.now()}`)
        setCurrentStep('confirmation')
      } else {
        throw new Error(data.message || 'Failed to submit transfer')
      }
    } catch (error) {
      console.error('Transfer submission error:', error)
      alert('Failed to submit transfer. Please try again.')
      throw error
    }
  }

  const handleStepClick = (step: TransferStep) => {
    // Allow navigation to previous steps only
    const stepOrder: TransferStep[] = ['amount', 'recipient', 'confirmation']
    const currentIndex = stepOrder.indexOf(currentStep)
    const targetIndex = stepOrder.indexOf(step)
    
    if (targetIndex < currentIndex && step !== 'confirmation') {
      setCurrentStep(step)
    }
  }

  const handleBackToAmount = () => {
    setCurrentStep('amount')
  }

  const resetTransfer = () => {
    setCurrentStep('amount')
    setAmount('')
    setRecipientEmail('')
    setRecipientName('')
    setNote('')
    setTransferReference('')
  }

  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col pt-11">
            {/* Progress Stepper */}
            <TransferProgressStepper
              currentStep={currentStep}
              onStepClick={handleStepClick}
              allowNavigation={true}
            />

            {/* Main Content Area with Summary Card */}
            <div className="flex gap-6 py-4 md:py-6 px-4 lg:px-6">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Step 1: Amount */}
                {currentStep === 'amount' && (
                  <TransferAmountStep
                    amount={amount}
                    onAmountChange={setAmount}
                    onContinue={handleAmountContinue}
                    minAmount={1}
                    maxAmount={100000}
                  />
                )}

                {/* Step 2: Recipient */}
                {currentStep === 'recipient' && (
                  <TransferRecipientStep
                    amount={amount}
                    recipientEmail={recipientEmail}
                    onRecipientEmailChange={setRecipientEmail}
                    recipientName={recipientName}
                    onRecipientNameChange={setRecipientName}
                    note={note}
                    onNoteChange={setNote}
                    onSubmit={handleRecipientSubmit}
                    onBack={handleBackToAmount}
                  />
                )}

                {/* Step 3: Confirmation */}
                {currentStep === 'confirmation' && (
                  <TransferConfirmationStep
                    amount={amount}
                    recipientEmail={recipientEmail}
                    recipientName={recipientName}
                    note={note}
                    transferReference={transferReference}
                    onReset={resetTransfer}
                  />
                )}
              </div>

              {/* Sticky Summary Card - Hidden on confirmation step and mobile */}
              {currentStep !== 'confirmation' && (
                <div className="hidden xl:block w-80 flex-shrink-0">
                  <TransferSummaryCard
                    amount={amount}
                    recipientEmail={recipientEmail}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
