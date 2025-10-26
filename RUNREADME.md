# Complete Execution Guide - SEM5-PI-WEBAPI

This document explains **how to run the SEM5-PI-WEBAPI project** both **in local environment** and **on remote servers**, including:

* How to **perform automatic deployment to multiple servers**
* How to **configure and reset the database**
* How to **execute seeding (Bootstrap)**
* How to **switch between production (Nginx) and development (local) environments**
* And how to **verify server and database status**

---

## Infrastructure Architecture

The project uses **Nginx as Load Balancer** with automatic failover across 4 backend servers:

```
Client
   ↓
Nginx Load Balancer (10.9.23.188:80)
   ├─→ Server 1 (10.9.21.87:5008) [Primary]
   ├─→ Server 2 (10.9.23.173:5008) [Backup]
   ├─→ Server 3 (10.9.23.147:5008) [Backup]
   └─→ Server 4 (10.9.23.188:5008) [Backup + Nginx host]
```

**Production endpoint:** `http://10.9.23.188/api/`

---

## Configure SSH Access (Required)

Before deployment, SSH key-based authentication must be configured.

### 1. Generate SSH key (if it doesn't exist):

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Press Enter 3 times (no password for automation).

### 2. Copy key to all servers:

```bash
ssh-copy-id root@10.9.21.87
ssh-copy-id root@10.9.23.173
ssh-copy-id root@10.9.23.147
ssh-copy-id root@10.9.23.188
```

Enter password `3dj03` for each server (only once).

### 3. Test connection:

```bash
ssh root@10.9.23.188 "echo 'SSH works!'"
```

If "SSH works!" appears without asking for password, configuration is successful.

---

## Automatic Deployment (Recommended)

The project uses the `deploy-safe.sh` script which:
- Publishes the project for Linux
- Sends files to servers via SCP
- Restarts the API automatically
- Manages the API Guardian (auto-recovery system)

### Deploy to a specific server:

```bash
# Linux/macOS
./deploy-safe.sh 1    # Deploy to Server 1 (10.9.21.87)
./deploy-safe.sh 2    # Deploy to Server 2 (10.9.23.173)
./deploy-safe.sh 3    # Deploy to Server 3 (10.9.23.147)
./deploy-safe.sh 4    # Deploy to Server 4 (10.9.23.188)

# Windows PowerShell
.\deploy-safe.ps1 1
.\deploy-safe.ps1 2
.\deploy-safe.ps1 3
.\deploy-safe.ps1 4
```

### Deploy to all servers:

```bash
# Linux/macOS
./deploy-safe.sh all

# Windows PowerShell
.\deploy-safe.ps1 all
```

**Note:** The script automatically stops the API Guardian during deployment on server 2 and restarts it after completion.

---

## Switch Between Production and Development

Use the `switch-env.sh` script to update all `.http` files automatically:

### Production Mode (Nginx Load Balancer):

```bash
# Linux/macOS
./switch-env.sh nginx

# Windows PowerShell
.\switch-env.ps1 nginx
```

All `.http` files will point to: `http://10.9.23.188`

### Development Mode (Local):

```bash
# Linux/macOS
./switch-env.sh local

# Windows PowerShell
.\switch-env.ps1 local
```

All `.http` files will point to: `http://localhost:5008`

---

## Reset or Clean PostgreSQL Database

To **reset or completely clean the database**:

| Operating System | Script                              |
| ---------------- | ----------------------------------- |
| Linux / macOS    | `DataBase-Script-Linux-Mac-VMdb.sh` |
| Windows          | `DataBase-Script-Windows-VMdb.ps1`  |

### Execute (Linux / macOS):

```bash
bash DataBase-Script-Linux-Mac-VMdb.sh
```

### Execute (Windows PowerShell):

```powershell
.\DataBase-Script-Windows-VMdb.ps1
```

**Database credentials:**
- **Host:** `vs453.dei.isep.ipp.pt`
- **Port:** `5432`
- **Database:** `sem5pi_db`
- **Username:** `postgres`
- **Password:** `2jyErozGHiZJ`

The script removes all tables, views, and sequences from the `public` schema and recreates the initial state.

---

## Verify Database Status

### A) Using pgAdmin 4:

1. Open pgAdmin 4
2. Add a new server:
    - **Host:** `vs453.dei.isep.ipp.pt`
    - **Port:** `5432`
    - **Database:** `sem5pi_db`
    - **Username:** `postgres`
    - **Password:** `2jyErozGHiZJ`

### B) Using Rider (Database Tool):

1. Open Rider → **Database** tab
2. Click ➕ → **Data Source → PostgreSQL**
3. In "URL", enter:

   ```
   jdbc:postgresql://vs453.dei.isep.ipp.pt:5432/sem5pi_db?connectTimeout=15&password=2jyErozGHiZJ&user=postgres
   ```

4. Click **Test Connection** → should show *Connection successful*

---

## Execute Bootstrap (Seed)

The **Bootstrap** loads initial data from JSON files in the `/Seed` folder.

### On any remote server:

```bash
ssh root@10.9.21.87
cd /var/www/sem5_api
ASPNETCORE_ENVIRONMENT=Development ./SEM5-PI-WEBAPI --seed
```

**Note:** If the environment is set to `Production`, seeding is **automatically ignored** for security.

### Locally:

```bash
dotnet run --seed
```

---

## Verify Server Status

### Check if API is running:

```bash
# On a specific server
ssh root@10.9.21.87 "ps aux | grep SEM5-PI-WEBAPI"

# View logs in real-time
ssh root@10.9.21.87 "tail -f /var/log/sem5-api.log"
```

