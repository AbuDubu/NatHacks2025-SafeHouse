# SafeHouse Web Dashboard

Next.js web application for monitoring and managing heat safety alerts.

## Overview

The SafeHouse web dashboard provides caregivers and administrators with:
- Real-time monitoring of temperature and environmental conditions
- Alert timeline and history
- Device status monitoring
- Alert acknowledgment and management
- Health vital monitoring

## Prerequisites

- Node.js 18+ and npm
- Backend API running

## Installation

```bash
npm install
```

## Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development
```

## Running the App

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

The dashboard will be available at http://localhost:3000

## Project Structure

```
web/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Home page
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   ├── dashboard/           # Dashboard pages
│   │   └── page.tsx         # Main dashboard
│   └── alerts/              # Alert pages
│       ├── page.tsx         # Alert list
│       └── [id]/
│           └── page.tsx     # Alert detail
│
├── components/              # React components
│   ├── dashboard/
│   │   ├── StatusCard.tsx
│   │   ├── DeviceStatus.tsx
│   │   └── VitalSnapshot.tsx
│   └── alerts/
│       ├── AlertList.tsx
│       └── AlertTimeline.tsx
│
├── hooks/                   # Custom React hooks
│   ├── useDashboard.ts
│   └── useAlerts.ts
│
├── lib/                     # Utilities
│   └── api/
│       └── client.ts        # API client
│
├── public/                  # Static assets
├── next.config.ts           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS config
└── package.json
```

## Pages

### Home (`/`)
Landing page with:
- Feature overview
- Navigation to dashboard and alerts
- Welcome content

### Dashboard (`/dashboard`)
Main monitoring interface:
- Real-time status card (temperature, humidity, heat index)
- Risk level indicator
- Device connection status
- Recent health vitals
- Active alerts banner
- Recent alert history

### Alerts (`/alerts`)
Alert management:
- Active alerts section
- Resolved alerts history
- Quick acknowledgment
- Status filtering

### Alert Detail (`/alerts/[id]`)
Detailed alert view:
- Complete timeline of escalation steps
- Action results and timestamps
- Resolution information
- Acknowledgment controls

## Components

### Dashboard Components

#### StatusCard
Displays current environmental conditions:
- Temperature (°C)
- Humidity (%)
- Heat Index (°C)
- Risk level badge (normal/warning/danger)
- Last update timestamp

#### DeviceStatus
Shows sensor device information:
- Connection status (online/offline/warning)
- Hardware ID
- Firmware version
- Last seen timestamp

#### VitalSnapshot
Displays health data:
- Heart rate (bpm)
- Heart rate variability (ms)
- Steps (5-minute window)
- Fall detection status
- Data freshness indicator

### Alert Components

#### AlertList
Displays list of alerts:
- Risk level badges
- Status badges
- Elder name
- Timestamps
- Action buttons (acknowledge, view details)

#### AlertTimeline
Shows detailed escalation timeline:
- Step-by-step progression
- Action types (call, SMS, vital check, etc.)
- Results (answered, no answer, etc.)
- Timestamps
- Metadata expansion

## Hooks

### useDashboard
Fetches and manages dashboard data:

```typescript
const { data, isLoading, error, refresh } = useDashboard(elderId);
```

Features:
- Auto-refresh every 15 seconds
- Manual refresh function
- Loading and error states

### useAlerts
Fetches and manages alerts:

```typescript
const { alerts, isLoading, error, refresh, acknowledgeAlert } = useAlerts(elderId);
```

Features:
- Auto-refresh every 5 seconds
- Acknowledgment function
- Loading and error states

## API Client

Located in `lib/api/client.ts`, provides typed API methods:

```typescript
import { apiClient } from '@/lib/api/client';

// Dashboard
await apiClient.getDashboardData(elderId);

// Alerts
await apiClient.getAlerts(elderId);
await apiClient.getAlertDetails(alertId);
await apiClient.acknowledgeAlert(alertId, reason);

