import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DataTable } from "@/components/data-table"

export function FrequencyOptimization({ data, filters }) {
  if (!data) return null

  const { frequencyAnalysis } = data

  // Filter data based on filters
  const filteredData = frequencyAnalysis.filter((item) => {
    if (filters.meetingType !== "all" && item.meetingType !== filters.meetingType) {
      return false
    }
    return true
  })

  // Table columns
  const columns = [
    {
      accessorKey: "meetingType",
      header: "Meeting Type",
    },
    {
      accessorKey: "currentFrequency",
      header: "Current Frequency",
    },
    {
      accessorKey: "recommendedFrequency",
      header: "Recommended",
    },
    {
      accessorKey: "decisionRate",
      header: "Decision Rate",
      cell: ({ row }) => {
        return `${(row.getValue("decisionRate") * 100).toFixed(0)}%`
      },
    },
    {
      accessorKey: "timeSavings",
      header: "Time Savings",
      cell: ({ row }) => {
        return `${row.getValue("timeSavings")} min/month`
      },
    },
  ]

  // Prepare trend data for line chart
  const trendData = filteredData.flatMap((item) =>
    item.decisionTrend.map((value, index) => ({
      meetingType: item.meetingType,
      week: `Week ${index + 1}`,
      decisionRate: value,
    })),
  )

  // Group trend data by meeting type
  const meetingTypes = [...new Set(trendData.map((item) => item.meetingType))]
  const weeks = [...new Set(trendData.map((item) => item.week))]

  const formattedTrendData = weeks.map((week) => {
    const dataPoint = { week }
    meetingTypes.forEach((type) => {
      const item = trendData.find((d) => d.week === week && d.meetingType === type)
      dataPoint[type] = item ? item.decisionRate : 0
    })
    return dataPoint
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Frequency Optimization</CardTitle>
        <CardDescription>Analyze recurring meetings and optimize their frequency</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <Tooltip formatter={(value) => `${(value * 100).toFixed(0)}%`} labelFormatter={(label) => `${label}`} />
              <Legend />
              {meetingTypes.map((type, index) => (
                <Line
                  key={type}
                  type="monotone"
                  dataKey={type}
                  name={type}
                  stroke={`hsl(${index * 30}, 70%, 50%)`}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <ScrollArea className="h-[300px]">
          <DataTable columns={columns} data={filteredData} title="Frequency Recommendations" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
