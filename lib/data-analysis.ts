// Add the parseUploadedCSV function at the top of the file
export async function parseUploadedCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        if (!text) {
          reject(new Error("Failed to read file"))
          return
        }

        // Parse CSV
        const rows = text.split(/\r?\n/)
        if (rows.length < 2) {
          reject(new Error("File appears to be empty or invalid"))
          return
        }

        const headers = rows[0].split(",").map((header) => header.trim())

        // Validate required columns
        const requiredColumns = [
          "Meeting_Title",
          "Duration_Minutes",
          "Participants",
          "Actual_Speakers",
          "Decision_Made",
        ]
        const missingColumns = requiredColumns.filter((col) => !headers.includes(col))

        if (missingColumns.length > 0) {
          reject(new Error(`Missing required columns: ${missingColumns.join(", ")}`))
          return
        }

        const data = []
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue

          const values = rows[i].split(",")
          if (values.length !== headers.length) {
            console.warn(`Skipping row ${i + 1}: column count mismatch`)
            continue
          }

          const row = {}
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || ""
          })

          // Add default values for optional columns if missing
          if (!row.hasOwnProperty("Could_Be_Async")) {
            row["Could_Be_Async"] = row["Decision_Made"] === "No" ? "Yes" : "No"
          }
          if (!row.hasOwnProperty("Agenda_Provided")) {
            row["Agenda_Provided"] = "No"
          }
          if (!row.hasOwnProperty("Follow_Up_Sent")) {
            row["Follow_Up_Sent"] = "No"
          }

          data.push(row)
        }

        if (data.length === 0) {
          reject(new Error("No valid data rows found in the file"))
          return
        }

        resolve(data)
      } catch (error) {
        reject(new Error("Failed to parse CSV file: " + (error.message || "Unknown error")))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read the file"))
    }

    reader.readAsText(file)
  })
}

// Function to load CSV data from the provided URL
export async function loadCSVData() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/week%202%20-%20Problem_2_-_Meeting_Usefulness_Tracker-yEzyYhC7JP7ir6sZ2hLaJ30VbfQD8b.csv",
    )
    const text = await response.text()

    // Parse CSV
    const rows = text.split("\n")
    const headers = rows[0].split(",")

    const data = []
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].trim() === "") continue

      const values = rows[i].split(",")
      const row = {}

      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim()
      })

      data.push(row)
    }

    return data
  } catch (error) {
    console.error("Error loading CSV data:", error)
    return []
  }
}

