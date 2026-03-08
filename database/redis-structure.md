# Redis Structure for Sports Betting Platform

## Overview
Redis configuration for high-performance caching, real-time data, and session management in the sports betting platform.

## 1. Real-time Odds (TTL: 5 minutes)
```bash
# Format: odds:{match_id}:{market_type}
SET odds:12345:1x2 '{"home":1.85,"draw":3.40,"away":4.20}' EX 300
SET odds:12345:over_under_2_5 '{"over":1.90,"under":1.95}' EX 300
SET odds:12345:asian_handicap_0_5 '{"home":1.80,"away":2.00}' EX 300
```

### Redis Commands for Odds Management
```bash
# Get odds for a specific match and market
GET odds:12345:1x2

# Update odds (atomic operation)
SET odds:12345:1x2 '{"home":1.90,"draw":3.20,"away":4.00}' EX 300

# Check if odds exist
EXISTS odds:12345:1x2

# Get time to expiration
TTL odds:12345:1x2
```

## 2. User Sessions (TTL: 24 hours)
```bash
# Format: session:{session_id}
HSET session:abc123 user_id "550e8400-e29b-41d4-a716-446655440000" balance "1000.00" last_activity "2024-01-15T10:30:00Z" ip_address "192.168.1.100"
EXPIRE session:abc123 86400

# Session with additional metadata
HSET session:def456 user_id "uuid-456" balance "500.00" currency "XOF" country "GN" device_type "mobile" user_agent "Mozilla/5.0..."
EXPIRE session:def456 86400
```

### Redis Commands for Session Management
```bash
# Get all session data
HGETALL session:abc123

# Get specific session field
HGET session:abc123 balance

# Update session activity
HSET session:abc123 last_activity "2024-01-15T11:00:00Z"
EXPIRE session:abc123 86400  # Reset TTL

# Check session validity
EXISTS session:abc123
TTL session:abc123
```

## 3. Leaderboard System (Real-time Updates)
```bash
# Daily leaderboard
ZADD leaderboard:daily:2024-01-15 5000 "user:123" 3500 "user:456" 2800 "user:789"

# Weekly leaderboard
ZADD leaderboard:weekly:2024-W03 15000 "user:123" 12000 "user:456" 9500 "user:789"

# Monthly leaderboard
ZADD leaderboard:monthly:2024-01 50000 "user:123" 42000 "user:456" 38000 "user:789"

# All-time leaderboard
ZADD leaderboard:all_time 150000 "user:123" 120000 "user:456" 95000 "user:789"
```

### Redis Commands for Leaderboard Management
```bash
# Get top 10 users
ZREVRANGE leaderboard:daily:2024-01-15 0 9 WITHSCORES

# Get user rank
ZREVRANK leaderboard:daily:2024-01-15 "user:123"

# Get user score
ZSCORE leaderboard:daily:2024-01-15 "user:123"

# Get leaderboard size
ZCARD leaderboard:daily:2024-01-15

# Remove user from leaderboard
ZREM leaderboard:daily:2024-01-15 "user:999"

# Update user score (incremental)
ZINCRBY leaderboard:daily:2024-01-15 500 "user:123"
```

## 4. Live Betting Counters
```bash
# Format: live_bets:{match_id}
INCR live_bets:12345
INCR live_bets:12346
INCR live_bets:12347

# Reset counter (after match ends)
DEL live_bets:12345
```

### Redis Commands for Live Betting
```bash
# Get current bet count for match
GET live_bets:12345

# Increment bet count atomically
INCR live_bets:12345

# Set initial value
SET live_bets:12345 0

# Check if counter exists
EXISTS live_bets:12345
```

## 5. Popular Matches Cache
```bash
# Format: popular_matches
SADD popular_matches 12345 12346 12347 12348 12349

# Popular matches by category
SADD popular_matches:football 12345 12346 12347
SADD popular_matches:live 12348 12349 12350
SADD popular_matches:upcoming 12351 12352 12353
```

### Redis Commands for Popular Matches
```bash
# Check if match is popular
SISMEMBER popular_matches 12345

# Get all popular matches
SMEMBERS popular_matches

# Add match to popular list
SADD popular_matches 12350

# Remove match from popular list
SREM popular_matches 12345

# Get popular matches count
SCARD popular_matches

# Get random popular match
SRANDMEMBER popular_matches 1
```

