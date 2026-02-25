'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DepositAmountStep } from '@/components/deposit-amount-step'
import { DepositMethodStep, PaymentMethod } from '@/components/deposit-method-step'
import { DepositPaymentStep } from '@/components/deposit-payment-step'
import { DepositUploadStep } from '@/components/deposit-upload-step'
import { DepositConfirmationStep } from '@/components/deposit-confirmation-step'
import { DepositSummaryCard } from '@/components/deposit-summary-card'
import { DepositProgressStepper, DepositStep } from '@/components/deposit-progress-stepper'

export default function DepositPage() {
  const [currentStep, setCurrentStep] = useState<DepositStep>('amount')
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState('')
  const [transactionHash, setTransactionHash] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [depositReference, setDepositReference] = useState('')

  const handleAmountContinue = () => {
    setCurrentStep('method')
  }

  const handleMethodSelect = (methodId: string, method: PaymentMethod) => {
    setSelectedMethod(method)
    
    // For crypto, select default network if available
    if (method.networks && method.networks.length > 0) {
      setSelectedNetwork(method.networks[0])
    }
    
    setCurrentStep('payment')
  }

  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network)
  }

  const handlePaymentContinue = () => {
    setCurrentStep('upload')
  }

  const handleUploadSubmit = async () => {
    // Submit deposit to API
    try {
      const token = localStorage.getItem('authToken')
      const formData = new FormData()
      
      formData.append('amount', amount)
      formData.append('payment_method', selectedMethod!.name) // Send method name
      formData.append('network', selectedNetwork || selectedMethod!.name)
      
      if (transactionHash) {
        formData.append('transaction_hash', transactionHash)
      }
      
      if (uploadedFile) {
        formData.append('receipt', uploadedFile)
      }
      
      if (notes) {
        formData.append('notes', notes)
      }

      // TODO: Implement backend endpoint for deposit
      const response = await fetch(
        '',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      )

      const data = await response.json()
      
      if (response.ok) {
        setDepositReference(data.reference || data.transaction_id || data.id || `DEP-${Date.now()}`)
        setCurrentStep('confirmation')
      } else {
        throw new Error(data.message || 'Failed to submit deposit')
      }
    } catch (error) {
      console.error('Deposit submission error:', error)
      // Show error to user
      alert('Failed to submit deposit. Please try again.')
      throw error
    }
  }

  const handleStepClick = (step: DepositStep) => {
    // Allow navigation to previous steps only
    const stepOrder: DepositStep[] = ['amount', 'method', 'payment', 'upload', 'confirmation']
    const currentIndex = stepOrder.indexOf(currentStep)
    const targetIndex = stepOrder.indexOf(step)
    
    if (targetIndex < currentIndex && step !== 'confirmation') {
      setCurrentStep(step)
    }
  }

  const handleBackToAmount = () => {
    setCurrentStep('amount')
  }

  const handleBackToMethod = () => {
    setCurrentStep('method')
  }

  const handleBackToPayment = () => {
    setCurrentStep('payment')
  }

  const resetDeposit = () => {
    setCurrentStep('amount')
    setAmount('')
    setSelectedMethod(null)
    setSelectedNetwork('')
    setTransactionHash('')
    setUploadedFile(null)
    setNotes('')
    setDepositReference('')
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
            <DepositProgressStepper
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
                  <DepositAmountStep
                    amount={amount}
                    onAmountChange={setAmount}
                    onContinue={handleAmountContinue}
                    minAmount={50}
                    maxAmount={100000}
                  />
                )}

                {/* Step 2: Method Selection */}
                {currentStep === 'method' && (
                  <DepositMethodStep
                    amount={amount}
                    selectedMethod={selectedMethod?.id || null}
                    onMethodSelect={handleMethodSelect}
                    onBack={handleBackToAmount}
                  />
                )}

                {/* Step 3: Payment Instructions */}
                {currentStep === 'payment' && selectedMethod && (
                  <DepositPaymentStep
                    amount={amount}
                    method={selectedMethod}
                    selectedNetwork={selectedNetwork}
                    onNetworkChange={handleNetworkChange}
                    onContinue={handlePaymentContinue}
                    onBack={handleBackToMethod}
                  />
                )}

                {/* Step 4: Upload Receipt */}
                {currentStep === 'upload' && selectedMethod && (
                  <DepositUploadStep
                    amount={amount}
                    method={selectedMethod}
                    transactionHash={transactionHash}
                    onTransactionHashChange={setTransactionHash}
                    uploadedFile={uploadedFile}
                    onFileUpload={setUploadedFile}
                    notes={notes}
                    onNotesChange={setNotes}
                    onSubmit={handleUploadSubmit}
                    onBack={handleBackToPayment}
                  />
                )}

                {/* Step 5: Confirmation */}
                {currentStep === 'confirmation' && selectedMethod && (
                  <DepositConfirmationStep
                    amount={amount}
                    method={selectedMethod}
                    depositReference={depositReference}
                    onReset={resetDeposit}
                  />
                )}
              </div>

              {/* Sticky Summary Card - Hidden on confirmation step and mobile */}
              {currentStep !== 'confirmation' && (
                <div className="hidden xl:block w-80 flex-shrink-0">
                  <DepositSummaryCard
                    amount={amount}
                    method={selectedMethod}
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