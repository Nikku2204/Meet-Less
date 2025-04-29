"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { KeyMetrics } from "@/components/key-metrics"
import { MeetingTypeAnalysis } from "@/components/meeting-type-analysis"
import { ParticipationAnalysis } from "@/components/participation-analysis"
import { RecommendationEngine } from "@/components/recommendation-engine"
import { FrequencyOptimization } from "@/components/frequency-optimization"
import { ParticipantOptimization } from "@/components/participant-optimization"
import { Sidebar } from "@/components/sidebar"
import { analyzeData, loadCSVData } from "@/lib/data-analysis"

export default function Dashboard() {
  const [data, setData] = useState([])
  const [analyzedData, setAnalyzedData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    meetingType: "all",
    scoreRange: [0, 1],
    participantCount: [0, 20],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const csvData = await loadCSVData()
        setData(csvData)
        const analysis = analyzeData(csvData)
        setAnalyzedData(analysis)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Meeting Optimizer...</h2>
          <Progress value={45} className="w-[60vw] mb-2" />
          <p className="text-muted-foreground">Analyzing meeting data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar filters={filters} onFilterChange={handleFilterChange} meetingTypes={analyzedData?.meetingTypes || []} />

      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Meeting Optimizer AI</h1>
          <p className="text-muted-foreground">Analyze meeting data and optimize for asynchronous communication</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <KeyMetrics data={analyzedData} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MeetingTypeAnalysis data={analyzedData} filters={filters} />
              <ParticipationAnalysis data={analyzedData} filters={filters} />
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FrequencyOptimization data={analyzedData} filters={filters} />
              <ParticipantOptimization data={analyzedData} filters={filters} />
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <RecommendationEngine data={analyzedData} filters={filters} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
