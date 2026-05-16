# 🌌 Synthia - Living Civilization Platform

Autopoietic OS with MRNN engine, astrological coordinate mapping, and Mobile MCP integration.

## What This Is

Synthia is a self-scaffolding, self-morphing operating system where everything ingested gets an ontological address. It uses a 5-layer Multi-Layer Recursive Neural Network (MRNN) with astrological coordinate mapping to process, learn from, and grow with every piece of content you feed it.

## Architecture

- **MRNN Core**: 5-layer recursive neural network with message-passing
- **Autopoietic OS**: Self-scaffolding system with ontological addressing
- **Ingestion System**: Discerning ingestion that learns and grows
- **User Discernment**: Learns each person's Human Design patterns
- **Life Purpose Alignment**: Self-teaches how to grow WITH each person
- **Mobile MCP**: Controls real devices for testing and deployment
- **Morph Visualizer**: Teal/purple interactive graph visualization

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Connect Mobile MCP
npm run mcp

# Build for production
npm run build
```

## Mobile MCP Integration

Synthia integrates with [@mobilenext/mobile-mcp](https://github.com/mobile-next/mobile-mcp) to:
- Install your app on real devices
- Take screenshots to verify rendering
- Auto-test and iterate if broken
- Deploy to app stores

```bash
# Start the MCP server
npx -y @mobilenext/mobile-mcp@latest

# In the Synthia UI, go to MCP tab and click "Connect"
```

## Deploy

Push to GitHub. The workflow auto-deploys to:
- **Netlify** (frontend)
- **Render** (API server)
- **Supabase** (database + auth)

## Environment Variables

```
VITE_SYNTHIA_SERVER=https://synthia-server.onrender.com
VITE_HF_USERNAME=stellarproximology
```

## License

AGPL-3.0
