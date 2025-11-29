# CLAUDE.md - AI Assistant Guide for Twitter Web Exporter

## Project Overview

**Twitter Web Exporter** is a browser UserScript that enables users to export tweets, bookmarks, lists, and other data from Twitter/X web app without requiring API access. The script intercepts GraphQL responses from Twitter's web app and stores the data locally in the browser using IndexedDB.

- **Type**: Browser UserScript (Tampermonkey/Violentmonkey)
- **Tech Stack**: TypeScript, Preact, Vite
- **Build System**: Vite with vite-plugin-monkey
- **Package Manager**: Bun (migrated from pnpm)
- **License**: MIT
- **Current Version**: 1.3.1-beta.3
- **Lines of Code**: ~3000 lines

### Key Features

- Export tweets, replies, likes, bookmarks, lists, and more as JSON/CSV/HTML
- Bulk download images and videos at original size
- Network interception without API keys or developer account
- Local-only processing (privacy-focused)
- IndexedDB-based storage with Dexie ORM
- Multi-language support (i18n)

## Architecture & Structure

### Directory Structure

```
twitter-web-exporter/
├── src/
│   ├── main.tsx              # Entry point - registers extensions
│   ├── core/                 # Core functionality
│   │   ├── app.tsx          # Main UI component
│   │   ├── settings.tsx     # Settings panel
│   │   ├── database/        # IndexedDB management (Dexie)
│   │   ├── extensions/      # Extension system
│   │   └── options/         # User preferences
│   ├── modules/             # Feature modules (extensions)
│   │   ├── bookmarks/       # Each module has index.tsx + api.ts
│   │   ├── followers/
│   │   ├── following/
│   │   ├── home-timeline/
│   │   ├── direct-messages/
│   │   └── ... (17 modules total)
│   ├── components/          # Preact components
│   │   ├── module-ui.tsx   # Common module UI
│   │   ├── modals/         # Export dialogs
│   │   └── table/          # Data table views
│   ├── utils/              # Utility functions
│   │   ├── api.ts         # Twitter API type extraction
│   │   ├── exporter.ts    # JSON/CSV/HTML exporters
│   │   ├── media.ts       # Media download utilities
│   │   ├── download.ts    # File download helpers
│   │   └── zip-stream.ts  # Streaming zip creation
│   ├── types/             # TypeScript type definitions
│   │   ├── tweet.ts       # Tweet types from Twitter API
│   │   ├── user.ts        # User types
│   │   ├── list.ts        # List types
│   │   └── index.ts       # Common types & interfaces
│   └── i18n/              # Internationalization
│       └── locales/       # Translation files
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # TailwindCSS + DaisyUI
└── package.json
```

### Extension System

The project uses a **plugin-like extension architecture**. Each feature is implemented as an `Extension` subclass:

```typescript
// Base class: src/core/extensions/extension.ts
export abstract class Extension {
  public name: string = '';
  public enabled = true;
  public type: ExtensionType = ExtensionType.NONE;

  public setup(): void { }           // Initialize side effects
  public dispose(): void { }         // Cleanup
  public intercept(): Interceptor    // HTTP response interceptor
  public render(): ComponentType     // UI component
}
```

**Extension Types**:
- `TWEET` - Captures tweet data
- `USER` - Captures user data
- `CUSTOM` - Custom data type
- `NONE` - No data capture

### Module Pattern

Each module follows a consistent structure:

```
modules/bookmarks/
├── index.tsx    # Extension class definition
└── api.ts       # Interceptor function
```

**Example**: `src/modules/bookmarks/index.tsx`
```typescript
export default class BookmarksModule extends Extension {
  name = 'BookmarksModule';
  type = ExtensionType.TWEET;

  intercept() { return BookmarksInterceptor; }
  render() { return CommonModuleUI; }
}
```

The interceptor function in `api.ts` receives network responses and extracts data using pattern matching on URL/response structure.

## Tech Stack