// Contacts
await apiClient.getContacts(elderId);
await apiClient.createContact(elderId, contactData);
```

## Styling

The dashboard uses Tailwind CSS with a clean, professional design.

**Color Palette:**
- Primary: Red 600 (`#EF4444`)
- Background: Gray 50 (`#F9FAFB`)
- Card: White
- Text Primary: Gray 900 (`#111827`)
- Text Secondary: Gray 600 (`#6B7280`)

**Risk Level Colors:**
- Normal: Green 500 (`#10B981`)
- Warning: Amber 500 (`#F59E0B`)
- Danger: Red 500 (`#EF4444`)

**Components:**
- Cards: `rounded-lg shadow p-6`
- Buttons: `px-4 py-2 rounded-lg font-medium`
- Badges: `px-3 py-1 rounded-full text-sm`

## Real-time Updates

The dashboard implements automatic polling:
- Dashboard data: 15 seconds
- Alerts: 5 seconds
- Manual refresh available on all pages

Configure intervals in `/shared/constants/index.ts`.

## TypeScript

Fully typed with TypeScript. Uses shared types from `/shared/types`:

```typescript
import type {
  DashboardData,
  Alert,
  Telemetry,
  VitalSnapshot,
  SensorDevice
} from '../../../shared/types';
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

Vercel automatically detects Next.js and configures optimally.

### Other Platforms

```bash
# Build
npm run build

# Start production server
npm start
```

Output is in `.next/` directory. Requires Node.js runtime.

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NODE_ENV` | Environment (development/production) | No |

**Note:** Next.js variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Performance Optimization

The dashboard implements:
- Server components where possible
- Client components for interactivity
- Automatic code splitting
- Image optimization (Next.js built-in)
- Tailwind CSS purging

## SEO & Metadata

Configure in `app/layout.tsx`:

```typescript
export const metadata = {
  title: 'SafeHouse Dashboard',
  description: 'Heat safety monitoring for elderly care',
};
```

## Error Handling

All API calls include error handling:
- Try-catch blocks
- Error states in hooks
- User-friendly error messages
- Retry mechanisms

Example:
```typescript
if (error) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">Error: {error}</p>
      <button onClick={refresh}>Retry</button>
    </div>
  );
}
```

## Accessibility

The dashboard follows accessibility best practices:
- Semantic HTML elements
- Proper heading hierarchy
- Color contrast compliance
- Keyboard navigation support
- Screen reader friendly

## Browser Support

Supports modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Workflow

```bash
# Start dev server with turbopack
npm run dev

# Type check
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build
```

## Troubleshooting

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check backend is running
- Check CORS configuration on backend

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

### Type Errors
- Ensure `/shared/types` path is correct
- Run `npm install` to update dependencies
- Check TypeScript version compatibility

### Styling Issues
- Verify Tailwind config includes all content paths
- Clear `.next` cache
- Check for conflicting CSS

## Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

Add tests with:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

## Security

- API calls use HTTPS in production
- No sensitive data in client-side code
- Environment variables properly scoped
- CSRF protection via API design

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Multi-elder monitoring dashboard
- [ ] Contact management UI
- [ ] Threshold configuration interface
- [ ] Alert analytics and charts
- [ ] Export alert history (PDF/CSV)
- [ ] Real-time WebSocket updates
- [ ] Dark mode support
- [ ] Mobile responsive improvements

## Customization

### Changing Colors

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
      },
    },
  },
};
```

### Adding Pages

1. Create file in `app/` directory
2. Export default React component
3. Add navigation link

### Adding Components

1. Create component in `components/`
2. Export component
3. Import and use in pages

## Contributing

When adding features:
1. Use TypeScript for all new code
2. Follow existing component patterns
3. Use Tailwind CSS for styling
4. Update shared types if needed
5. Add error handling
6. Test on multiple screen sizes

## Support

For issues:
- Check environment variables
- Verify backend API is accessible
- Review browser console for errors
- Check Next.js documentation

## License

See main project LICENSE file.
