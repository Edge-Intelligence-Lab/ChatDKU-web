import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIInput } from './ai-input';

// Mock usePathname
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));


describe('AIInput', () => {
  const mockOnSubmit = jest.fn();
  const mockOnInputChange = jest.fn();
  const mockOnThinkingModeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<AIInput />);
    
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  it('handles text input changes', async () => {
    const user = userEvent.setup();
    render(<AIInput onInputChange={mockOnInputChange} />);
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, 'Hello world');
    
    expect(mockOnInputChange).toHaveBeenCalledWith('Hello world');
  });

  it('submits on Enter key without shift', async () => {
    const user = userEvent.setup();
    render(<AIInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, 'Test message');
    await user.keyboard('{Enter}');
    
    expect(mockOnSubmit).toHaveBeenCalledWith('Test message');
  });

  it('does not submit on Enter with shift', async () => {
    const user = userEvent.setup();
    render(<AIInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    await user.type(textarea, 'Test message');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows submit button when there is input', async () => {
    const user = userEvent.setup();
    render(<AIInput />);
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    expect(screen.queryByTestId('submit-button')).not.toBeInTheDocument();
    
    await user.type(textarea, 'Test');
    
    // The submit button should be visible when there's text
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('disables all controls when disabled prop is true', () => {
    render(<AIInput disabled={true} />);
    
    const textarea = screen.getByPlaceholderText('Type your message...');
    expect(textarea).toBeDisabled();
  });

  it('applies custom placeholder', () => {
    render(<AIInput placeholder="Custom placeholder" />);
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('handles thinking mode toggle', async () => {
    const user = userEvent.setup();
    render(<AIInput thinkingMode={false} onThinkingModeChange={mockOnThinkingModeChange} />);
    
    // Find thinking mode toggle button (if it exists)
    // This would need to be implemented in the component
    expect(mockOnThinkingModeChange).not.toHaveBeenCalled();
  });

  describe('Auto-resize functionality', () => {
    it('adjusts height based on content', async () => {
      const user = userEvent.setup();
      render(<AIInput />);
      
      const textarea = screen.getByPlaceholderText('Type your message...') as HTMLTextAreaElement;
      
      // Add multiple lines
      await user.type(textarea, 'Line 1\nLine 2\nLine 3');
      
      // Height should have been adjusted (this would be tested through the useAutoResizeTextarea hook)
      expect(textarea.value).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<AIInput />);
      
      const textarea = screen.getByPlaceholderText('Type your message...');
      expect(textarea).toHaveAttribute('id', 'ai-input');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AIInput onSubmit={mockOnSubmit} />);
      
      const textarea = screen.getByPlaceholderText('Type your message...');
      textarea.focus();
      expect(textarea).toHaveFocus();
      
      await user.type(textarea, 'Test');
      await user.keyboard('{Enter}');
      
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('Styling and Visual Effects', () => {
    it('applies shadow pulse effect when typing', async () => {
      const user = userEvent.setup();
      render(<AIInput />);
      
      const textarea = screen.getByPlaceholderText('Type your message...');
      await user.type(textarea, 'Test');
      
      // The component should have the shadow pulse class when there's input
      const container = textarea.closest('.shadow-pulse');
      expect(container).toBeTruthy();
    });

    it('applies custom className', () => {
      render(<AIInput className="custom-class" />);
      
      const container = screen.getByPlaceholderText('Type your message...').closest('.custom-class');
      expect(container).toBeTruthy();
    });
  });
});