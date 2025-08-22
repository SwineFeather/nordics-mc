// Test script to check debug mode status
console.log('Testing debug mode status...');

// Check if debug functions are available on window
if (typeof window !== 'undefined') {
  console.log('Window object available');
  
  if (window.enableWikiDebug) {
    console.log('enableWikiDebug function found on window');
  } else {
    console.log('enableWikiDebug function NOT found on window');
  }
  
  if (window.disableWikiDebug) {
    console.log('disableWikiDebug function found on window');
  } else {
    console.log('disableWikiDebug function NOT found on window');
  }
  
  if (window.getDebugStatus) {
    console.log('getDebugStatus function found on window');
    try {
      const status = window.getDebugStatus();
      console.log('Current debug status:', status);
    } catch (error) {
      console.log('Error getting debug status:', error);
    }
  } else {
    console.log('getDebugStatus function NOT found on window');
  }
} else {
  console.log('Window object not available (Node.js environment)');
}

console.log('Debug mode test completed');