### Check if Nginx is active:

```bash
ssh root@10.9.23.188 "sudo systemctl status nginx"
```

### Check API Guardian (auto-recovery):

```bash
ssh root@10.9.23.188 "sudo systemctl status api-guardian"

# View Guardian logs
ssh root@10.9.23.188 "tail -f /var/log/api-guardian.log"
```

### Check if port 5008 is in use:

```bash
ssh root@10.9.21.87 "sudo ss -tuln | grep 5008"
```

If it shows:
```
LISTEN 0 100 *:5008 *:*
```
The API is active and listening on port 5008.

---

## Test the API

### Via Nginx Load Balancer (Production):

```http
GET http://10.9.23.188/api/StaffMembers
Accept: application/json
```

### Direct to a server (Bypass Nginx):

```http
GET http://10.9.21.87:5008/api/StaffMembers
Accept: application/json
```

### Locally:

```http
GET http://localhost:5008/api/StaffMembers
Accept: application/json
```

Expected response:

```json
[
  {
    "id": "0e901230-08c8-418c-9d81-6fe3925e6c61",
    "shortName": "Alice Johnson",
    "mecanographicNumber": "1250001",
    ...
  }
]
```

---

## Run Locally (Development Mode)

### Without seeding:

```bash
dotnet run
```

### With seeding:

```bash
dotnet run --seed
```

The API will be available at:
- HTTP: `http://localhost:5008`
- HTTPS: `https://localhost:7275`

---

## Run Unit Tests

```bash
dotnet test
```

.NET compiles and executes all `xUnit` tests:

```
Passed!  52 tests run in 4.31s
```

---

## View Application Logs

### General logs:

```bash
ssh root@10.9.21.87
tail -f Logs/GeneralLogs/general-$(date +%Y%m%d).log
```

### Seeding logs:

```bash
tail -f Logs/Bootstrap/bootstrap-$(date +%Y%m%d).log
```

### Nginx logs:

```bash
ssh root@10.9.23.188
tail -f /var/log/nginx/access.log  # HTTP requests
tail -f /var/log/nginx/error.log   # Errors
```

### API Guardian logs:

```bash
ssh root@10.9.23.188
tail -f /var/log/api-guardian.log
```

---

## Service Management

### Nginx:

```bash
ssh root@10.9.23.188

# View status
sudo systemctl status nginx

# Restart
sudo systemctl restart nginx

# Stop
sudo systemctl stop nginx

# Start
sudo systemctl start nginx
```

### API Guardian:

```bash
ssh root@10.9.23.188

# View status
sudo systemctl status api-guardian

# Restart
sudo systemctl restart api-guardian

# Stop
sudo systemctl stop api-guardian

# Start
sudo systemctl start api-guardian
```

### API manually (if needed):

```bash
ssh root@10.9.21.87

# Stop
pkill -f SEM5-PI-WEBAPI

# Start
cd /var/www/sem5_api
nohup ./SEM5-PI-WEBAPI --urls http://0.0.0.0:5008 > /dev/null 2>&1 &
```

---

## Essential Commands Summary

| Action | Command |
|--------|---------|
| **Deploy to specific server** | `./deploy-safe.sh 1` (or 2, 3, 4) |
| **Deploy to all** | `./deploy-safe.sh all` |
| **Switch to production** | `./switch-env.sh nginx` |
| **Switch to development** | `./switch-env.sh local` |
| **Reset database** | `bash DataBase-Script-Linux-Mac-VMdb.sh` |
| **Execute seed remotely** | `ssh root@10.9.21.87 "cd /var/www/sem5_api && ASPNETCORE_ENVIRONMENT=Development ./SEM5-PI-WEBAPI --seed"` |
| **Execute seed locally** | `dotnet run --seed` |
| **Check API running** | `ssh root@10.9.21.87 "ps aux | grep SEM5-PI-WEBAPI"` |
| **View Guardian logs** | `ssh root@10.9.23.188 "tail -f /var/log/api-guardian.log"` |
| **Test API (production)** | `curl http://10.9.23.188/api/StaffMembers` |
| **Test API (local)** | `curl http://localhost:5008/api/StaffMembers` |
| **Run tests** | `dotnet test` |

---

## Troubleshooting

### Issue: "502 Bad Gateway" when accessing via Nginx

**Cause:** No backend server is responding.

**Solution:**
```bash
# Deploy to all servers
./deploy-safe.sh all

# Check if APIs are running
ssh root@10.9.21.87 "ps aux | grep SEM5-PI-WEBAPI"
```

### Issue: Deploy asks for SSH password

**Cause:** SSH key not configured.

**Solution:** Follow the "Configure SSH Access" section at the beginning of this document.

### Issue: API Guardian does not start the API

**Cause:** Missing dependencies or incorrect permissions.

**Solution:**
```bash
ssh root@10.9.23.188

# Install dependencies
sudo apt install -y libicu-dev

# Check permissions
chmod +x /var/www/sem5_api/SEM5-PI-WEBAPI

# View Guardian logs
tail -50 /var/log/api-guardian.log
```

### Issue: Cannot connect to database

**Cause:** Incorrect credentials or firewall.

**Solution:** Verify:
- Host: `vs453.dei.isep.ipp.pt`
- Port: `5432`
- Database: `sem5pi_db`
- Username: `postgres`
- Password: `2jyErozGHiZJ`

---

## Additional Documentation

For detailed information about the infrastructure, consult:
- `INFRASTRUCTURE_SETUP_REPORT.md` - Complete architecture and system configuration

