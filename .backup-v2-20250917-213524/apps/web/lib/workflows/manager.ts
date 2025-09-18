export interface WorkflowStep {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  data?: unknown
}

export interface Workflow {
  id: string
  name: string
  steps: WorkflowStep[]
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export class WorkflowManager {
  private workflows: Map<string, Workflow> = new Map()

  createWorkflow(name: string, steps: Omit<WorkflowStep, 'status'>[]): Workflow {
    const workflow: Workflow = {
      id: crypto.randomUUID(),
      name,
      steps: steps.map(step => ({ ...step, status: 'pending' })),
      status: 'pending'
    }
    
    this.workflows.set(workflow.id, workflow)
    return workflow
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id)
  }

  updateWorkflowStep(workflowId: string, stepId: string, status: WorkflowStep['status'], data?: unknown): void {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) return

    const step = workflow.steps.find(s => s.id === stepId)
    if (!step) return

    step.status = status
    if (data) step.data = data

    // Update workflow status based on steps
    if (workflow.steps.every(s => s.status === 'completed')) {
      workflow.status = 'completed'
    } else if (workflow.steps.some(s => s.status === 'failed')) {
      workflow.status = 'failed'
    } else if (workflow.steps.some(s => s.status === 'in_progress')) {
      workflow.status = 'running'
    }
  }
}

export const workflowManager = new WorkflowManager()
