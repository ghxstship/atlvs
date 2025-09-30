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
  let name = options.name
  if (!name) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: `Enter ${type} name:`,
        validate: (input) => input.length > 0 || 'Name is required',
      },
    ])
    name = answers.name
  }

  // Get path if not provided
  let targetPath = options.path
  if (!targetPath) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'path',
        message: 'Enter path (relative to project root):',
        default: getDefaultPath(type),
      },
    ])
    targetPath = answers.path
  }

  const spinner = ora(`Generating ${type}...`).start()

  try {
    const fullPath = path.join(process.cwd(), targetPath, name)
    await fs.ensureDir(fullPath)

    for (const file of template.files) {
      const fileName = file.replace(type, name)
      const filePath = path.join(fullPath, fileName)
      const content = generateFileContent(type, name, file)
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
  return paths[type] || '.'
}

function generateFileContent(type: string, name: string, file: string): string {
  const pascalName = toPascalCase(name)
  const camelName = toCamelCase(name)

  if (file.includes('component.tsx')) {
    return `import { FC } from 'react'

interface ${pascalName}Props {
  // Add props here
}

export const ${pascalName}: FC<${pascalName}Props> = (props) => {
  return (
    <div>
      <h1>${pascalName}</h1>
    </div>
  )
}
`
  }

  if (file.includes('component.test.tsx')) {
    return `import { render, screen } from '@testing-library/react'
import { ${pascalName} } from './${name}'

describe('${pascalName}', () => {
  it('renders correctly', () => {
    render(<${pascalName} />)
    expect(screen.getByText('${pascalName}')).toBeInTheDocument()
  })
})
`
  }

  if (file.includes('page.tsx')) {
    return `export default function ${pascalName}Page() {
  return (
    <div>
      <h1>${pascalName}</h1>
    </div>
  )
}
`
  }

  if (file.includes('route.ts')) {
    return `import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: '${pascalName} API' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ data: body })
}
`
  }

  return `// Generated file for ${name}\n`
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}
