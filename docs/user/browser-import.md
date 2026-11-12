# Import browser sessions

The desktop app can import cookies from another browser so you can reuse its signed-in sessions
in the preview browser.

Open **Settings → Browser → Browser profiles → Add profile**, then choose a browser under
**Import from**. Allow an operating-system keyring unlock prompt if one appears. On macOS and Linux,
Chrome-based browsers and Safari can stay open; close Firefox and Zen first, and every browser on
Windows. A sign-in from the last minute may not be saved to disk by the source browser yet.

To import into the profile a browser tab already uses, open the tab's **⋯** menu and choose
**Import cookies from**, then a browser profile. The page reloads with the imported sessions.

This is a one-time copy. Later login changes stay separate between the two browsers, and some
sites may still require you to sign in again.

On macOS, Safari imports need Full Disk Access. Choose **Allow**, drag T3 Code into the
System Settings permission list, and turn access on. **Continue** becomes available when access
is detected. macOS may require you to quit and reopen T3 Code before the grant applies; reopen
the import wizard afterward. You can revoke Full Disk Access once the import is done.

On Windows, import supports Firefox, Zen, and Helium profiles that use standard profile encryption.
Other Chromium-based browsers use app-bound encryption and cannot be imported. Partitioned cookies
are skipped on all platforms.
