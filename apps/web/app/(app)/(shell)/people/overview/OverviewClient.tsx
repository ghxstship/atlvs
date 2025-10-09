'use client'


import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@ghxstship/ui";
import { Calendar, Users } from "lucide-react";

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@ghxstship/auth'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Skeleton
} from '@ghxstship/ui'
import { Skeleton } from '@ghxstship/ui/components/atomic/Skeleton'
import { Stack, HStack, Grid } from '@ghxstship/ui/components/layouts'
import { CompletionBar } from '../../../../_components/ui'
import {
  Users,
  Shield,
  Award,
  Star,
  Network,
  List,
  Calendar
} from 'lucide-react'

interface OverviewStats {
  totalPeople: number
  activePeople: number
  totalRoles: number
  totalCompetencies: number
  totalEndorsements: number
  totalShortlists: number
}

interface OverviewClientProps {
  orgId: string
}

interface QuickAction {
  id: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  href: string
}

const usePeopleOverview = (supabase: SupabaseClient, orgId: string) => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      try {
        setError(null)

        const [people, roles, competencies, endorsements, shortlists] = await Promise.all([
          supabase.from('people').select('status').eq('organization_id', orgId),
          supabase
            .from('people_roles')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId),
          supabase
            .from('people_competencies')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId),
          supabase.from('people_endorsements').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
          supabase
            .from('people_shortlists')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId),
        ])

        const totalPeople = people.data?.length ?? 0
        const activePeople = people.data?.filter((person) => person.status === 'active').length ?? 0

        setStats({
          totalPeople,
          activePeople,
          totalRoles: roles.count ?? 0,
          totalCompetencies: competencies.count ?? 0,
          totalEndorsements: endorsements.count ?? 0,
          totalShortlists: shortlists.count ?? 0
        })
      } catch (err) {
        console.error('Error loading people overview:', err)
        setError('Failed to load people overview')
      } finally {
        if (mode === 'initial') {
          setLoading(false)
        } else {
          setRefreshing(false)
        }
      }
    },
    [supabase, orgId],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadStats('initial')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadStats])

  return {
    loading,
    refreshing,
    stats,
    error,
    refresh: () => loadStats('refresh')
  }
}

