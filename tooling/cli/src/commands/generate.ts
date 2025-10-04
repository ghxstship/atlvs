/* eslint-disable no-console */
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import fs from 'fs-extra'
import path from 'path'

interface GenerateOptions {
  name?: string
  path?: string
}

const templates = {
  component: {
    description: 'React component with tests',
    files: ['component.tsx', 'component.test.tsx', 'component.stories.tsx', 'index.ts'],
  },
  page: {
    description: 'Next.js page with layout',
    files: ['page.tsx', 'layout.tsx', 'loading.tsx', 'error.tsx'],
  },
  api: {
    description: 'API route with validation',
    files: ['route.ts', 'route.test.ts', 'schema.ts'],
  },
  test: {
    description: 'Test file',
    files: ['test.ts'],
  },
}

export async function generateCommand(type: string, options: GenerateOptions) {
  console.log(chalk.blue.bold(`\n🎨 Generating ${type}...\n`))

  if (!templates[type as keyof typeof templates]) {
    console.error(chalk.red(`Unknown type: ${type}`))
    console.log(chalk.gray('Available types:'), Object.keys(templates).join(', '))
    process.exit(1)
  }

  const template = templates[type as keyof typeof templates]

  // Get name if not provided
  let name = options.name?.trim()
  if (!name) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: `Enter ${type} name:`,
        validate: (input: string) => input.trim().length > 0 || 'Name is required',
      },
    ]) as { name: string }
    name = answers.name.trim()
  }

  if (!name) {
    throw new Error('Name is required')
  }

  // Get path if not provided
  let targetPath = options.path?.trim()
  if (!targetPath) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'path',
        message: 'Enter path (relative to project root):',
        default: getDefaultPath(type),
      },
    ]) as { path: string }
    targetPath = answers.path.trim()
  }

  if (!targetPath) {
    targetPath = getDefaultPath(type)
  }

  const spinner = ora(`Generating ${type}...`).start()

  try {
    const fullPath = path.join(process.cwd(), targetPath, name)
    await fs.ensureDir(fullPath)

    for (const file of template.files) {
      const fileName = file.replace(type, name)
      const filePath = path.join(fullPath, fileName)
      const content = generateFileContent(name, file)
      await fs.writeFile(filePath, content)
    }

    spinner.succeed(`Generated ${type} at ${fullPath}`)
    console.log(chalk.green('\nFiles created:'))
    template.files.forEach(file => {
      console.log(chalk.gray(`  - ${file.replace(type, name)}`))
    })
  } catch (error) {
    spinner.fail(`Failed to generate ${type}`)
    throw error
  }
}

function getDefaultPath(type: string): string {
  const paths: Record<string, string> = {
    component: 'packages/ui/src/components',
    page: 'apps/web/app',
    api: 'apps/web/app/api',
    test: 'tests/unit',
  }
  return paths[type] ?? '.'
}

function generateFileContent(name: string, file: string): string {
  const pascalName = toPascalCase(name)

  switch (file) {
    case 'component.tsx':
      return `import { FC } from 'react'

interface ${pascalName}Props {
  // Add props here
}

export const ${pascalName}: FC<${pascalName}Props> = () => {
  return (
    <div>
      <h1>${pascalName}</h1>
    </div>
  )
}
`
    case 'component.test.tsx':
      return `import { render, screen } from '@testing-library/react'
import { ${pascalName} } from './${name}'

describe('${pascalName}', () => {
  it('renders correctly', () => {
    render(<${pascalName} />)
    expect(screen.getByText('${pascalName}')).toBeInTheDocument()
  })
})
`
    case 'component.stories.tsx':
      return `import type { Meta, StoryObj } from '@storybook/react'
import { ${pascalName} } from './${name}'

const meta = {
  title: '${pascalName}',
  component: ${pascalName},
} satisfies Meta<typeof ${pascalName}>

export default meta

type Story = StoryObj<typeof ${pascalName}>

export const Default: Story = {
  args: {},
}
`
    case 'index.ts':
      return `export * from './${name}'
`
    case 'page.tsx':
      return `export default function ${pascalName}Page() {
  return (
    <div>
      <h1>${pascalName}</h1>
    </div>
  )
}
`
    case 'layout.tsx':
      return `import type { ReactNode } from 'react'

interface ${pascalName}LayoutProps {
  children: ReactNode
}

export default function ${pascalName}Layout({ children }: ${pascalName}LayoutProps) {
  return <div>{children}</div>
}
`
    case 'loading.tsx':
      return `export default function Loading() {
  return <div>Loading ${pascalName}...</div>
}
`
    case 'error.tsx':
      return `'use client'

interface ${pascalName}ErrorProps {
  error: Error
  reset: () => void
}

export default function ${pascalName}Error({ error, reset }: ${pascalName}ErrorProps) {
  return (
    <div>
      <p>Something went wrong: {error.message}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  )
}
`
    case 'route.ts':
      return `import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  return NextResponse.json({ message: '${pascalName} API' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ data: body })
}
`
    case 'route.test.ts':
      return `import { describe, it, expect } from 'vitest'

describe('${pascalName} API route', () => {
  it('should be implemented', () => {
    expect(true).toBe(true)
  })
})
`
    case 'schema.ts':
      return `import { z } from 'zod'

export const ${pascalName}Schema = z.object({
  id: z.string().uuid(),
})

export type ${pascalName}Data = z.infer<typeof ${pascalName}Schema>
`
    case 'test.ts':
      return `import { describe, it, expect } from 'vitest'

describe('${pascalName} Test', () => {
  it('should run successfully', () => {
    expect(true).toBe(true)
  })
})
`
    default:
      return `// Generated file for ${name}\n`
  }
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}