## 6. Rate Limiting System
```bash
# Format: rate_limit:{ip}:{endpoint}
INCR rate_limit:192.168.1.1:api/bets
EXPIRE rate_limit:192.168.1.1:api/bets 60

# Rate limiting by user
INCR rate_limit:user:123:api/deposit
EXPIRE rate_limit:user:123:api/deposit 300

# Rate limiting by endpoint type
INCR rate_limit:api:matches
EXPIRE rate_limit:api:matches 10
```

### Redis Commands for Rate Limiting
```bash
# Check current request count
GET rate_limit:192.168.1.1:api/bets

# Increment and check expiration
INCR rate_limit:192.168.1.1:api/bets
TTL rate_limit:192.168.1.1:api/bets

# Set rate limit with expiration
SET rate_limit:192.168.1.1:api/bets 1 EX 60

# Check if rate limit exists
EXISTS rate_limit:192.168.1.1:api/bets
```

## 7. Additional Redis Structures

### 7.1. User Preferences Cache
```bash
# Format: user_preferences:{user_id}
HSET user_preferences:123 favorite_sports "football,basketball" notification_settings "email,sms" language "fr" theme "dark"
EXPIRE user_preferences:123 3600
```

### 7.2. Match Statistics Cache
```bash
# Format: match_stats:{match_id}
HSET match_stats:12345 home_possession "55" away_possession "45" home_shots "8" away_shots "6" corners "3-2"
EXPIRE match_stats:12345 600
```

### 7.3. Betting History Cache
```bash
# Format: user_bets:{user_id}
LPUSH user_bets:123 '{"match_id":12345,"market":"1x2","selection":"home","stake":100,"odds":1.85,"status":"pending"}'
LTRIM user_bets:123 0 99  # Keep last 100 bets
EXPIRE user_bets:123 86400
```

### 7.4. Live Match Updates
```bash
# Format: live_updates:{match_id}
LPUSH live_updates:12345 '{"type":"goal","team":"home","minute":45,"score":"1-0"}'
LTRIM live_updates:12345 0 199  # Keep last 200 updates
EXPIRE live_updates:12345 3600
```

### 7.5. System Notifications
```bash
# Format: notifications
LPUSH notifications '{"type":"maintenance","message":"System maintenance scheduled","timestamp":"2024-01-15T22:00:00Z"}'
LTRIM notifications 0 99
```

## 8. Redis Configuration for Production

### 8.1. Memory Management
```bash
# Set maximum memory
CONFIG SET maxmemory 2gb

# Set memory policy
CONFIG SET maxmemory-policy allkeys-lru

# Enable persistence (optional for cache)
CONFIG SET save "900 1 300 10 60 10000"
```

### 8.2. Performance Optimization
```bash
# Enable pipelining for batch operations
# Use MULTI/EXEC for atomic operations
# Use Lua scripts for complex operations
```

### 8.3. Monitoring Commands
```bash
# Check memory usage
INFO memory

# Check key statistics
INFO keyspace

# Monitor commands in real-time
MONITOR

# Check slow queries
SLOWLOG GET 10
```

## 9. Redis Cluster Configuration (for scaling)

### 9.1. Cluster Setup
```bash
# Start Redis cluster nodes
redis-server --port 7000 --cluster-enabled yes --cluster-config-file nodes-7000.conf
redis-server --port 7001 --cluster-enabled yes --cluster-config-file nodes-7001.conf
redis-server --port 7002 --cluster-enabled yes --cluster-config-file nodes-7002.conf

# Create cluster
redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 --cluster-replicas 0
```

### 9.2. Key Distribution Strategy
```bash
# Use consistent hashing for key distribution
# Hash tags for related data: {user:123}:session, {user:123}:bets
# Avoid hot keys by using sharding
```

## 10. Redis Backup and Recovery

### 10.1. Backup Commands
```bash
# Create RDB snapshot
BGSAVE

# Create AOF rewrite
BGREWRITEAOF

# Backup specific keys
redis-cli --scan --pattern "odds:*" | xargs redis-cli DUMP > odds_backup.rdb
```

### 10.2. Recovery Commands
```bash
# Restore from RDB
redis-cli --rdb restore.rdb

# Restore specific keys
redis-cli RESTORE key_name ttl value
```

This Redis structure provides high-performance caching, real-time data management, and scalable infrastructure for the sports betting platform with proper TTL management, atomic operations, and monitoring capabilities.