"use client"

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SupabaseClient } from "@supabase/supabase-js"
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { AlertTriangle, Award, Badge, Building, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Clock, Eye, FileText, Grid, Plus, Star, Users } from 'lucide-react';
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

interface OverviewClientProps {
  user: User
  orgId: string
  translations: {
    title: string
    subtitle: string
    viewDirectory?: string
    addCompany?: string
    totalCompaniesLabel?: string
    activeCompaniesLabel?: string
    activeContractsLabel?: string
    totalContractsLabel?: string
    qualificationsLabel?: string
    expiringSoonLabel?: string
    averageRatingLabel?: string
    reviewsLabel?: string
    contractsExpiringLabel?: string
    qualificationsExpiringLabel?: string
    pendingReviewsLabel?: string
    recentActivityLabel?: string
    viewAllActivityLabel?: string
    topRatedLabel?: string
    viewAllRatingsLabel?: string
    quickActionsLabel?: string
    addQualificationLabel?: string
    submitRatingLabel?: string
    addCompanyActionLabel?: string
    newContractActionLabel?: string
  }
}

interface CompanyStats {
  totalCompanies: number
  activeCompanies: number
  pendingCompanies: number
  blacklistedCompanies: number
  totalContracts: number
  activeContracts: number
  expiringContracts: number
  totalQualifications: number
  expiringQualifications: number
  averageRating: number
  totalRatings: number
}

interface RecentActivity {
  id: string
  type: "company_added" | "contract_signed" | "qualification_verified" | "rating_submitted"
  companyName: string
  description: string
  timestamp: string
  user: string
}

interface TopRatedCompany {
  id: string
  name: string
  rating: number
  reviewCount: number
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours}h ago`
  return `${Math.floor(diffInHours / 24)}d ago`
}

const renderStars = (rating: number) =>
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-icon-xs w-icon-xs ${
        index < Math.round(rating - 1e-3) ? "text-warning fill-current" : "text-muted-foreground"
      }`}
    />
  ))

