# Parchments Private Signaling Server (Deno)

This is a standalone signaling server for the Parchments collaboration system, optimized for **Deno Deploy**.

## Local Development
1. Install [Deno](https://deno.land/)
2. `deno run --allow-net main.ts`

The server will run on port 8000 by default.

## Deployment Instructions (Deno Deploy)

### 1. Push to GitHub
Ensure `main.ts` is in your repository.

### 2. Deploy to Deno Deploy (100% Free, No Credit Card)
1. Log in to [Deno Deploy](https://dash.deno.com/) with your GitHub account.
2. Click **"New Project"**.
3. Select your `parchments-signaling` repository.
4. Select the **"GitHub Actions"** or **"Automatic"** deployment mode.
5. Set `main.ts` as the entry point.
6. Once deployed, you will get a URL like `parchments-signaling.deno.dev`.

### 3. Update Parchments App
Copy your Deno public domain (e.g., `parchments-signaling.deno.dev`) and add it to your `YjsService.ts` in the main Parchments app:

```typescript
const signalingServers = [
    'wss://parchments-signaling.deno.dev', 
    'wss://signaling.yjs.dev'
];
```
