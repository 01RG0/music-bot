# 🎵 Discord Music Bot - Windows Batch Files

## 📋 Available Batch Files

### **☕ Java Setup (No Docker)**
#### **`setup-no-docker.bat`** - ⚙️ **Setup without Docker**
**Requirements:** Node.js + Java 11+
```batch
setup-no-docker.bat    # Setup with Java
start-no-docker.bat    # Start all services
```

#### **`start-no-docker.bat`** - 🚀 **Start with Java Lavalink**
**Services:** Bot, API, Web + Java Lavalink JAR

---

### **☁️ Cloud Setup (Simplest)**
#### **`setup-cloud.bat`** - ⚙️ **Setup with Cloud Lavalink**
**Requirements:** Node.js only (no Docker/Java needed!)
```batch
setup-cloud.bat    # Setup with cloud Lavalink
start-cloud.bat    # Start all services
```

#### **`start-cloud.bat`** - 🚀 **Start with Cloud Lavalink**
**Services:** Bot, API, Web + Free public Lavalink

---

### **🛑 Universal Control**
#### **`stop.bat`** - Stop All Services
**Works with all setups**
```batch
stop.bat    # Stop all running services
```

#### **`status.bat`** - Check Service Status
**Works with all setups**
```batch
status.bat    # Check running services and ports
```

---

### **`stop.bat`** - Stop All Services
**Purpose:** Gracefully shut down all running services

**What it does:**
- ✅ Stops Lavalink Docker container
- ✅ Terminates all Node.js processes
- ✅ Cleans up running services

**When to use:** When you want to stop the application

```batch
stop.bat
```

---

### **`status.bat`** - Check Service Status
**Purpose:** Monitor running services and troubleshoot issues

**What it checks:**
- 🎵 Lavalink Docker container status
- 🤖 Running Node.js processes
- 🌐 Open ports (3000, 4000, 2333)
- ⚙️ Environment file and dependencies

**When to use:** To troubleshoot startup issues or check if services are running

```batch
status.bat
```

---

## 🎵 Lavalink Setup Options

### **Option 1: Java (Local)**
- ✅ **Pros:** Full control, reliable, production-ready
- ❌ **Cons:** Requires Java 11+ installation
- ☕ **Use:** `setup-no-docker.bat` + `start-no-docker.bat`

### **Option 2: Cloud (Simplest)**
- ✅ **Pros:** Direct control, no Docker needed
- ❌ **Cons:** Manual JAR download, Java required
- ☕ **Use:** `setup-no-docker.bat` + `start-no-docker.bat`

### **Option 3: Cloud (Simplest)**
- ✅ **Pros:** No setup required, just works
- ❌ **Cons:** Public server (may have limits/rate limits)
- ☁️ **Use:** `setup-cloud.bat` + `start-cloud.bat`

---

## 🚀 Quick Start Guide

### **First Time Setup:**
```batch
# 1. Run setup
setup.bat

# 2. Edit .env file with your credentials
# (setup.bat will open it automatically)

# 3. Start the application
start.bat
```

### **Normal Usage:**
```batch
# Start services
start.bat

# Check status
status.bat

# Stop services
stop.bat
```

---

## 🔧 Manual Commands (Alternative)

If batch files don't work, you can run commands manually:

### **Start Lavalink (Java):**
```batch
cd lavalink
java -jar Lavalink.jar
cd ..
```

### **Start Lavalink (Docker - Alternative):**
```batch
cd lavalink
docker-compose up -d
cd ..
```

### **Start Services:**
```batch
# Terminal 1 - Bot
npm run dev --workspace=apps/bot

# Terminal 2 - API
npm run dev --workspace=apps/api

# Terminal 3 - Web
npm run dev --workspace=apps/web
```

### **Check Ports:**
```batch
netstat -an | findstr ":3000"
netstat -an | findstr ":4000"
netstat -an | findstr ":2333"
```

---

## 🐛 Troubleshooting

### **"Node.js is not installed"**
```batch
# Download from https://nodejs.org
# Install LTS version
# Restart command prompt
node --version  # Should show version
```

### **"Java is not installed"**
```batch
# Download from https://adoptium.net/ (Recommended)
# Or from https://java.com
# Install JDK 11 or higher
java -version  # Should show version 11+
```

### **Services won't start**
```batch
# Check status
status.bat

# Check .env file
type .env

# Check logs in terminal output
```

### **Port already in use**
```batch
# Kill process using port
netstat -ano | findstr ":3000"
taskkill /PID <PID> /F
```

---

## 📊 Service URLs

Once running, access your application at:

- **Web Dashboard:** http://localhost:3000
- **API Server:** http://localhost:4000
- **API Health Check:** http://localhost:4000/health
- **Lavalink:** http://localhost:2333

---

## 🎯 Pro Tips

1. **Run as Administrator** if you get permission errors
2. **Close other terminals** using ports 3000, 4000, 2333
3. **Check Windows Firewall** if services can't connect
4. **Use `status.bat`** frequently to monitor services
5. **Use `status.bat`** to monitor all services

---

## 📁 File Structure

```
your-project/
├── ☕ setup-no-docker.bat     # Setup with Java Lavalink
├── ☕ start-no-docker.bat     # Start with Java Lavalink
├── ☁️ setup-cloud.bat         # Setup with cloud Lavalink
├── ☁️ start-cloud.bat         # Start with cloud Lavalink
├── 🛑 stop.bat               # Stop all services
├── 📊 status.bat             # Check service status
├── 🔐 .env                   # Environment configuration
├── 🎵 lavalink/              # Lavalink server files
│   ├── application.yml       # Lavalink configuration
│   ├── Lavalink.jar         # Lavalink JAR (Java setup)
│   └── docker-compose.yml    # Docker setup (alternative)
├── 🤖 apps/                  # Bot, API, Web applications
└── 📦 node_modules/          # Dependencies
```

---

## ☁️ Public Lavalink Servers

If using cloud setup, here are some free public Lavalink servers:

### **Recommended Free Server:**
```env
LAVALINK_HOST=lavalink.darrennathanael.com
LAVALINK_PORT=80
LAVALINK_PASSWORD=maybeiwasboring
LAVALINK_SECURE=false
```

### **Alternative Servers:**
```env
# Server 2
LAVALINK_HOST=eu-lavalink.lexnet.cc
LAVALINK_PORT=443
LAVALINK_PASSWORD=lexn3tl@val1nk
LAVALINK_SECURE=true

# Server 3
LAVALINK_HOST=loser.gg
LAVALINK_PORT=443
LAVALINK_PASSWORD=damnsonwheredyoufindthis
LAVALINK_SECURE=true
```

⚠️ **Note:** Public servers may have rate limits or downtime. For production, run your own Lavalink instance.

---

## 🎯 Choose Your Setup

| Setup Type | Requirements | Best For | Setup Command |
|------------|-------------|----------|----------------|
| **☕ Java** | Node.js + Java 11+ | Production | `setup-no-docker.bat` |
| **☁️ Cloud** | Node.js only | Quick start | `setup-cloud.bat` |

**Happy botting! 🎵🤖**
