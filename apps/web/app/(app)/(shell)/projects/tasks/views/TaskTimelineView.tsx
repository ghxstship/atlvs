"use client";

import { AlertCircle, Briefcase, Calendar, Clock, ListTodo, Tag, TrendingUp, Users } from "lucide-react";
import { useMemo } from 'react';
import { Badge, Card } from "@ghxstship/ui";
import {
  differenceInDays,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek
} from "date-fns";

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  assignee?: User;
  project?: Project;
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface TaskTimelineViewProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
}

const formatDueDate = (isoDate?: string) => {
  if (!isoDate) return "No due date";

  try {
    return format(parseISO(isoDate), "MMM d, yyyy");
  } catch (error) {
    return isoDate;
  }
};

const getDueLabel = (daysUntil: number | null) => {
  if (daysUntil === null) return "No due date";
  if (daysUntil < 0) {
    const overdueBy = Math.abs(daysUntil);
    return overdueBy === 1 ? "Overdue by 1 day" : `Overdue by ${overdueBy} days`;
  }

  if (daysUntil === 0) return "Due today";
  if (daysUntil === 1) return "Due tomorrow";

  return `Due in ${daysUntil} days`;
};

export default function TaskTimelineView({ tasks, onViewTask, onEditTask }: TaskTimelineViewProps) {
  const groupedTasks = useMemo(() => {
    const today = new Date();
    const thisWeekStart = startOfWeek(today);
    const thisWeekEnd = endOfWeek(today);
    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);

    const groups = {
      overdue: [] as Task[],
      today: [] as Task[],
      thisWeek: [] as Task[],
      thisMonth: [] as Task[],
      later: [] as Task[],
      noDueDate: [] as Task[]
    };

    tasks.forEach((task) => {
      if (!task.due_date) {
        groups.noDueDate.push(task);
        return;
      }

      const dueDate = parseISO(task.due_date);
      const daysUntil = differenceInDays(dueDate, today);

      if (daysUntil < 0 && task.status !== "done") {
        groups.overdue.push(task);
        return;
      }

      if (daysUntil === 0) {
        groups.today.push(task);
        return;
      }

      if (isWithinInterval(dueDate, { start: thisWeekStart, end: thisWeekEnd })) {
        groups.thisWeek.push(task);
        return;
      }

      if (isWithinInterval(dueDate, { start: thisMonthStart, end: thisMonthEnd })) {
        groups.thisMonth.push(task);
        return;
      }

      groups.later.push(task);
    });

    (Object.keys(groups) as Array<keyof typeof groups>).forEach((key) => {
      groups[key].sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 } as const;
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;

        if (a.due_date && b.due_date) {
          return a.due_date.localeCompare(b.due_date);
        }

        return 0;
      });
    });

    return groups;
  }, [tasks]);

  const getStatusBadge = (status: Task["status"]) => {
    const variant =
      status === "done"
        ? "success"
        : status === "in_progress"
        ? "warning"
        : status === "review"
        ? "info"
        : status === "blocked"
        ? "destructive"
        : "secondary";

    return (
      <Badge variant={variant} className="text-xs">
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    const variant =
      priority === "critical"
        ? "destructive"
        : priority === "high"
        ? "warning"
        : priority === "medium"
        ? "secondary"
        : "outline";

    return (
      <Badge variant={variant} className="text-xs capitalize">
        {priority}
      </Badge>
    );
  };

  const getEfficiency = (task: Task) => {
    if (!task.estimated_hours || !task.actual_hours) return null;
    const efficiency = (task.estimated_hours / task.actual_hours) * 100;
    return Math.round(efficiency);
  };

  const renderTaskItem = (
    task: Task,
    options: {
      showDate?: boolean;
      isLast?: boolean;
    } = {},
  ) => {
    const { showDate = true, isLast = false } = options;
    const daysUntil = task.due_date ? differenceInDays(parseISO(task.due_date), new Date()) : null;
    const dueLabel = getDueLabel(daysUntil);
    const efficiency = getEfficiency(task);

    return (
      <div key={task.id} className="flex gap-md group">
        <div className="flex flex-col items-center">
          <div
            className={`w-3 h-3 rounded-full border-2 ${
              task.status === "done"
                ? "bg-success border-success"
                : task.priority === "critical"
                ? "bg-destructive border-destructive"
                : task.priority === "high"
                ? "bg-warning border-warning"
                : "bg-background border-primary"
            }`}
          />
          {!isLast && <div className="w-px flex-1 bg-border" />}
        </div>

        <Card
          className="flex-1 cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => onViewTask(task)}
        >
          <div className="space-y-md p-md">
            <div className="flex items-start justify-between gap-sm">
              <div className="flex-1 space-y-xs">
                <h4 className="font-medium leading-snug line-clamp-xs">{task.title}</h4>
                {task.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-xs">{task.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEditTask(task);
                }}
                className="text-sm text-primary opacity-0 transition-opacity hover:underline group-hover:opacity-100"
              >
                Edit
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-sm text-sm text-muted-foreground">
              {task.project ? (
                <div className="flex items-center gap-xs">
                  <Briefcase className="h-icon-xs w-icon-xs" />
                  <span>{task.project.name}</span>
                </div>
              ) : null}

              {task.assignee ? (
                <div className="flex items-center gap-xs">
                  <Users className="h-icon-xs w-icon-xs" />
                  <span>{task.assignee.full_name ?? task.assignee.email}</span>
                </div>
              ) : null}

              {task.tags?.length ? (
                <div className="flex items-center gap-xs">
                  <Tag className="h-icon-xs w-icon-xs" />
                  <span>{task.tags.join(", ")}</span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-sm text-sm">
              <div className="flex items-center gap-xs text-muted-foreground">
                <ListTodo className="h-icon-xs w-icon-xs" />
                {getStatusBadge(task.status)}
              </div>

              <div className="flex items-center gap-xs text-muted-foreground">
                <AlertCircle className="h-icon-xs w-icon-xs" />
                {getPriorityBadge(task.priority)}
              </div>

              {showDate && task.due_date ? (
                <div className="flex items-center gap-xs text-muted-foreground">
                  <Calendar className="h-icon-xs w-icon-xs" />
                  <span>{formatDueDate(task.due_date)}</span>
                </div>
              ) : null}

              {showDate ? (
                <div className="flex items-center gap-xs text-muted-foreground">
                  <Clock className="h-icon-xs w-icon-xs" />
                  <span>{dueLabel}</span>
                </div>
              ) : null}

              {typeof efficiency === "number" ? (
                <div className="flex items-center gap-xs text-muted-foreground">
                  <TrendingUp className="h-icon-xs w-icon-xs" />
                  <span>{efficiency}% efficient</span>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderGroup = (
    title: string,
    icon: React.ComponentType<{ className?: string }>,
    tasksInGroup: Task[],
    options: {
      showDate?: boolean;
      description: string;
    },
  ) => {
    if (!tasksInGroup.length) {
      return null;
    }

    const { showDate = true, description } = options;
    const Icon = icon;

    return (
      <section key={title} className="space-y-md">
        <div className="flex items-start justify-between gap-sm">
          <div className="space-y-xs">
            <div className="flex items-center gap-xs">
              <Icon className="h-icon-xs w-icon-xs text-muted-foreground" />
              <h3 className="text-base font-semibold leading-tight">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {tasksInGroup.length} task{tasksInGroup.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <div className="space-y-lg">
          {tasksInGroup.map((task, index) =>
            renderTaskItem(task, { showDate, isLast: index === tasksInGroup.length - 1 }),
          )}
        </div>
      </section>
    );
  };

  const groupsConfig: Array<{
    key: keyof typeof groupedTasks;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    showDate?: boolean;
  }> = [
    {
      key: "overdue",
      title: "Overdue",
      icon: AlertCircle,
      description: "Tasks that are past their due date and still require attention."
    },
    {
      key: "today",
      title: "Due Today",
      icon: Clock,
      description: "Tasks that must be completed today."
    },
    {
      key: "thisWeek",
      title: "This Week",
      icon: Calendar,
      description: "Tasks scheduled to finish this week."
    },
    {
      key: "thisMonth",
      title: "This Month",
      icon: Calendar,
      description: "Tasks targeted for completion this month."
    },
    {
      key: "later",
      title: "Upcoming",
      icon: ListTodo,
      description: "Tasks that are further out on the roadmap."
    },
    {
      key: "noDueDate",
      title: "No Due Date",
      icon: Tag,
      description: "Tasks that do not yet have a committed due date.",
      showDate: false
    },
  ];

  const hasAnyTasks = groupsConfig.some(({ key }) => groupedTasks[key].length > 0);

  if (!hasAnyTasks) {
    return (
      <div className="rounded-lg border border-dashed p-xl text-center text-sm text-muted-foreground">
        No tasks found for the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      {groupsConfig.map(({ key, title, icon, description, showDate }) =>
        renderGroup(title, icon, groupedTasks[key], { description, showDate }),
      )}
    </div>
  );
}
