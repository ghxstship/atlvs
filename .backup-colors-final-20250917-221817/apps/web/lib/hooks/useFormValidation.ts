import { useForm, UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export function useFormValidation<T extends z.ZodType<any, any>>(
  schema: T,
  options?: UseFormProps<z.infer<T>>
) {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    ...options
  })
}

export function useAsyncForm<T extends z.ZodType<any, any>>(
  schema: T,
  onSubmit: (data: z.infer<T>) => Promise<void>,
  options?: UseFormProps<z.infer<T>>
) {
  const form = useFormValidation(schema, options)
  
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data)
    } catch (error) {
      // console.error('Form submission error:', error)
    }
  })

  return {
    ...form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting
  }
}
