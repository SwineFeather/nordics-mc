# Nyrvalos - Simple 3D Texture Viewer

This is a simplified 3D texture viewer for the Nyrvalos system. It provides a clean, minimal interface for viewing the texture files in the `/nyrvalos` directory.

## Components

### SimpleTextureMap.tsx
A basic 3D plane component that loads and displays a texture from a given path. It uses Three.js TextureLoader to load the image and applies it to a plane geometry.

### SimpleMapScene.tsx
The main 3D scene component that provides:
- Lighting (ambient and directional)
- Camera controls (OrbitControls)
- The texture map display

### TextureSelector.tsx
A UI component that allows users to select from different texture files:
- Base layer textures (low, medium, full resolution)
- Terrain textures (low, medium, full resolution)  
- Misc textures (low, medium, full resolution)

## Features

- **3D Camera Controls**: Pan, zoom, and rotate around the texture
- **Texture Switching**: Select from 9 different texture files
- **Responsive Design**: Works on different screen sizes
- **Performance Optimized**: Uses efficient Three.js settings

## Usage

The main page (`src/pages/Nyrvalos.tsx`) combines all components to create a simple texture viewer. Users can:

1. Select different textures from the left panel
2. Navigate the 3D space using mouse controls
3. View textures in a 3D environment

## Texture Files

The system expects texture files to be located in the `/nyrvalos` directory:
- `baselayer-low.jpg`, `baselayer-med.jpg`, `baselayer-full.jpg`
- `terrain-low.png`, `terrain-med.png`, `terrain-full.png`
- `misc-low.png`, `misc-med.png`, `misc-full.png`

## Technical Details

- Built with React Three Fiber
- Uses Three.js for 3D rendering
- TypeScript for type safety
- Tailwind CSS for styling 