### Core Technologies

- **Preact** - Lightweight React alternative (~3KB)
- **@preact/signals** - Fine-grained reactivity
- **TypeScript** - Strict type checking enabled
- **Vite** - Build tool and dev server
- **Dexie** - IndexedDB wrapper (ORM-like)
- **TailwindCSS** - Utility-first CSS
- **DaisyUI** - Component library for Tailwind

### Build Tools

- **vite-plugin-monkey** - UserScript builder
- **vite-plugin-i18next-loader** - i18n integration
- **postcss-prefix-selector** - CSS scoping (`#twe-root`)
- **postcss-rem-to-pixel-next** - Convert rem to px

### External Dependencies (CDN)

The built UserScript loads dependencies from CDN to reduce bundle size:
- dayjs, dexie, file-saver-es, i18next, preact, @preact/signals, @tanstack/table-core

### Development Tools

- **ESLint** - Linting (with TypeScript & Prettier)
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Conventional commits
- **git-cliff** - Changelog generation

## Development Workflow

### Initial Setup

```bash
# Install dependencies
bun install

# Development mode (watch & rebuild)
bun run dev

# Production build
bun run build

# Lint code
bun run lint
```

### Build Output

Build creates: `dist/twitter-web-exporter.user.js` - the installable UserScript

### Git Workflow

**Branch Naming**: Use conventional commit-style branch names
- `feat/feature-name`
- `fix/bug-description`
- `chore/task-description`

**Commit Messages**: Follow Conventional Commits (enforced by commitlint)
```
feat: add support for exporting polls
fix: adapt to Twitter API changes for users
chore: upgrade dependencies
docs: update README
refactor: extract table view as common component
```

**Commit Types**:
- `feat` - New feature
- `fix` - Bug fix
- `chore` - Maintenance
- `docs` - Documentation
- `refactor` - Code restructuring
- `test` - Tests
- `build` - Build system

### Release Process

1. Update version in `package.json`
2. Generate changelog: `bun run changelog`
3. Commit and tag release
4. Build production: `bun run build`
5. Upload `dist/twitter-web-exporter.user.js` to GitHub releases

## Code Conventions

### TypeScript

- **Strict mode enabled**: All strict checks on
- **No unchecked indexed access**: `noUncheckedIndexedAccess: true`
- **Path alias**: `@/*` maps to `./src/*`
- **JSX**: `jsxImportSource: "preact"`
- **Target**: ES2022

### Code Style

- **No semicolons** (handled by Prettier)
- **Single quotes** for strings
- **2-space indentation**
- **Trailing commas** in multiline
- **Arrow functions** preferred over function expressions

### File Naming

- **Components**: PascalCase for classes, camelCase for files
  - `src/components/module-ui.tsx` exports `CommonModuleUI`
- **Utilities**: camelCase
  - `src/utils/exporter.ts`
- **Types**: camelCase files, PascalCase interfaces
  - `src/types/tweet.ts` exports `Tweet`, `TimelineTweet`

### Import Order

1. External dependencies (preact, dexie, etc.)
2. Internal absolute imports (`@/components`, `@/utils`)
3. Internal relative imports (`./api`, `../common`)
4. Styles (CSS imports)

### Component Pattern

Use functional components with hooks:

```typescript
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

export function MyComponent() {
  const state = useSignal(0);

  useEffect(() => {
    // Side effects
  }, []);

  return <div>{state.value}</div>;
}
```

### Database Access

Use the global `db` singleton from `@/core/database`:

```typescript
import { db } from '@/core/database';

// Extension methods for data access
const captures = await db.extGetCaptures(extensionName);
const tweets = await db.extGetCapturedTweets(extensionName);
const users = await db.extGetCapturedUsers(extensionName);
```

**Never access `db.table()` directly** - use the provided `ext*` methods.

## Key Patterns & Architecture Details

### HTTP Interception

The extension system intercepts `XMLHttpRequest` responses to capture Twitter API data:

