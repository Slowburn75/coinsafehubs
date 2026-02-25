'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { WithdrawalAmountStep } from '@/components/withdrawal-amount-step'
import { WithdrawalMethodStep, WithdrawalMethod } from '@/components/withdrawal-method-step'
import { WithdrawalAddressStep } from '@/components/withdrawal-address-step'
import { WithdrawalConfirmationStep } from '@/components/withdrawal-confirmation-step'
import { WithdrawalSummaryCard } from '@/components/withdrawal-summary-card'
import { WithdrawalProgressStepper, WithdrawalStep } from '@/components/withdrawal-progress-stepper'

export default function WithdrawalPage() {
  const [currentStep, setCurrentStep] = useState<WithdrawalStep>('amount')
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState('')
  const [withdrawalAddress, setWithdrawalAddress] = useState('')
  const [withdrawalReference, setWithdrawalReference] = useState('')

  const handleAmountContinue = () => {
    setCurrentStep('method')
  }

  const handleMethodSelect = (methodId: string, method: WithdrawalMethod) => {
    setSelectedMethod(method)
    
    // For crypto, select default network if available
    if (method.networks && method.networks.length > 0) {
      setSelectedNetwork(method.networks[0])
    }
    
    setCurrentStep('address')
  }

  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network)
  }

  const handleAddressSubmit = async () => {
    // Submit withdrawal to API
    try {
      const token = localStorage.getItem('authToken')
      
      // TODO: Implement backend endpoint for withdrawal
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
            withdrawal_method: selectedMethod!.name,
            network: selectedNetwork || selectedMethod!.name,
            withdrawal_address: withdrawalAddress,
          }),
        }
      )

      const data = await response.json()
      
      if (response.ok) {
        setWithdrawalReference(data.reference || data.transaction_id || data.id || `WTH-${Date.now()}`)
        setCurrentStep('confirmation')
      } else {
        throw new Error(data.message || 'Failed to submit withdrawal')
      }
    } catch (error) {
      console.error('Withdrawal submission error:', error)
      // Show error to user
      alert('Failed to submit withdrawal. Please try again.')
      throw error
    }
  }

  const handleStepClick = (step: WithdrawalStep) => {
    // Allow navigation to previous steps only
    const stepOrder: WithdrawalStep[] = ['amount', 'method', 'address', 'confirmation']
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

  const resetWithdrawal = () => {
    setCurrentStep('amount')
    setAmount('')
    setSelectedMethod(null)
    setSelectedNetwork('')
    setWithdrawalAddress('')
    setWithdrawalReference('')
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
            <WithdrawalProgressStepper
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
                  <WithdrawalAmountStep
                    amount={amount}
                    onAmountChange={setAmount}
                    onContinue={handleAmountContinue}
                    minAmount={50}
                    maxAmount={100000}
                  />
                )}

                {/* Step 2: Method Selection */}
                {currentStep === 'method' && (
                  <WithdrawalMethodStep
                    amount={amount}
                    selectedMethod={selectedMethod?.id || null}
                    onMethodSelect={handleMethodSelect}
                    onBack={handleBackToAmount}
                  />
                )}

                {/* Step 3: Withdrawal Address */}
                {currentStep === 'address' && selectedMethod && (
                  <WithdrawalAddressStep
                    amount={amount}
                    method={selectedMethod}
                    selectedNetwork={selectedNetwork}
                    onNetworkChange={handleNetworkChange}
                    withdrawalAddress={withdrawalAddress}
                    onAddressChange={setWithdrawalAddress}
                    onSubmit={handleAddressSubmit}
                    onBack={handleBackToMethod}
                  />
                )}

                {/* Step 4: Confirmation */}
                {currentStep === 'confirmation' && selectedMethod && (
                  <WithdrawalConfirmationStep
                    amount={amount}
                    method={selectedMethod}
                    withdrawalAddress={withdrawalAddress}
                    withdrawalReference={withdrawalReference}
                    onReset={resetWithdrawal}
                  />
                )}
              </div>

              {/* Sticky Summary Card - Hidden on confirmation step and mobile */}
              {currentStep !== 'confirmation' && (
                <div className="hidden xl:block w-80 flex-shrink-0">
                  <WithdrawalSummaryCard
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