const useCompaniesOverview = (supabase: SupabaseClient, orgId: string) => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topRatedCompanies, setTopRatedCompanies] = useState<TopRatedCompany[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadOverviewData = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (mode === "initial") {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      try {
        setError(null)

        const [companies, contracts, qualifications, ratings] = await Promise.all([
          supabase.from("companies").select("status").eq("organization_id", orgId),
          supabase.from("company_contracts").select("status, end_date").eq("organization_id", orgId),
          supabase.from("company_qualifications").select("status, expiry_date").eq("organization_id", orgId),
          supabase.from("company_ratings").select("rating, company_id").eq("organization_id", orgId),
        ])

        const companyStats: CompanyStats = {
          totalCompanies: companies.data?.length ?? 0,
          activeCompanies: companies.data?.filter((company) => company.status === "active").length ?? 0,
          pendingCompanies: companies.data?.filter((company) => company.status === "pending").length ?? 0,
          blacklistedCompanies: companies.data?.filter((company) => company.status === "blacklisted").length ?? 0,
          totalContracts: contracts.data?.length ?? 0,
          activeContracts: contracts.data?.filter((contract) => contract.status === "active").length ?? 0,
          expiringContracts:
            contracts.data?.filter((contract) => {
              if (!contract.end_date) return false
              const endDate = new Date(contract.end_date)
              const threshold = new Date()
              threshold.setDate(threshold.getDate() + 30)
              return endDate <= threshold
            }).length ?? 0,
          totalQualifications: qualifications.data?.length ?? 0,
          expiringQualifications:
            qualifications.data?.filter((qualification) => {
              if (!qualification.expiry_date) return false
              const expiryDate = new Date(qualification.expiry_date)
              const threshold = new Date()
              threshold.setDate(threshold.getDate() + 30)
              return expiryDate <= threshold
            }).length ?? 0,
          averageRating:
            ratings.data?.length ? ratings.data.reduce((sum, rating) => sum + toNumber(rating.rating), 0) / ratings.data.length : 0,
          totalRatings: ratings.data?.length ?? 0
        }

        setStats(companyStats)

        setRecentActivity([
          {
            id: "1",
            type: "company_added",
            companyName: "Stellar Construction Co.",
            description: "New company added to directory",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            user: "John Doe"
          },
          {
            id: "2",
            type: "contract_signed",
            companyName: "TechFlow Solutions",
            description: "Master Service Agreement signed",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            user: "Jane Smith"
          },
          {
            id: "3",
            type: "qualification_verified",
            companyName: "Global Logistics Inc.",
            description: "ISO 9001 certification verified",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            user: "Mike Johnson"
          },
        ])

        setTopRatedCompanies([
          { id: "1", name: "Stellar Construction Co.", rating: 4.8, reviewCount: 24 },
          { id: "2", name: "TechFlow Solutions", rating: 4.6, reviewCount: 18 },
          { id: "3", name: "Global Logistics Inc.", rating: 4.4, reviewCount: 12 },
        ])
      } catch (err) {
        console.error("Error loading companies overview:", err)
        setError("Failed to load companies overview")
      } finally {
        if (mode === "initial") {
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
    loadOverviewData("initial")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadOverviewData])

  return {
    loading,
    refreshing,
    stats,
    recentActivity,
    topRatedCompanies,
    error,
    refresh: () => loadOverviewData("refresh")
  }
}

export default function OverviewClient({ user: _user, orgId, translations }: OverviewClientProps) {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserClient(), []) as unknown as SupabaseClient
  const { loading, refreshing, stats, recentActivity, topRatedCompanies, error, refresh } = useCompaniesOverview(
    supabase,
    orgId,
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
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-16" />
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
          <CardDescription>Something went wrong while loading company insights.</CardDescription>
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
          <h1 className="text-heading-3 font-anton uppercase text-foreground">{translations.title}</h1>
          <p className="text-body-sm text-muted-foreground">{translations.subtitle}</p>
        </Stack>
        <HStack spacing="sm">
          <Button variant="secondary" onClick={() => router.push("/companies/directory")}>
            <HStack spacing="xs" align="center">
              <Eye className="h-icon-xs w-icon-xs" />
              <span>{translations.viewDirectory ?? "View Directory"}</span>
            </HStack>
          </Button>
          <Button onClick={() => router.push("/companies")}
            variant={refreshing ? "outline" : "default"}>
            <HStack spacing="xs" align="center">
              <Plus className="h-icon-xs w-icon-xs" />
              <span>{translations.addCompany ?? "Add Company"}</span>
            </HStack>
          </Button>
        </HStack>
      </HStack>

      <Grid cols={1} responsive={{ md: 2, lg: 4 }} spacing="md">
        <Card>
          <CardContent>
            <HStack justify="between" align="center">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">
                  {translations.totalCompaniesLabel ?? "Total Companies"}
                </span>
                <span className="text-heading-3 font-semibold text-foreground">{stats?.totalCompanies ?? 0}</span>
                <span className="text-sm text-success">
                  {(stats?.activeCompanies ?? 0)} {translations.activeCompaniesLabel ?? "active"}
                </span>
              </Stack>
              <Building className="h-icon-lg w-icon-lg text-accent" />
            </HStack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <HStack justify="between" align="center">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">
                  {translations.activeContractsLabel ?? "Active Contracts"}
                </span>
                <span className="text-heading-3 font-semibold text-success">{stats?.activeContracts ?? 0}</span>
                <span className="text-sm text-muted-foreground">
                  {translations.totalContractsLabel ?? "of"} {stats?.totalContracts ?? 0} total
                </span>
              </Stack>
              <FileText className="h-icon-lg w-icon-lg text-success" />
            </HStack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <HStack justify="between" align="center">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">
                  {translations.qualificationsLabel ?? "Qualifications"}
                </span>
                <span className="text-heading-3 font-semibold text-secondary">
                  {stats?.totalQualifications ?? 0}
                </span>
                {(stats?.expiringQualifications ?? 0) > 0 && (
                  <span className="text-sm text-warning">
                    {stats?.expiringQualifications} {translations.expiringSoonLabel ?? "expiring soon"}
                  </span>
                )}
              </Stack>
              <Award className="h-icon-lg w-icon-lg text-secondary" />
            </HStack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <HStack justify="between" align="center">
              <Stack spacing="xs">
                <span className="text-sm text-muted-foreground">
                  {translations.averageRatingLabel ?? "Average Rating"}
                </span>
                <span className="text-heading-3 font-semibold text-warning">
                  {stats?.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stats?.totalRatings ?? 0} {translations.reviewsLabel ?? "reviews"}
                </span>
              </Stack>
              <Star className="h-icon-lg w-icon-lg text-warning" />
            </HStack>
          </CardContent>
        </Card>
      </Grid>

      {(stats?.expiringContracts || stats?.expiringQualifications || stats?.pendingCompanies) && (
        <Grid cols={1} responsive={{ md: 3 }} spacing="md">
          {(stats?.expiringContracts ?? 0) > 0 && (
            <Card className="border-warning/20 bg-warning/10">
              <CardContent>
                <HStack spacing="sm" align="center">
                  <AlertTriangle className="h-icon-sm w-icon-sm text-warning" />
                  <Stack spacing="xs">
                    <span className="text-sm font-medium text-warning">
                      {translations.contractsExpiringLabel ?? "Contracts Expiring"}
                    </span>
                    <span className="text-sm text-warning/80">
                      {stats?.expiringContracts} expire within 30 days
                    </span>
                  </Stack>
                </HStack>
              </CardContent>
            </Card>
          )}

          {(stats?.expiringQualifications ?? 0) > 0 && (
            <Card className="border-destructive/20 bg-destructive/10">
              <CardContent>
                <HStack spacing="sm" align="center">
                  <Clock className="h-icon-sm w-icon-sm text-destructive" />
                  <Stack spacing="xs">
                    <span className="text-sm font-medium text-destructive">
                      {translations.qualificationsExpiringLabel ?? "Qualifications Expiring"}
                    </span>
                    <span className="text-sm text-destructive/80">
                      {stats?.expiringQualifications} expire within 30 days
                    </span>
                  </Stack>
                </HStack>
              </CardContent>
            </Card>
          )}

          {(stats?.pendingCompanies ?? 0) > 0 && (
            <Card className="border-accent/20 bg-accent/10">
              <CardContent>
                <HStack spacing="sm" align="center">
                  <Users className="h-icon-sm w-icon-sm text-accent" />
                  <Stack spacing="xs">
                    <span className="text-sm font-medium text-accent">
                      {translations.pendingReviewsLabel ?? "Pending Reviews"}
                    </span>
                    <span className="text-sm text-accent/80">
                      {stats?.pendingCompanies} companies need review
                    </span>
                  </Stack>
                </HStack>
              </CardContent>
            </Card>
          )}
        </Grid>
      )}

      <Grid cols={1} responsive={{ lg: 2 }} spacing="lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              {translations.recentActivityLabel ?? "Recent Activity"}
            </CardTitle>
            <CardDescription>Latest company lifecycle updates</CardDescription>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              {recentActivity.map((activity) => (
                <HStack key={activity.id} spacing="sm" align="start">
                  {activity.type === "company_added" && <Building className="h-icon-xs w-icon-xs text-accent" />}
                  {activity.type === "contract_signed" && <FileText className="h-icon-xs w-icon-xs text-success" />}
                  {activity.type === "qualification_verified" && <Award className="h-icon-xs w-icon-xs text-secondary" />}
                  {activity.type === "rating_submitted" && <Star className="h-icon-xs w-icon-xs text-warning" />}
                  <Stack spacing="xs" className="flex-1">
                    <span className="text-sm font-medium text-foreground">{activity.companyName}</span>
                    <span className="text-sm text-muted-foreground">{activity.description}</span>
                    <span className="text-xs text-muted-foreground/80">
                      {formatTimeAgo(activity.timestamp)} • {activity.user}
                    </span>
                  </Stack>
                </HStack>
              ))}
            </Stack>
            <Button variant="secondary" className="mt-lg" onClick={() => router.push("/companies/activity")}
            >
              {translations.viewAllActivityLabel ?? "View All"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              {translations.topRatedLabel ?? "Top Rated Companies"}
            </CardTitle>
            <CardDescription>Customer satisfaction snapshots</CardDescription>
          </CardHeader>
          <CardContent>
            <Stack spacing="md">
              {topRatedCompanies.map((company, index) => (
                <HStack key={company.id} justify="between" align="center">
                  <Stack spacing="xs">
                    <span className="text-sm font-medium text-foreground">{company.name}</span>
                    <HStack spacing="sm" align="center">
                      <HStack spacing="xs" align="center">
                        {renderStars(company.rating)}
                      </HStack>
                      <span className="text-sm text-muted-foreground">{company.rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground/70">
                        ({company.reviewCount} reviews)
                      </span>
                    </HStack>
                  </Stack>
                  <Badge variant="secondary">#{index + 1}</Badge>
                </HStack>
              ))}
            </Stack>
            <Button variant="secondary" className="mt-lg" onClick={() => router.push("/companies/ratings")}
            >
              {translations.viewAllRatingsLabel ?? "View All Ratings"}
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            {translations.quickActionsLabel ?? "Quick Actions"}
          </CardTitle>
          <CardDescription>Stay ahead with frequent company workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <Grid cols={2} responsive={{ md: 4 }} spacing="md">
            <Button variant="secondary" className="h-component-lg flex-col" onClick={() => router.push("/companies")}
            >
              <Building className="h-icon-md w-icon-md" />
              <span className="text-sm">
                {translations.addCompanyActionLabel ?? "Add Company"}
              </span>
            </Button>
            <Button
              variant="secondary"
              className="h-component-lg flex-col"
              onClick={() => router.push("/companies/contracts")}
            >
              <FileText className="h-icon-md w-icon-md" />
              <span className="text-sm">
                {translations.newContractActionLabel ?? "New Contract"}
              </span>
            </Button>
            <Button
              variant="secondary"
              className="h-component-lg flex-col"
              onClick={() => router.push("/companies/qualifications")}
            >
              <Award className="h-icon-md w-icon-md" />
              <span className="text-sm">
                {translations.addQualificationLabel ?? "Add Qualification"}
              </span>
            </Button>
            <Button
              variant="secondary"
              className="h-component-lg flex-col"
              onClick={() => router.push("/companies/ratings")}
            >
              <Star className="h-icon-md w-icon-md" />
              <span className="text-sm">
                {translations.submitRatingLabel ?? "Submit Rating"}
              </span>
            </Button>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  )
}