export default function OverviewClient({ orgId }: OverviewClientProps) {
  const t = useTranslations('people.overview')
  const router = useRouter()
  const supabase = useMemo(() => createBrowserClient(), []) as unknown as SupabaseClient
  const { loading, refreshing, stats, error, refresh } = usePeopleOverview(supabase, orgId)

  const quickActions: QuickAction[] = [
    { id: 'directory', icon: Users, label: t('viewDirectory'), href: '/people/directory' },
    { id: 'roles', icon: Shield, label: t('manageRoles'), href: '/people/roles' },
    { id: 'competencies', icon: Award, label: t('viewCompetencies'), href: '/people/competencies' },
    { id: 'shortlists', icon: List, label: t('viewShortlists'), href: '/people/shortlists' },
    { id: 'endorsements', icon: Star, label: t('viewEndorsements'), href: '/people/endorsements' },
    { id: 'network', icon: Network, label: t('viewNetwork'), href: '/people/network' },
  ]

  if (loading) {
    return (
      <Stack spacing="lg">
        <HStack justify="between" align="center">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-10 w-32" />
        </HStack>
        <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-sm">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    )
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-destructive">{error ?? t('loadError')}</CardTitle>
          <CardDescription>{t('loadErrorDescription')}</CardDescription>
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
          <h1 className="text-heading-3 font-anton uppercase text-foreground">{t('title')}</h1>
          <p className="text-body-sm text-muted-foreground">{t('subtitle')}</p>
        </Stack>
        <Button variant={refreshing ? 'outline' : 'default'} disabled={refreshing} onClick={refresh}>
          {refreshing ? t('refreshing') : t('refresh')}
        </Button>
      </HStack>

      <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
        <Card>
          <CardContent>
            <HStack justify="between" align="center">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">{t('totalPeople')}</span>
                <span className="text-heading-3 font-semibold text-foreground">{stats.totalPeople}</span>
                <span className="text-sm text-success">{stats.activePeople} {t('active')}</span>
              </Stack>
              <Users className="h-icon-lg w-icon-lg text-accent" />
            </HStack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <HStack justify="between" align="center">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">{t('totalRoles')}</span>
                <span className="text-heading-3 font-semibold text-foreground">{stats.totalRoles}</span>
              </Stack>
              <Shield className="h-icon-lg w-icon-lg text-secondary" />
            </HStack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <HStack justify="between" align="center">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">{t('totalCompetencies')}</span>
                <span className="text-heading-3 font-semibold text-foreground">{stats.totalCompetencies}</span>
              </Stack>
              <Award className="h-icon-lg w-icon-lg text-success" />
            </HStack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <HStack justify="between" align="center">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">{t('totalEndorsements')}</span>
                <span className="text-heading-3 font-semibold text-foreground">{stats.totalEndorsements}</span>
              </Stack>
              <Star className="h-icon-lg w-icon-lg text-warning" />
            </HStack>
          </CardContent>
        </Card>
      </Grid>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">{t('quickActions')}</CardTitle>
          <CardDescription>{t('quickActionsHelp')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Grid cols={1} responsive={{ md: 2, lg: 3 }} spacing="md">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="justify-start h-component-lg"
                onClick={() => router.push(action.href)}
              >
                <HStack spacing="sm" align="center">
                  <action.icon className="h-icon-sm w-icon-sm" />
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </HStack>
              </Button>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Grid cols={1} responsive={{ lg: 2 }} spacing="lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{t('peopleByStatus')}</CardTitle>
            <CardDescription>{t('peopleByStatusSummary')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              <HStack justify="between" align="center">
                <span className="text-sm text-muted-foreground">{t('active')}</span>
                <HStack spacing="sm" align="center">
                  <CompletionBar completed={stats.activePeople} total={stats.totalPeople} className="w-40" />
                  <span className="text-sm font-medium text-foreground">{stats.activePeople}</span>
                </HStack>
              </HStack>
              <HStack justify="between" align="center">
                <span className="text-sm text-muted-foreground">{t('inactive')}</span>
                <HStack spacing="sm" align="center">
                  <CompletionBar
                    completed={stats.totalPeople - stats.activePeople}
                    total={stats.totalPeople}
                    className="w-40"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {stats.totalPeople - stats.activePeople}
                  </span>
                </HStack>
              </HStack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{t('moduleStatus')}</CardTitle>
            <CardDescription>{t('moduleStatusSummary')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Stack spacing="sm">
              <HStack justify="between" align="center">
                <span className="text-sm text-muted-foreground">{t('directory')}</span>
                <Badge className="bg-success/10 text-success">{t('active')}</Badge>
              </HStack>
              <HStack justify="between" align="center">
                <span className="text-sm text-muted-foreground">{t('roles')}</span>
                <Badge className="bg-success/10 text-success">{t('active')}</Badge>
              </HStack>
              <HStack justify="between" align="center">
                <span className="text-sm text-muted-foreground">{t('competencies')}</span>
                <Badge className="bg-success/10 text-success">{t('active')}</Badge>
              </HStack>
              <HStack justify="between" align="center">
                <span className="text-sm text-muted-foreground">{t('endorsements')}</span>
                <Badge className="bg-warning/10 text-warning">{t('beta')}</Badge>
              </HStack>
              <HStack justify="between" align="center">
                <span className="text-sm text-muted-foreground">{t('shortlists')}</span>
                <Badge className="bg-warning/10 text-warning">{t('beta')}</Badge>
              </HStack>
              <HStack justify="between" align="center">
                <span className="text-sm text-muted-foreground">{t('network')}</span>
                <Badge className="bg-warning/10 text-warning">{t('beta')}</Badge>
              </HStack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">{t('recentActivity')}</CardTitle>
          <CardDescription>{t('recentActivitySummary')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Stack spacing="md" align="center" className="text-center py-xl">
            <Calendar className="h-icon-2xl w-icon-2xl text-muted-foreground/50" />
            <Stack spacing="xs">
              <span className="text-sm text-muted-foreground">{t('noRecentActivity')}</span>
              <span className="text-sm text-muted-foreground/80">{t('activityWillAppearHere')}</span>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
