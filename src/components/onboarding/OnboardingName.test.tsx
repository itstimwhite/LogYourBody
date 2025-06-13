import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingName } from './OnboardingName';

// Mock Capacitor modules
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
  },
}));

vi.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: vi.fn(),
    notification: vi.fn(),
  },
  ImpactStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

describe('OnboardingName', () => {
  const mockOnComplete = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with all required elements', () => {
    render(
      <OnboardingName
        onComplete={mockOnComplete}
        currentStep={1}
        totalSteps={5}
      />
    );

    // Check heading and helper text
    expect(screen.getByText("What's your name?")).toBeInTheDocument();
    expect(screen.getByText("We'll use this to personalize your experience")).toBeInTheDocument();

    // Check progress indicator
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();

    // Check input field
    const input = screen.getByPlaceholderText('Enter your full name');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('autoCapitalize', 'words');
    expect(input).toHaveAttribute('autoCorrect', 'off');
    expect(input).toHaveAttribute('spellCheck', 'false');

    // Check continue button
    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeInTheDocument();
    expect(continueButton).toBeDisabled();
  });

  it('enables continue button when valid name is entered', async () => {
    const user = userEvent.setup();
    render(
      <OnboardingName
        onComplete={mockOnComplete}
        currentStep={1}
        totalSteps={5}
      />
    );

    const input = screen.getByPlaceholderText('Enter your full name');
    const continueButton = screen.getByRole('button', { name: /continue/i });

    // Initially disabled
    expect(continueButton).toBeDisabled();

    // Type a valid name
    await user.type(input, 'John Doe');
    
    // Should be enabled
    expect(continueButton).not.toBeDisabled();
  });

  it('validates full name requirement', async () => {
    const user = userEvent.setup();
    render(
      <OnboardingName
        onComplete={mockOnComplete}
        currentStep={1}
        totalSteps={5}
      />
    );

    const input = screen.getByPlaceholderText('Enter your full name');
    const continueButton = screen.getByRole('button', { name: /continue/i });

    // Type only first name
    await user.type(input, 'John');
    await user.tab(); // Trigger blur

    // Click continue
    await user.click(continueButton);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText('Please enter your full name (first and last)')).toBeInTheDocument();
    });

    // Should not call onComplete
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('validates minimum character requirement', async () => {
    const user = userEvent.setup();
    render(
      <OnboardingName
        onComplete={mockOnComplete}
        currentStep={1}
        totalSteps={5}
      />
    );

    const input = screen.getByPlaceholderText('Enter your full name');
    const continueButton = screen.getByRole('button', { name: /continue/i });

    // Type only one character
    await user.type(input, 'J');
    await user.tab(); // Trigger blur

    // Click continue
    await user.click(continueButton);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText('Please enter at least 2 characters')).toBeInTheDocument();
    });
  });

  it('validates special character restrictions', async () => {
    const user = userEvent.setup();
    render(
      <OnboardingName
        onComplete={mockOnComplete}
        currentStep={1}
        totalSteps={5}
      />
    );

    const input = screen.getByPlaceholderText('Enter your full name');
    
    // Type invalid characters
    await user.type(input, 'John123 Doe456');
    await user.tab(); // Trigger blur

    // Should show error
    await waitFor(() => {
      expect(screen.getByText('Please use only letters, hyphens, and apostrophes')).toBeInTheDocument();
    });
  });

  it('accepts valid names with hyphens and apostrophes', async () => {
    const user = userEvent.setup();
    render(
      <OnboardingName
        onComplete={mockOnComplete}
        currentStep={1}
        totalSteps={5}
      />
    );

    const input = screen.getByPlaceholderText('Enter your full name');
    const continueButton = screen.getByRole('button', { name: /continue/i });

    // Type valid name with special characters
    await user.type(input, "Jean-Pierre O'Connor");
    
    // Click continue
    await user.click(continueButton);

    // Should call onComplete with trimmed name
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith("Jean-Pierre O'Connor");
    });
  });

  it('handles Enter key to submit', async () => {
    const user = userEvent.setup();
    render(
      <OnboardingName
        onComplete={mockOnComplete}
        currentStep={1}
        totalSteps={5}
      />
    );

    const input = screen.getByPlaceholderText('Enter your full name');

    // Type valid name
    await user.type(input, 'Jane Smith');
    
    // Press Enter
    await user.keyboard('{Enter}');

    // Should call onComplete
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith('Jane Smith');
    });
  });

  it('shows back button when onBack is provided', () => {
    render(
      <OnboardingName
        onComplete={mockOnComplete}
        onBack={mockOnBack}
        currentStep={2}
        totalSteps={5}
      />
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <OnboardingName
        onComplete={mockOnComplete}
        onBack={mockOnBack}
        currentStep={2}
        totalSteps={5}
      />
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('preserves initial value', () => {
    render(
      <OnboardingName
        onComplete={mockOnComplete}
        currentStep={1}
        totalSteps={5}
        initialValue="Initial Name"
      />
    );

    const input = screen.getByPlaceholderText('Enter your full name');
    expect(input).toHaveValue('Initial Name');
  });

  it('has proper accessibility attributes', () => {
    render(
      <OnboardingName
        onComplete={mockOnComplete}
        currentStep={1}
        totalSteps={5}
      />
    );

    const input = screen.getByPlaceholderText('Enter your full name');
    expect(input).toHaveAttribute('aria-label', 'Full name');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    
    // Progress dots should be properly labeled
    const progressDots = screen.getAllByRole('generic').filter(el => 
      el.className.includes('rounded-full')
    );
    expect(progressDots.length).toBe(5);
  });

  it('clears error when valid input is entered after error', async () => {
    const user = userEvent.setup();
    render(
      <OnboardingName
        onComplete={mockOnComplete}
        currentStep={1}
        totalSteps={5}
      />
    );

    const input = screen.getByPlaceholderText('Enter your full name');
    const continueButton = screen.getByRole('button', { name: /continue/i });

    // Type invalid name
    await user.type(input, 'J');
    await user.click(continueButton);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText('Please enter at least 2 characters')).toBeInTheDocument();
    });

    // Type valid name
    await user.clear(input);
    await user.type(input, 'John Doe');

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Please enter at least 2 characters')).not.toBeInTheDocument();
    });
  });
});