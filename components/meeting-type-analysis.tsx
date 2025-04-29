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
  Legend,
  Label,
  LabelList,
  type TooltipProps,
} from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DataTable } from "@/components/data-table"

// Custom tooltip component for the bar chart
const CustomBarTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-sm">
          Effectiveness Score: <span className="font-medium">{Number(data.score).toFixed(2)}</span>
        </p>
        <p className="text-sm">
          Decision Rate: <span className="font-medium">{(data.decisionRate * 100).toFixed(0)}%</span>
        </p>
        <p className="text-sm">
          Participation: <span className="font-medium">{(data.participationRatio * 100).toFixed(0)}%</span>
        </p>
        <p className="text-sm">
          Avg. Participants: <span className="font-medium">{data.averageParticipants}</span>
        </p>
      </div>
    )
  }
  return null
}

// Custom tooltip component for the scatter chart
const CustomScatterTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm">
          Participation Rate: <span className="font-medium">{data.x}%</span>
        </p>
        <p className="text-sm">
          Decision Rate: <span className="font-medium">{data.y}%</span>
        </p>
        <p className="text-sm">
          Participants: <span className="font-medium">{data.z}</span>
        </p>
        <p className="text-sm">
          Score: <span className="font-medium">{data.score.toFixed(2)}</span>
        </p>
      </div>
    )
  }
  return null
}

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

  // Sort data by score for better visualization
  const sortedData = [...filteredData].sort((a, b) => b.score - a.score)

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
    count: item.count,
  }))

  // Table columns
  const columns = [
    {
      accessorKey: "meetingType",
      header: "Meeting Type",
    },
    {
      accessorKey: "count",
      header: "Count",
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
        <div className="mb-2">
          <h3 className="text-sm font-medium">Meeting Effectiveness Scores</h3>
          <p className="text-xs text-muted-foreground">
            Higher scores indicate more effective meetings based on decisions, participation, and size
          </p>
        </div>
        <div className="h-[250px] mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 10, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="meetingType"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
                interval={0}
              >
                <Label value="Meeting Type" position="insideBottom" offset={-60} />
              </XAxis>
              <YAxis domain={[0, 1]} tickFormatter={(value) => value.toFixed(1)}>
                <Label
                  value="Effectiveness Score"
                  position="insideLeft"
                  angle={-90}
                  style={{ textAnchor: "middle" }}
                  offset={0}
                />
              </YAxis>
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="score" name="Effectiveness Score">
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                ))}
                <LabelList dataKey="score" position="top" formatter={(value) => value.toFixed(2)} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mb-2">
          <h3 className="text-sm font-medium">Decision Rate vs. Participation Rate</h3>
          <p className="text-xs text-muted-foreground">
            Bubble size represents number of participants; color indicates meeting value
          </p>
        </div>
        <div className="h-[250px] mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="x"
                name="Participation Rate"
                unit="%"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              >
                <Label value="Participation Rate (%)" position="bottom" offset={0} />
              </XAxis>
              <YAxis
                type="number"
                dataKey="y"
                name="Decision Rate"
                unit="%"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              >
                <Label value="Decision Rate (%)" position="insideLeft" angle={-90} offset={-5} />
              </YAxis>
              <ZAxis type="number" dataKey="z" range={[50, 400]} name="Participants" />
              <Tooltip content={<CustomScatterTooltip />} />
              <Legend />
              <Scatter name="Meeting Types" data={scatterData} fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="mb-2">
          <h3 className="text-sm font-medium">Meeting Type Details</h3>
        </div>
        <ScrollArea className="h-[200px]">
          <DataTable columns={columns} data={filteredData} />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
