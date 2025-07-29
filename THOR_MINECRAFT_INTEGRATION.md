# Thor Minecraft Integration

This feature allows players in Minecraft to interact with Thor the Bot directly through chat by saying "Hey Thor" followed by their question.

## How It Works

### 1. **Message Detection**
- The system monitors all Minecraft chat messages
- When a message contains trigger phrases like "Hey Thor", "Thor", "Hey Thor!", etc., it automatically processes the message
- The trigger phrase is removed and the remaining text is sent to the AI

### 2. **AI Processing**
- Thor uses the same AI service as the web chat
- Has access to all Nordics database data (towns, nations, etc.)
- Has access to all AI documents from the `ai-docs` bucket
- Generates concise responses suitable for Minecraft chat

### 3. **Response Delivery**
- Thor's response is sent back to Minecraft through the WebSocket
- Responses are automatically truncated to fit Minecraft chat limits
- Each player has a cooldown to prevent spam

## Current Implementation

### Frontend (React)
- ✅ **ThorMinecraftService**: Handles message detection and AI processing
- ✅ **WebSocket Integration**: Automatically detects "Hey Thor" messages
- ✅ **Admin Panel**: Test and configure the integration
- ✅ **Cooldown System**: Prevents spam from individual players
- ✅ **Response Truncation**: Ensures responses fit Minecraft chat

### Backend (WebSocket Server)
- ✅ **Message Forwarding**: Sends Thor responses to Minecraft
- ✅ **Message Type**: Uses `thor_response` type for Thor messages

## Required Minecraft Plugin Changes

The Minecraft plugin (WebChatSync) needs to handle the new `thor_response` message type:

### Java Code to Add:

```java
// In your WebSocket message handler
case "thor_response":
    String thorPlayer = data.getString("player");
    String thorMessage = data.getString("message");
    
    // Broadcast Thor's response to all players
    Bukkit.broadcastMessage("§6⚡ Thor: §f" + thorMessage);
    break;
```

### Alternative Implementation (if you prefer):

```java
// If you want Thor to appear as a special player
case "thor_response":
    String thorMessage = data.getString("message");
    
    // Create a fake player message or use a special format
    String formattedMessage = "§6⚡ Thor §8» §f" + thorMessage;
    Bukkit.broadcastMessage(formattedMessage);
    break;
```

## Configuration

### Trigger Phrases
- `hey thor`
- `thor`
- `hey thor!`
- `thor!`
- `ask thor`
- `thor bot`
- `hey thor bot`
- `thor help`
- `hey thor help`

### Settings
- **Response Prefix**: `⚡ Thor: ` (customizable)
- **Max Response Length**: 200 characters (Minecraft chat limit)
- **Cooldown**: 5000ms (5 seconds) per player
- **AI Model**: `grok-3-mini` (fast and cost-effective)

## Testing

### Admin Panel Features:
1. **Test Response**: Send test messages as Thor
2. **Configuration**: Adjust settings in real-time
3. **Clear Cooldowns**: Reset player cooldowns
4. **Status Monitoring**: See connection and enable/disable status

### Example Usage:
1. Player types: `Hey Thor, what's the balance of Garvia?`
2. System detects trigger and extracts: `what's the balance of Garvia?`
3. AI processes with database context
4. Thor responds: `⚡ Thor: Garvia has a balance of 15,000 coins.`

## Benefits

1. **Seamless Integration**: Players don't need to leave Minecraft
2. **Real-time Data**: Access to live database information
3. **Consistent Experience**: Same AI responses as web chat
4. **Anti-spam Protection**: Cooldown system prevents abuse
5. **Admin Control**: Full configuration and testing capabilities

## Future Enhancements

1. **Whitelist/Blacklist**: Control which players can use Thor
2. **Custom Triggers**: Allow server-specific trigger phrases
3. **Response History**: Log all Thor interactions
4. **Advanced Filtering**: Filter inappropriate questions
5. **Multi-language Support**: Support for different languages

## Troubleshooting

### Common Issues:
1. **Thor not responding**: Check WebSocket connection and plugin configuration
2. **Responses too long**: Adjust max response length in admin panel
3. **Too many requests**: Increase cooldown time
4. **AI errors**: Check API key and network connectivity

### Debug Information:
- All Thor interactions are logged to browser console
- Admin panel shows real-time status
- WebSocket messages are logged for debugging 