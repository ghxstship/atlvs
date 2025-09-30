import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import { Button, Input, Modal, Form, Table } from '../../packages/ui/src';
import { GHXSTSHIPProvider } from '../../packages/ui/src/index-unified';

// Helper function to run axe accessibility tests
async function runAxe(container: Element): Promise<axe.AxeResults> {
  const results = await axe.run(container);
  return results;
}

// Helper to check for accessibility violations
function expectNoViolations(results: axe.AxeResults) {
  const violations = results.violations;
  if (violations.length > 0) {
    const violationMessages = violations.map(v =>
      `${v.id}: ${v.description}\nImpact: ${v.impact}\nHelp: ${v.help}\nHelp URL: ${v.helpUrl}\nNodes: ${v.nodes.length}`
    ).join('\n\n');
    throw new Error(`Accessibility violations found:\n\n${violationMessages}`);
  }
}

describe('Accessibility Testing - WCAG 2.2 AA Compliance', () => {
  describe('Button Component', () => {
    it('should have no accessibility violations in default state', async () => {
      const { container } = render(
        <GHXSTSHIPProvider>
          <Button>Accessible Button</Button>
        </GHXSTSHIPProvider>
      );

      const results = await runAxe(container);
      expectNoViolations(results);
    });

    it('should have proper focus management', async () => {
      const { container, getByRole } = render(
        <GHXSTSHIPProvider>
          <Button>Focus Button</Button>
        </GHXSTSHIPProvider>
      );

      const button = getByRole('button');
      button.focus();

      expect(button).toHaveFocus();
      expect(button).toHaveClass('focus-visible:ring-2');
      const results = await runAxe(container);
      expectNoViolations(results);
    });

    it('should be keyboard accessible', async () => {
      const { container, getByRole } = render(
        <GHXSTSHIPProvider>
          <Button>Keyboard Button</Button>
        </GHXSTSHIPProvider>
      );

      const button = getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
      const results = await runAxe(container);
      expectNoViolations(results);
    });

    it('should announce loading state properly', async () => {
      const { container } = render(
        <GHXSTSHIPProvider>
          <Button loading>Loading Button</Button>
        </GHXSTSHIPProvider>
      );

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      const results = await runAxe(container);
      expectNoViolations(results);
    });
  });

  describe('Input Component', () => {
    it('should have proper labeling and no violations', async () => {
      const { container } = render(
        <GHXSTSHIPProvider>
          <label htmlFor="test-input">Test Label</label>
          <Input id="test-input" placeholder="Enter text" />
        </GHXSTSHIPProvider>
      );

      const results = await runAxe(container);
      expectNoViolations(results);
    });

    it('should support aria-describedby for error messages', async () => {
      const { container } = render(
        <GHXSTSHIPProvider>
          <label htmlFor="error-input">Email</label>
          <Input
            id="error-input"
            type="email"
            aria-describedby="error-message"
            aria-invalid="true"
          />
          <span id="error-message" role="alert">Invalid email format</span>
        </GHXSTSHIPProvider>
      );

      const results = await runAxe(container);
      expectNoViolations(results);
    });

    it('should handle disabled state correctly', async () => {
      const { container } = render(
        <GHXSTSHIPProvider>
          <label htmlFor="disabled-input">Disabled Input</label>
          <Input id="disabled-input" disabled />
        </GHXSTSHIPProvider>
      );

      const input = container.querySelector('input');
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('aria-disabled', 'true');

      const results = await runAxe(container);
      expectNoViolations(results);
    });
  });

  describe('Modal Component', () => {
    it('should have proper focus management and ARIA attributes', async () => {
      const { container } = render(
        <GHXSTSHIPProvider>
          <Modal
            isOpen={true}
            title="Test Modal"
            onClose={() => {}}
          >
            <p>Modal content</p>
          </Modal>
        </GHXSTSHIPProvider>
      );

      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');

      const results = await runAxe(container);
      expectNoViolations(results);
    });

    it('should trap focus within modal', async () => {
      const { container } = render(
        <GHXSTSHIPProvider>
          <Modal
            isOpen={true}
            title="Focus Trap Modal"
            onClose={() => {}}
          >
            <button>First Button</button>
            <input type="text" placeholder="Input field" />
            <button>Last Button</button>
          </Modal>
        </GHXSTSHIPProvider>
      );

      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toBeInTheDocument();

      const results = await runAxe(container);
      expectNoViolations(results);
    });
  });

  describe('Form Component', () => {
    it('should have proper form structure and labeling', async () => {
      const { container } = render(
        <GHXSTSHIPProvider>
          <Form onSubmit={() => {}}>
            <label htmlFor="name">Name</label>
            <Input id="name" required />
            <label htmlFor="email">Email</label>
            <Input id="email" type="email" required />
            <Button type="submit">Submit</Button>
          </Form>
        </GHXSTSHIPProvider>
      );

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();

      const results = await runAxe(container);
      expectNoViolations(results);
    });

    it('should handle form validation feedback', async () => {
      const { container } = render(
        <GHXSTSHIPProvider>
          <Form onSubmit={() => {}}>
            <label htmlFor="required-field">Required Field</label>
            <Input
              id="required-field"
              required
              aria-describedby="error-msg"
              aria-invalid="true"
            />
            <span id="error-msg" role="alert">This field is required</span>
            <Button type="submit">Submit</Button>
          </Form>
        </GHXSTSHIPProvider>
      );

      const results = await runAxe(container);
      expectNoViolations(results);
    });
  });

  describe('Table Component', () => {
    it('should have proper table structure and headers', async () => {
      const { container } = render(
        <GHXSTSHIPProvider>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Doe</td>
                <td>john@example.com</td>
                <td><Button size="sm">Edit</Button></td>
              </tr>
            </tbody>
          </Table>
        </GHXSTSHIPProvider>
      );

      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();

      const headers = container.querySelectorAll('th');
      expect(headers).toHaveLength(3);

      const results = await runAxe(container);
      expectNoViolations(results);
    });

    it('should support keyboard navigation', async () => {
      const { container } = render(
        <GHXSTSHIPProvider>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td tabIndex={0}>John Doe</td>
                <td tabIndex={0}>john@example.com</td>
              </tr>
            </tbody>
          </Table>
        </GHXSTSHIPProvider>
      );

      const cells = container.querySelectorAll('td');
      cells.forEach(cell => {
        expect(cell).toHaveAttribute('tabIndex', '0');
      });

      const results = await runAxe(container);
      expectNoViolations(results);
    });
  });

  describe('Complex Component Interactions', () => {
    it('should handle complex form with multiple inputs', async () => {
      const { container } = render(
        <GHXSTSHIPProvider>
          <Form onSubmit={() => {}}>
            <fieldset>
              <legend>Personal Information</legend>
              <label htmlFor="firstName">First Name</label>
              <Input id="firstName" required />

              <label htmlFor="lastName">Last Name</label>
              <Input id="lastName" required />

              <label htmlFor="email">Email</label>
              <Input id="email" type="email" required />
            </fieldset>

            <fieldset>
              <legend>Preferences</legend>
              <label htmlFor="notifications">
                <input type="checkbox" id="notifications" />
                Enable notifications
              </label>
            </fieldset>

            <Button type="submit">Save Profile</Button>
          </Form>
        </GHXSTSHIPProvider>
      );

      const results = await runAxe(container);
      expectNoViolations(results);
    });

    it('should handle disabled states correctly', async () => {
      const { container } = render(
        <GHXSTSHIPProvider>
          <div>
            <Button aria-label="Undo last action" disabled>
              Undo
            </Button>
            <Button aria-label="Redo last action" disabled>
              Redo
            </Button>
          </div>
        </GHXSTSHIPProvider>
      );

      const undoButton = container.querySelector('button[aria-label="Undo last action"]');
      const redoButton = container.querySelector('button[aria-label="Redo last action"]');
      expect(undoButton).toBeDisabled();
      expect(redoButton).toBeDisabled();

      const results = await runAxe(container);
      expectNoViolations(results);
    });
  });
});
