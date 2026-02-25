'use client'

import { IconCheck } from '@tabler/icons-react'

export type WithdrawalStep = 'amount' | 'method' | 'address' | 'confirmation'

interface Step {
  id: WithdrawalStep
  label: string
  description: string
}

const steps: Step[] = [
  { id: 'amount', label: 'Amount', description: 'Enter withdrawal amount' },
  { id: 'method', label: 'Method', description: 'Choose withdrawal method' },
  { id: 'address', label: 'Address', description: 'Provide destination' },
  { id: 'confirmation', label: 'Done', description: 'Confirmation' },
]

interface WithdrawalProgressStepperProps {
  currentStep: WithdrawalStep
  onStepClick?: (step: WithdrawalStep) => void
  allowNavigation?: boolean
}

export function WithdrawalProgressStepper({
  currentStep,
  onStepClick,
  allowNavigation = false,
}: WithdrawalProgressStepperProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)

  const getStepStatus = (index: number) => {
    if (index < currentStepIndex) return 'completed'
    if (index === currentStepIndex) return 'current'
    return 'upcoming'
  }

  return (
    <div className="w-full px-4 lg:px-6 pb-6">
      <div className="max-w-4xl mx-auto">
        {/* Mobile: Simple progress bar */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {steps[currentStepIndex].label}
            </span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Desktop: Detailed stepper */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(index)
              const isClickable = allowNavigation && status === 'completed'

              return (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <button
                    onClick={() => isClickable && onStepClick?.(step.id)}
                    disabled={!isClickable}
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${
                        status === 'completed'
                          ? 'border-primary bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90'
                          : status === 'current'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                      }
                    `}
                  >
                    {status === 'completed' ? (
                      <IconCheck className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </button>

                  {/* Step Info */}
                  <div className="ml-3 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        status === 'current'
                          ? 'text-foreground'
                          : status === 'completed'
                            ? 'text-muted-foreground'
                            : 'text-muted-foreground/70'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-xs ${
                        status === 'current'
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/50'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-2 h-1 bg-muted rounded-full" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
