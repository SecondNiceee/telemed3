"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  CheckCircle,
  User,
  Stethoscope,
} from "lucide-react"
import { AppointmentsApi } from "@/lib/api/appointments"
import type { ApiAppointment } from "@/lib/api/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OrgConsultationsContentProps {
  orgId: number
  orgName: string
  doctorIds: number[]
  initialSort: 'all' | 'now' | 'future' | 'past'
}

type SortType = 'all' | 'now' | 'future' | 'past'

const CONSULTATIONS_PER_PAGE = 10

const sortLabels: Record<SortType, string> = {
  all: 'Все консультации',
  now: 'Текущие',
  future: 'Предстоящие',
  past: 'Прошедшие',
}

const sortIcons: Record<SortType, React.ReactNode> = {
  all: <Calendar className="w-4 h-4" />,
  now: <Video className="w-4 h-4" />,
  future: <Clock className="w-4 h-4" />,
  past: <CheckCircle className="w-4 h-4" />,
}

export function OrgConsultationsContent({
  orgName,
  doctorIds,
  initialSort,
}: OrgConsultationsContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [consultations, setConsultations] = useState<ApiAppointment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSort, setActiveSort] = useState<SortType>(initialSort)

  // Sync sort from URL
  useEffect(() => {
    const sortFromUrl = searchParams.get('sort') as SortType | null
    if (sortFromUrl && ['all', 'now', 'future', 'past'].includes(sortFromUrl)) {
      setActiveSort(sortFromUrl)
    }
  }, [searchParams])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch consultations
  useEffect(() => {
    async function fetchConsultations() {
      if (doctorIds.length === 0) {
        setConsultations([])
        setTotalPages(0)
        setTotalDocs(0)
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      try {
        const response = await AppointmentsApi.fetchByDoctorsPaginated(doctorIds, {
          page: currentPage,
          limit: CONSULTATIONS_PER_PAGE,
          search: debouncedSearch || undefined,
          sort: activeSort,
        })
        setConsultations(response.docs)
        setTotalPages(response.totalPages)
        setTotalDocs(response.totalDocs)
      } catch (error) {
        console.error("Failed to fetch consultations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConsultations()
  }, [doctorIds, currentPage, debouncedSearch, activeSort])

  const handleSortChange = (sort: SortType) => {
    setActiveSort(sort)
    setCurrentPage(1)
    router.push(`/lk-org/consultations?sort=${sort}`, { scroll: false })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getStatusBadge = (appointment: ApiAppointment) => {
    switch (appointment.status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 border border-orange-500/20">
            <Video className="w-3 h-3" />
            В процессе
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
            <CheckCircle className="w-3 h-3" />
            Завершена
          </span>
        )
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <Clock className="w-3 h-3" />
            Запланирована
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/lk-org"
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Консультации</h1>
            <p className="text-sm text-muted-foreground">{orgName}</p>
          </div>
        </div>

        {/* Sort Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(sortLabels) as SortType[]).map((sort) => (
            <button
              key={sort}
              onClick={() => handleSortChange(sort)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                "border shadow-sm hover:shadow-md hover:-translate-y-0.5",
                activeSort === sort
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50"
              )}
            >
              {sortIcons[sort]}
              {sortLabels[sort]}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск по имени врача или пациента..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          Найдено консультаций: {totalDocs}
        </p>

        {/* Consultations List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-border bg-card">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {debouncedSearch
                ? `По запросу "${debouncedSearch}" консультации не найдены`
                : "Консультации не найдены"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(consultation)}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <Stethoscope className="w-4 h-4 text-primary" />
                        <span className="font-medium">{consultation.doctorName || 'Врач'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{consultation.userName || 'Пациент'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(consultation.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{consultation.time}</span>
                      </div>
                    </div>
                    
                    {consultation.specialty && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {consultation.specialty}
                      </p>
                    )}
                  </div>
                  
                  {consultation.price && (
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        {consultation.price.toLocaleString('ru-RU')} &#8381;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {currentPage} из {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
