# Debug Controls

This document explains how to control debug logging in the application to reduce console noise.

## Quick Start

The easiest way to control debug logging is through the browser console:

```javascript
// Enable verbose wiki logging
enableWikiDebug()

// Disable verbose wiki logging  
disableWikiDebug()

// Toggle debug mode on/off
toggleWikiDebug()

// Enable comprehensive stats debug
enableComprehensiveStatsDebug()

// Disable comprehensive stats debug
disableComprehensiveStatsDebug()

// Enable all debug modes
enableAllDebug()

// Disable all debug modes
disableAllDebug()

// Check current debug status
getDebugStatus()

// Set specific service debug mode
setDebugMode('wiki', true)  // Enable wiki debug
setDebugMode('wiki', false) // Disable wiki debug
setDebugMode('comprehensiveStats', true)  // Enable stats debug
```

## Available Debug Controls

### Wiki Service
- **enableWikiDebug()** - Enable verbose wiki logging
- **disableWikiDebug()** - Disable verbose wiki logging
- **toggleWikiDebug()** - Toggle debug mode on/off

### Comprehensive Stats Service
- **enableComprehensiveStatsDebug()** - Enable verbose stats logging
- **disableComprehensiveStatsDebug()** - Disable verbose stats logging

### Global Controls
- **enableAllDebug()** - Enable all available debug modes
- **disableAllDebug()** - Disable all debug modes
- **getDebugStatus()** - Show current debug status for all services
- **setDebugMode(service, enabled)** - Set specific service debug mode

## What Gets Logged

When debug mode is enabled, you'll see logs like:

- 🔍 Directory exploration
- 📄 File discovery
- 📂 Folder creation
- ✅ Success operations
- 📡 API requests
- 🔄 Processing steps
- 📊 Stats fetching and parsing
- 🔢 Data key enumeration

## Production Use

- **Keep all debug modes disabled** in production to reduce console noise
- **Use enableWikiDebug()** temporarily when debugging specific issues
- **Use disableWikiDebug()** to turn off logging when done
- **Use enableAllDebug()** for comprehensive debugging
- **Use disableAllDebug()** to quickly silence all logging

## Example Usage

```javascript
// Debug a specific wiki operation
enableWikiDebug();

// Perform wiki operations (will show detailed logs)
// ... wiki operations ...

// Turn off logging when done
disableWikiDebug();
```

```javascript
// Comprehensive debugging session
enableAllDebug();

// Debug multiple services
// ... operations across services ...

// Clean up all logging
disableAllDebug();
```

## Service-Specific Debug Controls

### Wiki Service (Implemented)
- Controls logging in `supabaseWikiService.ts`
- Handles file discovery, content loading, and structure building
- Most verbose logging in the application

### Comprehensive Stats Service (Implemented)
- Controls logging in `comprehensiveStatsService.ts`
- Handles player statistics fetching and parsing
- Shows detailed stats fetching process

### Other Services (Planned)
- **Auto Wiki Service** - Wiki page generation and management
- **GitHub Service** - GitHub integration and sync
- **Background Sync** - Data synchronization operations
- **Analytics** - Usage tracking and metrics

## Code Changes

If you prefer to modify the code directly, you can change:

```typescript
// In src/services/supabaseWikiService.ts
private static DEBUG = false; // Set to true to enable verbose logging
```

to:

```typescript
private static DEBUG = true; // Set to true to enable verbose logging
```

Or in the comprehensive stats service:

```typescript
// In src/services/comprehensiveStatsService.ts
const DEBUG = false; // Set to true to enable verbose logging
```

to:

```typescript
const DEBUG = true; // Set to true to enable verbose logging
```

## Import and Use in Code

```typescript
import { 
  enableWikiDebug, 
  disableWikiDebug, 
  enableComprehensiveStatsDebug,
  disableComprehensiveStatsDebug,
  enableAllDebug, 
  disableAllDebug 
} from '@/utils/debugUtils';

// Enable when needed
enableWikiDebug();
enableComprehensiveStatsDebug();

// Disable when done
disableWikiDebug();
disableComprehensiveStatsDebug();
```

## Console Commands Reference

All these commands are automatically available in the browser console:

| Command | Description |
|---------|-------------|
| `enableWikiDebug()` | Enable wiki service debug logging |
| `disableWikiDebug()` | Disable wiki service debug logging |
| `toggleWikiDebug()` | Toggle wiki debug mode |
| `enableComprehensiveStatsDebug()` | Enable stats service debug logging |
| `disableComprehensiveStatsDebug()` | Disable stats service debug logging |
| `enableAllDebug()` | Enable all debug modes |
| `disableAllDebug()` | Disable all debug modes |
| `getDebugStatus()` | Show current debug status |
| `setDebugMode('wiki', true)` | Enable specific service debug |
| `setDebugMode('comprehensiveStats', true)` | Enable stats service debug |

## Current Status

- ✅ **Wiki Service** - Full runtime debug control implemented
- ✅ **Comprehensive Stats Service** - Full runtime debug control implemented
- 🔄 **Other Services** - Debug controls planned for future implementation

This approach gives you full control over when to see verbose logging without cluttering the console during normal operation.
