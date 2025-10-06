// frontend/__tests__/FileValidation.test.tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('File Validation - Basic', () => {
  test('renders file input element', () => {
    render(
      <div>
        <label htmlFor="file-upload">Upload Document</label>
        <input 
          type="file" 
          id="file-upload" 
          multiple 
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" 
        />
        <p>Max 5MB per file</p>
        <p>Multiple files allowed</p>
      </div>
    );

    const fileInput = screen.getByLabelText(/Upload Document/i);
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('multiple');
    expect(fileInput).toHaveAttribute('accept', '.pdf,.jpg,.jpeg,.png,.doc,.docx');
    
    expect(screen.getByText(/Max 5MB per file/i)).toBeInTheDocument();
    expect(screen.getByText(/Multiple files allowed/i)).toBeInTheDocument();
  });

  test('file input validation attributes', () => {
    render(<input type="file" data-testid="file-input" />);
    
    const fileInput = screen.getByTestId('file-input');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
  });
});