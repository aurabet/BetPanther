const express = require('express')
const jwt = require('jsonwebtoken')

const router = express.Router()

// Mock database (in real app, use a proper database)
const users = []
const matches = []
const bets = []

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      error: 'Access token required'
    })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid or expired token'
      })
    }
    req.user = user
    next()
  })
}

// Place a bet
router.post('/place', authenticateToken, (req, res) => {
  const { matchId, betType, amount, odds } = req.body
  const userId = req.user.userId

  // Find user
  const user = users.find(u => u.id === userId)
  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    })
  }

  // Find match
  const match = matches.find(m => m.id === matchId)
  if (!match) {
    return res.status(404).json({
      error: 'Match not found'
    })
  }

  // Validate bet
  if (!betType || !amount || !odds) {
    return res.status(400).json({
      error: 'Missing required fields: betType, amount, odds'
    })
  }

  if (amount <= 0) {
    return res.status(400).json({
      error: 'Invalid bet amount'
    })
  }

  if (user.balance < amount) {
    return res.status(400).json({
      error: 'Insufficient balance'
    })
  }

  // Create bet
  const newBet = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    matchId,
    betType,
    amount,
    odds,
    potentialWin: amount * odds,
    status: 'pending',
    createdAt: new Date()
  }

  // Deduct amount from user balance
  user.balance -= amount

  // Add bet to database
  bets.push(newBet)

  res.status(201).json({
    message: 'Bet placed successfully',
    bet: newBet,
    userBalance: user.balance
  })
})

// Get user bets
router.get('/user', authenticateToken, (req, res) => {
  const userId = req.user.userId
  const userBets = bets.filter(bet => bet.userId === userId)

  res.json({
    bets: userBets
  })
})

// Get bet by ID
router.get('/:id', authenticateToken, (req, res) => {
  const bet = bets.find(b => b.id === req.params.id)
  if (!bet) {
    return res.status(404).json({
      error: 'Bet not found'
    })
  }

  // Check if user owns this bet
  if (bet.userId !== req.user.userId) {
    return res.status(403).json({
      error: 'Access denied'
    })
  }

  res.json({
    bet
  })
})

// Update bet status (for demo purposes)
router.post('/:id/update-status', authenticateToken, (req, res) => {
  const bet = bets.find(b => b.id === req.params.id)
  if (!bet) {
    return res.status(404).json({
      error: 'Bet not found'
    })
  }

  // Check if user owns this bet
  if (bet.userId !== req.user.userId) {
    return res.status(403).json({
      error: 'Access denied'
    })
  }

  const { status, wonAmount } = req.body

  if (!status) {
    return res.status(400).json({
      error: 'Status is required'
    })
  }

  bet.status = status

  // If bet won, add winnings to user balance
  if (status === 'won' && wonAmount) {
    const user = users.find(u => u.id === bet.userId)
    if (user) {
      user.balance += wonAmount
      bet.wonAmount = wonAmount
    }
  }

  res.json({
    message: 'Bet status updated successfully',
    bet
  })
})

module.exports = { router, authenticateToken }