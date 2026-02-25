'use client'

import { IconCheck } from '@tabler/icons-react'

export type DepositStep = 'amount' | 'method' | 'payment' | 'upload' | 'confirmation'

interface Step {
  id: DepositStep
  label: string
  description: string
}

const steps: Step[] = [
  { id: 'amount', label: 'Amount', description: 'Enter deposit amount' },
  { id: 'method', label: 'Method', description: 'Choose payment method' },
  { id: 'payment', label: 'Payment', description: 'Complete payment' },
  { id: 'upload', label: 'Upload', description: 'Submit proof' },
  { id: 'confirmation', label: 'Done', description: 'Confirmation' },
]

interface DepositProgressStepperProps {
  currentStep: DepositStep
  onStepClick?: (step: DepositStep) => void
  allowNavigation?: boolean
}

export function DepositProgressStepper({
  currentStep,
  onStepClick,
  allowNavigation = false,
}: DepositProgressStepperProps) {
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
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop: Full stepper */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index)
            const isClickable = allowNavigation && index <= currentStepIndex

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => isClickable && onStepClick?.(step.id)}
                    disabled={!isClickable}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                      transition-all duration-200
                      ${status === 'completed' 
                        ? 'bg-primary text-primary-foreground' 
                        : status === 'current'
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                      }
                      ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                    `}
                  >
                    {status === 'completed' ? (
                      <IconCheck className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </button>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${
                      status === 'current' ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground hidden lg:block mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 mb-8">
                    <div
                      className={`h-full transition-all duration-300 ${
                        index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}