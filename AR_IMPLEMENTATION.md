# AR Implementation Guide

## Overview

The AR (Augmented Reality) implementation in BitQuest provides a live camera feed with 3D treasure chests positioned in the real world. This implementation uses a combination of:

- **Live Camera Feed**: Real-time camera stream as the background
- **Three.js**: 3D rendering for the treasure chests
- **Geolocation**: GPS-based positioning and distance calculation
- **Device Orientation**: Basic AR-like positioning

## How It Works

### 1. Camera Access

- Requests camera permission from the user
- Uses the rear-facing camera (`facingMode: 'environment'`)
- Displays the live feed as the background

### 2. Geolocation

- Gets the user's current GPS location
- Calculates distance to the selected treasure chest
- Only shows the chest when within 50 meters

### 3. 3D Chest Rendering

- Creates a 3D chest model using Three.js
- Applies different materials based on chest type:
  - **Common**: Brown wood texture
  - **Rare**: Gold metallic texture
  - **Epic**: Cyan glowing texture
- Animates the chest with floating and rotation effects

### 4. Interaction

- Click/tap on the chest to collect it
- Raycasting detects when the user taps on the 3D object
- Triggers the collection callback

## Components

### ARView.tsx

Main AR component that handles:

- Camera permission requests
- Geolocation tracking
- Distance calculations
- UI overlays and instructions

### ARScene.tsx

3D scene component that handles:

- Three.js scene setup
- Camera stream integration
- 3D chest rendering
- Touch/click interactions

## Usage

### From Map

1. Select a chest from the map
2. Click "View in AR" button
3. Walk to within 50 meters of the chest location
4. Point your camera at the location
5. Tap the chest to collect

### Demo Mode

- Shows a sample AR experience without requiring a specific location
- Useful for demonstrating the feature

## Technical Details

### Camera Setup

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: "environment",
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
});
```

### Distance Calculation

Uses the Haversine formula to calculate distance between GPS coordinates:

```javascript
const R = 6371e3; // Earth's radius in meters
const φ1 = (lat1 * Math.PI) / 180;
const φ2 = (lat2 * Math.PI) / 180;
const Δφ = ((lat2 - lat1) * Math.PI) / 180;
const Δλ = ((lon2 - lon1) * Math.PI) / 180;

const a =
  Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
  Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

return R * c;
```

### 3D Positioning

The chest is positioned at a fixed distance in front of the camera:

```javascript
chestGroup.position.set(0, 0, -5); // 5 units in front
```

## Future Improvements

1. **True AR Tracking**: Integrate with AR.js or WebXR for proper device orientation tracking
2. **Marker-based AR**: Use image markers for more precise positioning
3. **SLAM**: Implement Simultaneous Localization and Mapping for better positioning
4. **Multi-user**: Allow multiple users to see the same chests
5. **Environmental Understanding**: Detect surfaces and place chests on them

## Browser Compatibility

- **Chrome**: Full support
- **Safari**: Full support (iOS 13+)
- **Firefox**: Full support
- **Edge**: Full support

Requires:

- HTTPS (for camera access)
- Camera permission
- Location permission
- WebGL support
