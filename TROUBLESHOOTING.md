# Bloom.host Troubleshooting Guide

## 🚨 "Cannot find module '/home/container/index.js'" Error

If you're getting this error, here are the solutions:

### **Solution 1: Check Startup File Setting**

Make sure your bloom.host server has:
- **Startup File**: `index.js` (not `server.js` or anything else)

### **Solution 2: Try Alternative Server File**

If `index.js` still doesn't work, try:
- **Startup File**: `server.js`
- **Startup Command**: Change the last part to: `/usr/local/bin/node /home/container/server.js`

### **Solution 3: Verify File Exists**

The server should pull these files from GitHub:
- `index.js` ✅
- `server.js` ✅ 
- `config.js` ✅
- `package.json` ✅

### **Solution 4: Check GitHub Repository**

1. Go to: https://github.com/SwineFeather/nordics-mc
2. Verify these files exist in the main branch
3. Make sure they're not in a subfolder

### **Solution 5: Force Reinstall**

In your bloom.host server:
1. Stop the server
2. Go to "File Manager"
3. Delete all files
4. Restart the server (it will reinstall from GitHub)

### **Solution 6: Manual File Upload**

If GitHub pull isn't working:
1. Download the files from GitHub
2. Upload them manually to your server
3. Make sure they're in the root directory

### **Solution 7: Check Server Logs**

Look for these messages in the logs:
- "Pulling Docker container image" ✅
- "Finished pulling Docker container image" ✅
- Any git pull errors ❌

### **Solution 8: Alternative Startup Command**

Try this modified startup command:
```bash
if [[ -d .git ]] && [[ ${AUTO_UPDATE} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install --production; fi; ls -la /home/container/ && /usr/local/bin/node /home/container/index.js
```

This will list the files before trying to start the server.

## 🔍 **Debugging Steps**

1. **Check file existence**: Look for `ls -la` output in logs
2. **Verify git pull**: Check if GitHub code is being pulled
3. **Check permissions**: Ensure files are readable
4. **Verify paths**: Make sure files are in `/home/container/`

## 📞 **Still Having Issues?**

1. Check bloom.host support documentation
2. Verify your server has enough disk space
3. Make sure the Docker image supports Node.js
4. Try creating a new server instance

## 🎯 **Quick Fix Checklist**

- [ ] Startup File = `index.js`
- [ ] GitHub repo is correct
- [ ] Files exist in GitHub main branch
- [ ] Server has enough disk space
- [ ] Git pull is working
- [ ] Files are in `/home/container/` directory