// Function to analyze meeting data
export function analyzeData(data) {
  if (!data || data.length === 0) return null

  // Meeting type coefficients
  const meetingTypeCoefficients = {
    "Design Review": 0.8,
    "Customer Success Update": 0.9,
    "Go-To-Market Strategy": 0.7,
    "QA Review": 0.6,
    "Budget Review": 0.5,
    "Data Deep Dive": 0.5,
    "Ops Status Call": 0.5,
    "Leadership Roundtable": 0.3,
    "Weekly Standup": 0.2,
    "Sprint Planning": 0.25,
    "Engineering Retrospective": 0.35,
    "Cross-Team Sync": 0.3,
  }

  // Calculate meeting effectiveness scores
  const analyzedMeetings = data.map((meeting) => {
    // Convert string values to numbers
    const durationMinutes = Number.parseInt(meeting.Duration_Minutes)
    const participants = Number.parseInt(meeting.Participants)
    const actualSpeakers = Number.parseInt(meeting.Actual_Speakers)

    // Calculate factors
    const decisionFactor = meeting.Decision_Made === "Yes" ? 1 : 0
    const participationRatio = Math.min(actualSpeakers / participants, 1.0)

    // Size factor
    let sizeFactor = 0.5 // default for large meetings
    if (participants <= 3) {
      sizeFactor = 0.7 // small meetings
    } else if (participants <= 8) {
      sizeFactor = 1.0 // medium meetings
    }

    // Get meeting type coefficient
    const meetingTypeCoefficient = meetingTypeCoefficients[meeting.Meeting_Title] || 0.5

    // Calculate base score
    let score = meetingTypeCoefficient * (decisionFactor * 0.4 + participationRatio * 0.4 + sizeFactor * 0.2)

    // Additional adjustments
    if (durationMinutes <= 30 && participationRatio > 0.7) {
      score += 0.2
    }

    // Classify meeting
    let category = "medium-value"
    if (score < 0.3 && meeting.Could_Be_Async === "Yes") {
      category = "low-value"
    } else if (score > 0.6) {
      category = "high-value"
    }

    return {
      ...meeting,
      durationMinutes,
      participants,
      actualSpeakers,
      decisionFactor,
      participationRatio,
      sizeFactor,
      meetingTypeCoefficient,
      score,
      category,
    }
  })

  // Calculate key metrics
  const totalMeetings = analyzedMeetings.length
  const meetingsWithDecisions = analyzedMeetings.filter((m) => m.Decision_Made === "Yes").length
  const decisionRate = Math.round((meetingsWithDecisions / totalMeetings) * 100)

  const couldBeAsyncMeetings = analyzedMeetings.filter((m) => m.Could_Be_Async === "Yes").length
  const asyncPercentage = Math.round((couldBeAsyncMeetings / totalMeetings) * 100)

  const lowValueMeetings = analyzedMeetings.filter((m) => m.category === "low-value").length
  const totalWastedMinutes = analyzedMeetings
    .filter((m) => m.category === "low-value")
    .reduce((sum, m) => sum + m.durationMinutes * m.participants, 0)

  // Meeting type analysis
  const meetingTypes = [...new Set(analyzedMeetings.map((m) => m.Meeting_Title))]
  const meetingTypeAnalysis = meetingTypes.map((type) => {
    const meetings = analyzedMeetings.filter((m) => m.Meeting_Title === type)
    const avgScore = meetings.reduce((sum, m) => sum + m.score, 0) / meetings.length
    const decisionsCount = meetings.filter((m) => m.Decision_Made === "Yes").length
    const decisionRate = decisionsCount / meetings.length
    const avgParticipationRatio = meetings.reduce((sum, m) => sum + m.participationRatio, 0) / meetings.length
    const avgParticipants = meetings.reduce((sum, m) => sum + m.participants, 0) / meetings.length

    return {
      meetingType: type,
      count: meetings.length,
      score: avgScore,
      decisionRate,
      participationRatio: avgParticipationRatio,
      averageParticipants: Math.round(avgParticipants),
    }
  })

  // Participation analysis
  const participationAnalysis = analyzedMeetings.map((m) => ({
    meetingTitle: m.Meeting_Title,
    participationRatio: m.participationRatio,
    decisionMade: m.Decision_Made,
    participants: m.participants,
    speakers: m.actualSpeakers,
  }))

  // Low participation meetings
  const lowParticipationMeetings = analyzedMeetings
    .filter((m) => m.participationRatio < 0.3)
    .map((m) => ({
      meetingTitle: m.Meeting_Title,
      participationRatio: m.participationRatio,
      participantCount: m.participants,
      speakerCount: m.actualSpeakers,
      potentialReduction: Math.max(0, Math.floor(m.participants * 0.7 - m.actualSpeakers)),
    }))

  // Frequency analysis (simulated data)
  const frequencyAnalysis = meetingTypes.map((type) => {
    const meetings = analyzedMeetings.filter((m) => m.Meeting_Title === type)
    const avgScore = meetings.reduce((sum, m) => sum + m.score, 0) / meetings.length
    const decisionsCount = meetings.filter((m) => m.Decision_Made === "Yes").length
    const decisionRate = decisionsCount / meetings.length

    // Simulate decision trend data
    const decisionTrend = Array(6)
      .fill(0)
      .map((_, i) => {
        return Math.max(0, Math.min(1, decisionRate + (Math.random() * 0.2 - 0.1)))
      })

    const currentFrequency = "Weekly"
    let recommendedFrequency = currentFrequency

    // Determine recommended frequency based on decision rate and score
    if (decisionRate < 0.3 && avgScore < 0.4) {
      recommendedFrequency = "Monthly"
    } else if (decisionRate < 0.5 && avgScore < 0.5) {
      recommendedFrequency = "Bi-weekly"
    }

    // Calculate time savings
    const avgDuration = meetings.reduce((sum, m) => sum + m.durationMinutes, 0) / meetings.length
    const avgParticipants = meetings.reduce((sum, m) => sum + m.participants, 0) / meetings.length

    let timeSavings = 0
    if (recommendedFrequency === "Bi-weekly" && currentFrequency === "Weekly") {
      timeSavings = Math.round(avgDuration * avgParticipants * 2) // 2 meetings saved per month
    } else if (recommendedFrequency === "Monthly" && currentFrequency === "Weekly") {
      timeSavings = Math.round(avgDuration * avgParticipants * 3) // 3 meetings saved per month
    }

    return {
      meetingType: type,
      currentFrequency,
      recommendedFrequency,
      decisionRate,
      decisionTrend,
      timeSavings,
    }
  })

  // Participant optimization
  const participantOptimization = analyzedMeetings
    .filter((m) => m.participationRatio < 0.5 && m.participants > 3)
    .map((m) => {
      const optimalParticipants = Math.max(3, Math.ceil(m.actualSpeakers * 1.5))
      const reduction = m.participants - optimalParticipants

      // Calculate time savings (assuming weekly meetings)
      const timeSavings = Math.round(m.durationMinutes * reduction * 4) // 4 meetings per month

      return {
        meetingTitle: m.Meeting_Title,
        meetingType: m.Meeting_Title,
        currentParticipants: m.participants,
        optimalParticipants,
        reduction,
        timeSavings,
      }
    })

  // Generate recommendations
  const recommendations = []

  // Low-value meeting recommendations
  analyzedMeetings
    .filter((m) => m.category === "low-value")
    .forEach((m) => {
      let recommendation = ""

      if (m.Meeting_Title === "Weekly Standup" && m.participants > 8) {
        recommendation = "Convert to async updates. Use a Slack/Teams standup bot instead."
      } else if (m.Meeting_Title === "Leadership Roundtable" && m.participationRatio < 0.3) {
        recommendation = "Replace with executive summary document and targeted follow-ups."
      } else if (m.participationRatio < 0.2) {
        recommendation = `Too few speakers for participant count. Reduce participant list by ${Math.floor(m.participants * 0.7)}.`
      } else {
        recommendation = "Convert to async communication. Use shared documents for updates."
      }

      recommendations.push({
        id: `low-${recommendations.length}`,
        meetingTitle: m.Meeting_Title,
        meetingType: m.Meeting_Title,
        category: "low-value",
        recommendation,
        participants: m.participants,
        duration: m.durationMinutes,
        score: m.score,
      })
    })

  // Participant optimization recommendations
  participantOptimization.forEach((m) => {
    recommendations.push({
      id: `participant-${recommendations.length}`,
      meetingTitle: m.meetingTitle,
      meetingType: m.meetingType,
      category: "participant",
      recommendation: `Reduce participants from ${m.currentParticipants} to ${m.optimalParticipants}. Potential time savings of ${m.timeSavings} minutes per month.`,
      participants: m.currentParticipants,
      duration: analyzedMeetings.find((am) => am.Meeting_Title === m.meetingTitle)?.durationMinutes || 30,
      score: analyzedMeetings.find((am) => am.Meeting_Title === m.meetingTitle)?.score || 0.5,
    })
  })

  // Frequency optimization recommendations
  frequencyAnalysis
    .filter((m) => m.currentFrequency !== m.recommendedFrequency)
    .forEach((m) => {
      recommendations.push({
        id: `frequency-${recommendations.length}`,
        meetingTitle: m.meetingType,
        meetingType: m.meetingType,
        category: "frequency",
        recommendation: `Change frequency from ${m.currentFrequency} to ${m.recommendedFrequency}. Potential time savings of ${m.timeSavings} minutes per month.`,
        participants: Math.round(
          analyzedMeetings
            .filter((am) => am.Meeting_Title === m.meetingType)
            .reduce((sum, am) => sum + am.participants, 0) /
            analyzedMeetings.filter((am) => am.Meeting_Title === m.meetingType).length,
        ),
        duration: Math.round(
          analyzedMeetings
            .filter((am) => am.Meeting_Title === m.meetingType)
            .reduce((sum, am) => sum + am.durationMinutes, 0) /
            analyzedMeetings.filter((am) => am.Meeting_Title === m.meetingType).length,
        ),
        score:
          analyzedMeetings.filter((am) => am.Meeting_Title === m.meetingType).reduce((sum, am) => sum + am.score, 0) /
          analyzedMeetings.filter((am) => am.Meeting_Title === m.meetingType).length,
      })
    })

  // Keep recommendations
  analyzedMeetings
    .filter((m) => m.category === "high-value" && m.durationMinutes <= 30 && m.participationRatio > 0.7)
    .forEach((m) => {
      recommendations.push({
        id: `keep-${recommendations.length}`,
        meetingTitle: m.Meeting_Title,
        meetingType: m.Meeting_Title,
        category: "keep",
        recommendation: "Keep as is. Short meeting with high participation indicates good value.",
        participants: m.participants,
        duration: m.durationMinutes,
        score: m.score,
      })
    })

  return {
    keyMetrics: {
      totalMeetings,
      decisionRate,
      asyncPercentage,
      lowValueMeetings,
      totalWastedMinutes,
    },
    meetingTypes,
    meetingTypeAnalysis,
    participationAnalysis,
    lowParticipationMeetings,
    frequencyAnalysis,
    participantOptimization,
    recommendations,
  }
}
