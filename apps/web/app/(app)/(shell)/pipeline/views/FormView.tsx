'use client';

export function FormView({ data, onSubmit }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-md p-md">
      <p>Form view</p>
    </form>
  );
}
