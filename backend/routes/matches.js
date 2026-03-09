const express = require('express')

const router = express.Router()

// Mock database (in real app, use a proper database)
const matches = [
  {
    id: '1',
    homeTeam: 'AC Milan',
    awayTeam: 'Inter',
    league: 'Serie A',
    startTime: new Date('2024-03-09T20:45:00Z'),
    status: 'live',
    score: { home: 1, away: 1 },
    time: '75',
    odds: {
      home: 2.10,
      draw: 3.20,
      away: 2.80
    }
  },
  {
    id: '2',
    homeTeam: 'Liverpool',
    awayTeam: 'Manchester United',
    league: 'Premier League',
    startTime: new Date('2024-03-09T21:00:00Z'),
    status: 'live',
    score: { home: 2, away: 0 },
    time: '62',
    odds: {
      home: 1.90,
      draw: 3.50,
      away: 4.20
    }
  },
  {
    id: '3',
    homeTeam: 'Barcelona',
    awayTeam: 'Real Madrid',
    league: 'La Liga',
    startTime: new Date('2024-03-10T20:00:00Z'),
    status: 'scheduled',
    score: { home: 0, away: 0 },
    time: null,
    odds: {
      home: 2.30,
      draw: 3.10,
      away: 3.00
    }
  },
  {
    id: '4',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    league: 'Bundesliga',
    startTime: new Date('2024-03-09T19:30:00Z'),
    status: 'finished',
    score: { home: 3, away: 2 },
    time: '90+3',
    odds: {
      home: 1.80,
      draw: 3.80,
      away: 4.50
    }
  }
]

// Get all matches
router.get('/', (req, res) => {
  res.json({
    matches: matches.map(match => ({
      id: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      league: match.league,
      startTime: match.startTime,
      status: match.status,
      score: match.score,
      time: match.time,
      odds: match.odds
    }))
  })
})

// Get live matches
router.get('/live', (req, res) => {
  const liveMatches = matches.filter(match => match.status === 'live')
  res.json({
    matches: liveMatches
  })
})

// Get upcoming matches
router.get('/upcoming', (req, res) => {
  const upcomingMatches = matches.filter(match => match.status === 'scheduled')
  res.json({
    matches: upcomingMatches
  })
})

// Get match by ID
router.get('/:id', (req, res) => {
  const match = matches.find(m => m.id === req.params.id)
  if (!match) {
    return res.status(404).json({
      error: 'Match not found'
    })
  }

  res.json({
    match
  })
})

// Update match score (for demo purposes)
router.post('/:id/update-score', (req, res) => {
  const match = matches.find(m => m.id === req.params.id)
  if (!match) {
    return res.status(404).json({
      error: 'Match not found'
    })
  }

  const { homeScore, awayScore, time } = req.body

  if (homeScore !== undefined) match.score.home = homeScore
  if (awayScore !== undefined) match.score.away = awayScore
  if (time !== undefined) match.time = time

  res.json({
    message: 'Match updated successfully',
    match
  })
})

module.exports = router