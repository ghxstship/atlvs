'use client';

export function FormView({ data, onSubmit }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4">
      <p>Form view</p>
    </form>
  );
}
