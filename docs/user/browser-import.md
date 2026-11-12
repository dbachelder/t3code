# Import browser sessions

Import cookies from another browser into the desktop app's [preview browser](./browser.md) so you can reuse existing signed-in sessions.

## Import a profile

1. On macOS and Linux, Chrome-based browsers and Safari can stay open; close Firefox and Zen first, and every browser on Windows.
2. Open **Settings → Browser → Browser profiles → Add profile** and choose a browser under **Import from**.
3. Allow any OS keyring unlock prompt.

A sign-in from the last minute may not be saved to disk by the source browser yet.

This is a one-time copy—later login changes stay separate, and some sites may still require signing in again.

## Import into a tab's profile

Open the browser tab's **⋯** menu, choose **Import cookies from**, then a browser profile. The page reloads with the imported sessions.

## Platform notes

- **macOS (Safari)**: Requires temporary **Full Disk Access** (grant in System Settings, quit/reopen T3 Code if macOS requires it, then reopen the import wizard). You can revoke Full Disk Access afterward.
- **Windows**: Supports Firefox, Zen, and Helium profiles using standard encryption. Other Chromium browsers use app-bound encryption and cannot be imported.
- Partitioned cookies are skipped on all platforms. Administrators can disable cookie import via [managed policy](./managed-policy.md#other-capabilities).
