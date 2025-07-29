
// Utility functions for converting Minecraft color codes to CSS classes

export interface MinecraftColorResult {
  formattedText: string;
  classes: string[];
}

export const convertMinecraftColors = (text: string): MinecraftColorResult => {
  if (!text || typeof text !== 'string') {
    return { formattedText: text || '', classes: [] };
  }

  // Simple implementation - just return the text as-is with default classes
  // This can be enhanced later with actual Minecraft color code parsing
  return {
    formattedText: text,
    classes: ['text-foreground']
  };
};
