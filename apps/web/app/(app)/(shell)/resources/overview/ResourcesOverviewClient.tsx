'use client'

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Badge, BarChart, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Clock, Download, FileText, Filter, FolderOpen, Grid, Plus, Search, Star, Upload, Users } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton
} from '@ghxstship/ui';
import { Skeleton } from '@ghxstship/ui/components/atomic/Skeleton';
import { Grid, HStack, Stack } from '@ghxstship/ui/components/layouts';

import { useResourcesOverview } from '../hooks/useResourcesOverview';

const metricIconComponents: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  FileText,
  Download,
  Users,
  Star
}

const trendToneMap: Record<'up' | 'down' | 'neutral', { badge: 'success' | 'destructive' | 'secondary'; text: string }> = {
  up: { badge: 'success', text: 'text-success' },
  down: { badge: 'destructive', text: 'text-destructive' },
  neutral: { badge: 'secondary', text: 'text-muted-foreground' }
}

const categoryToneMap: Record<'accent' | 'success' | 'warning' | 'destructive' | 'muted', string> = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  muted: 'bg-muted-foreground/40'
}

export default function ResourcesOverviewClient({ orgId }: { orgId: string }) {
  const router = useRouter()
  const { metrics, recentResources, categories, activities, loading, refreshing, error, refresh } =
    useResourcesOverview({ orgId })

  const metricCards = useMemo(
    () =>
      metrics.map((metric) => {
        const Icon = metricIconComponents[metric.icon] ?? FileText
        const trend = trendToneMap[metric.trend] ?? trendToneMap.neutral
        return { ...metric, Icon, trend }
      }),
    [metrics],
  )

  if (loading) {
    return (
      <Stack spacing="lg">
        <HStack justify="between" align="center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </HStack>
        <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-sm">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-12" />
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-destructive">{error}</CardTitle>
          <CardDescription>We couldn’t load the resources overview. Try refreshing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refresh}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Stack spacing="lg">
      <HStack justify="between" align="center">
        <Stack spacing="xs">
          <h1 className="text-heading-3 font-anton uppercase text-foreground">Resources Overview</h1>
          <p className="text-body-sm text-muted-foreground">
            Manage knowledge assets, monitor engagement, and keep your library healthy.
          </p>
        </Stack>
        <HStack spacing="sm">
          <Button variant="secondary" onClick={() => router.push('/resources/upload')}>
            <Upload className="h-icon-xs w-icon-xs mr-xs" />
            Upload Resource
          </Button>
          <Button onClick={() => router.push('/resources/create')}>
            <Plus className="h-icon-xs w-icon-xs mr-xs" />
            Create New
          </Button>
          <Button variant={refreshing ? 'outline' : 'ghost'} disabled={refreshing} onClick={refresh}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </HStack>
      </HStack>

      <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
        {metricCards.map((metric) => (
          <Card key={metric.id}>
            <CardContent>
              <HStack justify="between" align="center">
                <metric.Icon className={`h-icon-sm w-icon-sm ${metric.trend.text}`} />
                <Badge variant={metric.trend.badge} className="flex items-center gap-xs text-xs px-sm">
                  {metric.change > 0 ? `+${metric.change}` : metric.change}%
                </Badge>
              </HStack>
              <Stack spacing="xs" className="mt-md">
                <span className="text-heading-3 font-semibold text-foreground">{metric.value}</span>
                <span className="text-sm text-muted-foreground">{metric.label}</span>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Grid>

      <Grid cols={1} responsive={{ lg: 3 }} spacing="lg">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Recent Resources</CardTitle>
            <CardDescription>What your teams are consuming and contributing this week.</CardDescription>
          </CardHeader>
          <CardContent>
            <Stack spacing="sm">
              {recentResources.length === 0 ? (
                <Stack spacing="sm" align="center" className="py-xl text-muted-foreground">
                  <FileText className="h-icon-xl w-icon-xl" />
                  <span className="text-sm">No resources yet. Upload your first asset to get started.</span>
                </Stack>
              ) : (
                recentResources.map((resource) => (
                  <HStack
                    key={resource.id}
                    spacing="md"
                    justify="between"
                    align="center"
                    className="rounded-lg border border-border bg-card/60 p-md"
                  >
                    <HStack spacing="md" align="center">
                      <div className="p-sm rounded-lg bg-muted/20">
                        <FileText className="h-icon-sm w-icon-sm text-muted-foreground" />
                      </div>
                      <Stack spacing="xs">
                        <span className="text-sm font-semibold text-foreground">{resource.title}</span>
                        <HStack spacing="sm" align="center">
                          <Badge variant="secondary" className="capitalize">
                            {resource.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{resource.downloads} downloads</span>
                          <HStack spacing="xs" align="center">
                            <Star className="h-icon-3xs w-icon-3xs text-warning" />
                            <span className="text-xs text-muted-foreground">{resource.rating.toFixed(1)}</span>
                          </HStack>
                        </HStack>
                      </Stack>
                    </HStack>
                    <span className="text-xs text-muted-foreground">
                      {new Date(resource.updatedAt).toLocaleString()}
                    </span>
                  </HStack>
                ))
              )}
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing="lg">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Categories</CardTitle>
              <CardDescription>Breakdown of your resource library by type.</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack spacing="sm">
                {categories.map((category) => (
                  <HStack key={category.id} justify="between" align="center">
                    <HStack spacing="sm" align="center">
                      <span className={`h-2 w-2 rounded-full ${categoryToneMap[category.tone]}`} />
                      <span className="text-sm text-foreground">{category.name}</span>
                    </HStack>
                    <span className="text-sm text-muted-foreground">{category.count}</span>
                  </HStack>
                ))}
              </Stack>
              <Button variant="secondary" className="mt-lg w-full" onClick={() => router.push('/resources/categories')}>
                <FolderOpen className="h-icon-xs w-icon-xs mr-xs" />
                Manage Categories
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
              <CardDescription>Surface relevant tools to curate and analyse the library.</CardDescription>
            </CardHeader>
            <CardContent>
              <Stack spacing="sm">
                <Button variant="secondary" className="justify-start" onClick={() => router.push('/resources/search')}>
                  <Search className="h-icon-xs w-icon-xs mr-xs" />
                  Search Resources
                </Button>
                <Button variant="secondary" className="justify-start" onClick={() => router.push('/resources/filters')}>
                  <Filter className="h-icon-xs w-icon-xs mr-xs" />
                  Advanced Filters
                </Button>
                <Button variant="secondary" className="justify-start" onClick={() => router.push('/resources/analytics')}>
                  <BarChart className="h-icon-xs w-icon-xs mr-xs" />
                  View Analytics
                </Button>
                <Button variant="secondary" className="justify-start" onClick={() => router.push('/resources/activity')}>
                  <Clock className="h-icon-xs w-icon-xs mr-xs" />
                  Recent Activity
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Activity Timeline</CardTitle>
          <CardDescription>Highlights from knowledge operations across your teams.</CardDescription>
        </CardHeader>
        <CardContent>
          <Stack spacing="md">
            {activities.length === 0 ? (
              <Stack spacing="sm" align="center" className="py-xl text-muted-foreground">
                <Activity className="h-icon-xl w-icon-xl" />
                <span className="text-sm">No recent activity logged.</span>
              </Stack>
            ) : (
              activities.map((item) => (
                <HStack key={item.id} spacing="sm" align="start">
                  <span className={`mt-1 h-2 w-2 rounded-full ${categoryToneMap[item.tone === 'info' ? 'muted' : item.tone]}`} />
                  <Stack spacing="xs">
                    <span className="text-sm text-foreground">{item.description}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </Stack>
                </HStack>
              ))
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