1. Extension registers an interceptor function
2. Interceptor receives `{method, url}` request and `XMLHttpRequest` response
3. Interceptor parses JSON response and extracts data
4. Data is stored in IndexedDB via `DatabaseManager`

**Pattern**: Check URL patterns, parse response, use `extractTweetFromEntry()` or similar utility.

### Type Extraction

Twitter's GraphQL API returns complex nested structures. Utility functions in `src/utils/api.ts` handle extraction:

- `extractTimelineInstructions()` - Parse timeline response
- `extractTweetFromEntry()` - Extract tweet from timeline entry
- `extractUserFromEntry()` - Extract user from timeline entry
- `extractTweetMedia()` - Extract media URLs

### Data Storage

**Database Schema** (Dexie):

```typescript
// Version 2
tweets: 'rest_id, created_at, *user_id_str'
users: 'rest_id, *screen_name'
captures: '++id, extension, type, data_key, created_at'
```

**Capture Flow**:
1. Extension intercepts API response
2. Extracts tweet/user data
3. Calls `db.extPutTweet()` or `db.extPutUser()`
4. Database creates a `Capture` record linking extension to data

### Export System

Three export formats supported:

1. **JSON** - Full data with optional metadata
2. **CSV** - Flattened tabular format
3. **HTML** - Human-readable table

Exporters in `src/utils/exporter.ts` handle field mapping and formatting.

### Media Download

Media download uses:
- `src/utils/media.ts` - URL extraction and filename patterns
- `src/utils/zip-stream.ts` - Streaming zip creation
- `src/utils/download.ts` - Fetch with rate limiting

**Memory Limitation**: Downloads to memory then creates zip
- Chrome: ~2GB limit
- Firefox: ~800MB limit

### UI Components

**Common Module UI** (`src/components/module-ui.tsx`):
- Shows capture count badge
- Opens data table modal on click
- Used by most extensions

**Table View** (`src/components/table/table-view.tsx`):
- TanStack Table for data display
- Pagination support
- Row selection for export
- Separate column definitions for tweets (`columns-tweet.tsx`) and users (`columns-user.tsx`)

### Settings & Options

User preferences stored in `localStorage` via `src/core/options/`:
- Theme selection
- Show/hide control panel
- Dedicated DB per account
- Export filename patterns
- Rate limiting

Options use a signal-based reactive system for UI updates.

### Internationalization

i18next-based with language detection:
- Translation files in `src/i18n/locales/`
- Custom language detector in `src/i18n/detector.ts`
- Detects from Twitter's UI language

## Testing & Building

### Type Checking

```bash
# Type check without emitting files
tsc --noEmit
```

### Linting

```bash
# Run ESLint
bun run lint

# ESLint config: eslint.config.js
# Uses: @eslint/js + typescript-eslint + prettier
```

### Building

```bash
# Development build (watch mode)
bun run dev

# Production build
bun run build
```

Build output: `dist/twitter-web-exporter.user.js`

**Build Configuration** (`vite.config.ts`):
- Minification disabled (`minify: false`) for UserScript readability
- CSS scoped to `#twe-root` to avoid conflicts
- External globals mapped to CDN imports

### Preview

```bash
# Preview production build
bun run preview
```

## Common Tasks for AI Assistants

### Adding a New Module/Extension

1. Create directory: `src/modules/my-feature/`
2. Create `index.tsx`:
   ```typescript
   import { Extension, ExtensionType } from '@/core/extensions';
   import { MyFeatureInterceptor } from './api';

   export default class MyFeatureModule extends Extension {
     name = 'MyFeatureModule';
     type = ExtensionType.TWEET; // or USER

     intercept() { return MyFeatureInterceptor; }
     render() { return CommonModuleUI; }
   }
   ```
3. Create `api.ts` with interceptor function
4. Register in `src/main.tsx`:
   ```typescript
   import MyFeatureModule from './modules/my-feature';
   extensions.add(MyFeatureModule);
   ```

