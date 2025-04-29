"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileSpreadsheet, Upload } from "lucide-react"

export function Sidebar({ filters, onFilterChange, meetingTypes = [], isUploadedData }) {
  return (
    <div className="hidden md:flex w-64 flex-col border-r bg-gray-50/40 p-4">
      <div className="flex items-center gap-2 mb-2">
        <FileSpreadsheet className="h-6 w-6 text-blue-600" />
        <h2 className="text-lg font-semibold">Meeting Optimizer</h2>
      </div>

      <div className="mb-4">
        <Badge variant={isUploadedData ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
          <Upload className="h-3 w-3" />
          {isUploadedData ? "Using uploaded data" : "Using demo data"}
        </Badge>
      </div>

      <Separator className="mb-4" />

      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-sm font-medium">Meeting Type</h3>
          <Select value={filters.meetingType} onValueChange={(value) => onFilterChange("meetingType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select meeting type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Meeting Types</SelectItem>
              {meetingTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Score Range</h3>
          <div className="px-2">
            <Slider
              defaultValue={[0, 1]}
              max={1}
              step={0.1}
              value={filters.scoreRange}
              onValueChange={(value) => onFilterChange("scoreRange", value)}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filters.scoreRange[0].toFixed(1)}</span>
              <span>{filters.scoreRange[1].toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Participant Count</h3>
          <div className="px-2">
            <Slider
              defaultValue={[0, 20]}
              min={0}
              max={20}
              step={1}
              value={filters.participantCount}
              onValueChange={(value) => onFilterChange("participantCount", value)}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filters.participantCount[0]}</span>
              <span>{filters.participantCount[1]}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 text-sm font-medium">Meeting Value</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High Value</Badge>
              <span className="ml-2 text-xs text-muted-foreground">Score &gt; 0.6</span>
            </div>
            <div className="flex items-center">
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium Value</Badge>
              <span className="ml-2 text-xs text-muted-foreground">Score 0.3 - 0.6</span>
            </div>
            <div className="flex items-center">
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Low Value</Badge>
              <span className="ml-2 text-xs text-muted-foreground">Score &lt; 0.3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
