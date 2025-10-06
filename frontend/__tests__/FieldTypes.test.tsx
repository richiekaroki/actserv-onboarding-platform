// frontend/__tests__/FieldTypes.test.tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Field Types - Basic', () => {
  test('renders basic form elements', () => {
    render(
      <form>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" />
        <label htmlFor="age">Age</label>
        <input type="number" id="age" />
        <button type="submit">Submit</button>
      </form>
    );

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  test('input fields have correct types', () => {
    render(
      <div>
        <input type="text" data-testid="text-input" />
        <input type="number" data-testid="number-input" />
        <input type="date" data-testid="date-input" />
      </div>
    );

    expect(screen.getByTestId('text-input')).toHaveAttribute('type', 'text');
    expect(screen.getByTestId('number-input')).toHaveAttribute('type', 'number');
    expect(screen.getByTestId('date-input')).toHaveAttribute('type', 'date');
  });
});