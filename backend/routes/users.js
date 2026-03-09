const express = require('express')
const jwt = require('jsonwebtoken')

const router = express.Router()

// Mock database (in real app, use a proper database)
const users = []

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

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId)
  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    })
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      createdAt: user.createdAt
    }
  })
})

// Update user balance (for demo purposes)
router.post('/update-balance', authenticateToken, (req, res) => {
  const { amount } = req.body
  const user = users.find(u => u.id === req.user.userId)

  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    })
  }

  if (!amount || isNaN(amount)) {
    return res.status(400).json({
      error: 'Invalid amount'
    })
  }

  user.balance += parseFloat(amount)

  res.json({
    message: 'Balance updated successfully',
    balance: user.balance
  })
})

module.exports = { router, authenticateToken }