### Adapting to Twitter API Changes

Twitter frequently changes their GraphQL API. When a module breaks:

1. Open browser DevTools → Network tab
2. Filter by `api.twitter.com` or `x.com/i/api/graphql`
3. Find the relevant GraphQL query (check `operationName` in URL)
4. Compare response structure with type definitions in `src/types/`
5. Update interceptor URL pattern in module's `api.ts`
6. Update type extraction logic if response structure changed

**Common Changes**:
- GraphQL query IDs change (encoded in URL)
- Response structure modifications
- Field name changes
- New required fields

### Adding Export Fields

To add fields to CSV/JSON/HTML exports:

1. Update type definitions in `src/types/tweet.ts` or `src/types/user.ts`
2. Update column definitions:
   - Tweets: `src/components/table/columns-tweet.tsx`
   - Users: `src/components/table/columns-user.tsx`
3. Update exporter field mappings in `src/utils/exporter.ts`

### Debugging

**Logger**: Use `src/utils/logger.ts`
```typescript
import logger from '@/utils/logger';

logger.debug('Debug message');
logger.log('Info message');
logger.warn('Warning');
logger.error('Error', error);
```

**Database Inspection**: Use browser DevTools → Application → IndexedDB

**Extension State**: Check `extensionManager.getExtensions()` in console

### Performance Considerations

1. **Network Interception**: Minimal overhead, happens asynchronously
2. **Database Writes**: Batched when possible, use `bulkPut()`
3. **UI Updates**: Use signals for fine-grained reactivity
4. **Large Datasets**: Pagination in table views prevents rendering slowdown
5. **Media Downloads**: Rate limiting prevents browser throttling

## Important Notes for AI Assistants

### What to Avoid

- **Don't break UserScript compatibility**: Always maintain UserScript header format
- **Don't add large dependencies**: Bundle size matters for UserScripts
- **Don't make breaking changes to database schema**: Migration required
- **Don't remove CSS scoping**: `#twe-root` prefix prevents conflicts with Twitter's styles
- **Don't use Node.js APIs**: UserScript runs in browser context only

### Best Practices

1. **Always test with actual Twitter pages** after changes
2. **Check CSP compatibility** (Content Security Policy issues common with UserScripts)
3. **Maintain backwards compatibility** when modifying exports
4. **Document API changes** in commit messages
5. **Use provided utility functions** instead of reinventing (especially for API extraction)
6. **Follow the established module pattern** for consistency
7. **Keep interceptor functions focused** - one interceptor per API endpoint

### Security Considerations

- **No external API calls**: All data stays local
- **Respect user privacy**: No telemetry or tracking
- **Validate user input**: Especially in export filename patterns
- **Sanitize HTML exports**: Prevent XSS in exported HTML files

### Compatibility

- **Browsers**: Chrome, Firefox, Edge (with Tampermonkey/Violentmonkey)
- **Twitter Domains**: `twitter.com`, `x.com`, `mobile.x.com`
- **Twitter API**: Web GraphQL API (not official REST/v2 API)

## Resources

- **Repository**: https://github.com/prinsss/twitter-web-exporter
- **Issues**: https://github.com/prinsss/twitter-web-exporter/issues
- **Releases**: https://github.com/prinsss/twitter-web-exporter/releases
- **Changelog**: See `CHANGELOG.md` for version history

## Version History

Current: **v1.3.1-beta.3**

Recent major versions:
- **v1.3.0** (2025-06-11): Export enhancements, aria2 format support
- **v1.2.1** (2025-04-03): Direct messages, user detail module
- **v1.2.0** (2024-10-22): Local database implementation
- **v1.1.0** (2024-04-13): List timeline, module system improvements

---

**Last Updated**: 2025-11-29
**Generated for**: Claude Code AI Assistant
**Codebase Size**: ~3000 lines of TypeScript/TSX
