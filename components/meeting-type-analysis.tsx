import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DataTable } from "@/components/data-table"

export function MeetingTypeAnalysis({ data, filters }) {
  if (!data) return null

  const { meetingTypeAnalysis } = data

  // Filter data based on filters
  const filteredData = meetingTypeAnalysis.filter((item) => {
    if (filters.meetingType !== "all" && item.meetingType !== filters.meetingType) {
      return false
    }
    if (item.score < filters.scoreRange[0] || item.score > filters.scoreRange[1]) {
      return false
    }
    return true
  })

  // Color function based on meeting value
  const getBarColor = (score) => {
    if (score > 0.6) return "#22c55e" // green for high-value
    if (score >= 0.3) return "#f59e0b" // amber for medium-value
    return "#ef4444" // red for low-value
  }

  // Scatter plot data
  const scatterData = filteredData.map((item) => ({
    x: item.participationRatio * 100, // Convert to percentage
    y: item.decisionRate * 100, // Convert to percentage
    z: item.averageParticipants,
    name: item.meetingType,
    score: item.score,
  }))

  // Table columns
  const columns = [
    {
      accessorKey: "meetingType",
      header: "Meeting Type",
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => {
        const score = Number.parseFloat(row.getValue("score"))
        return (
          <div className="font-medium" style={{ color: getBarColor(score) }}>
            {score.toFixed(2)}
          </div>
        )
      },
    },
    {
      accessorKey: "decisionRate",
      header: "Decision Rate",
      cell: ({ row }) => {
        return `${(row.getValue("decisionRate") * 100).toFixed(0)}%`
      },
    },
    {
      accessorKey: "participationRatio",
      header: "Participation",
      cell: ({ row }) => {
        return `${(row.getValue("participationRatio") * 100).toFixed(0)}%`
      },
    },
    {
      accessorKey: "averageParticipants",
      header: "Avg. Participants",
    },
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Meeting Type Analysis</CardTitle>
        <CardDescription>Effectiveness scores and metrics by meeting type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="meetingType" angle={-45} textAnchor="end" height={70} />
              <YAxis label={{ value: "Score", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(value, name) => [value.toFixed(2), "Score"]} />
              <Bar dataKey="score" name="Effectiveness Score">
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[200px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="Participation Ratio" unit="%" domain={[0, 100]} />
              <YAxis type="number" dataKey="y" name="Decision Rate" unit="%" domain={[0, 100]} />
              <ZAxis type="number" dataKey="z" range={[50, 400]} name="Participants" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value, name) => [
                  `${value}${name === "Participation Ratio" || name === "Decision Rate" ? "%" : ""}`,
                  name,
                ]}
              />
              <Scatter name="Meeting Types" data={scatterData} fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <ScrollArea className="h-[200px]">
          <DataTable columns={columns} data={filteredData} />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
