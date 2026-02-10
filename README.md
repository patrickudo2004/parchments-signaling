# Parchments Private Signaling Server

This is a standalone signaling server for the Parchments collaboration system. It uses `y-webrtc` to facilitate peer discovery for real-time note syncing.

## Local Development
1. `npm install`
2. `npm start`

The server will run on port 4444 by default.

## Deployment Instructions

### 1. Create GitHub Repository
Create a new GitHub repository (e.g., `parchments-signaling`) and push the contents of this folder to it.

### 2. Deploy to Railway.app
1. Log in to [Railway](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your `parchments-signaling` repository.
4. Railway will automatically detect the `package.json` and start the server.

### 3. Update Parchments App
Copy your Railway public domain (e.g., `parchments-signaling.up.railway.app`) and add it to your `YjsService.ts` in the main Parchments app:

```typescript
const signalingServers = [
    'wss://your-subdomain.up.railway.app', 
    'wss://signaling.yjs.dev'
];
```
