import Meta from 'gi://Meta';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * Adding comments for easing revision as still learning, and may help someone later if
 * i abandon this project
 *
 */
export default class TwoWallpapersExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        // Extension settings containing wallpaper URIs
        this._settings = null;
        // GNOME workspace manager reference
        this._wm = global.workspace_manager;
        // Currently active workspace
        this._currentWs = null;
        // Map to store window signal connection IDs for cleanup
        this._connIds = new Map();
        // Signal ID for workspace switching events
        this._wsSwitchedId = null;
        // Signal ID for window-added events
        this._windowAddedId = null;
        // Signal ID for window-removed events
        this._windowRemovedId = null;
    }

    /**
     * Updates the desktop background based on visible window count.
     * Uses 'wallpaper-no-windows' when workspace is empty,
     * otherwise uses 'wallpaper-with-windows'.
     */
    _updateBackground() {
        if (!this._currentWs) return;

        // Get all windows in the current workspace
        const windows = this._currentWs.list_windows();
        // Count only visible windows (not minimized, not hidden from taskbar)
        const visibleCount = windows.filter(w => !w.minimized && !w.skip_taskbar).length;

        // Select appropriate wallpaper based on visible window count
        let uri = '';
        if (visibleCount === 0) {
            uri = this._settings.get_string('wallpaper-no-windows');
        } else {
            uri = this._settings.get_string('wallpaper-with-windows');
        }

        // Apply wallpaper to both light and dark modes
        if (uri) {
            this._backgroundSettings.set_string('picture-uri', uri);
            this._backgroundSettings.set_string('picture-uri-dark', uri);
        }
    }

    /**
     * Connects to minimize/restore signals for all existing windows
     * in the current workspace. This ensures background updates when
     * windows are minimized or restored.
     */
    _connectToCurrentWindows() {
        const windows = this._currentWs.list_windows();
        for (let w of windows) {
            // Listen for window minimize/restore events
            const id = w.connect('notify::minimized', this._updateBackground.bind(this));
            // Store connection ID for later cleanup
            this._connIds.set(w, id);
        }
    }

    /**
     * Disconnects all window signals and clears the connection map.
     * Called when switching workspaces or disabling the extension.
     */
    _disconnectFromCurrentWindows() {
        for (let [w, id] of this._connIds) {
            if (w) w.disconnect(id);
        }
        this._connIds.clear();
    }

    /**
     * Sets up signal listeners for window-added and window-removed events
     * in the current workspace. This tracks when windows are opened or closed.
     */
    _connectSignals() {
        // Handle new windows being opened
        this._windowAddedId = this._currentWs.connect('window-added', (ws, w) => {
            // Connect to the new window's minimize signal
            const id = w.connect('notify::minimized', this._updateBackground.bind(this));
            this._connIds.set(w, id);
            // Update background immediately (new window is now visible)
            this._updateBackground();
        });

        // Handle windows being closed
        this._windowRemovedId = this._currentWs.connect('window-removed', (ws, w) => {
            // Disconnect the window's minimize signal
            const id = this._connIds.get(w);
            if (id && w) w.disconnect(id);
            this._connIds.delete(w);
            // Update background immediately (one less visible window)
            this._updateBackground();
        });
    }

    /**
     * Called when the extension is enabled.
     * Initializes settings, connects all signals, and sets initial wallpaper.
     */
    enable() {
        // Access GNOME's background settings
        this._backgroundSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
        // Load extension's custom settings
        this._settings = this.getSettings();
        // Get the currently active workspace
        this._currentWs = this._wm.get_active_workspace();
        // Set up window monitoring for current workspace
        this._connectSignals();
        // Connect to existing windows in the workspace
        this._connectToCurrentWindows();
        // Apply initial wallpaper
        this._updateBackground();

        // Handle workspace switching
        this._wsSwitchedId = this._wm.connect('workspace-switched', () => {
            // Clean up connections from previous workspace
            this._disconnectFromCurrentWindows();
            this._currentWs.disconnect(this._windowAddedId);
            this._currentWs.disconnect(this._windowRemovedId);
            // Switch to new workspace and reconnect everything
            this._currentWs = this._wm.get_active_workspace();
            this._connectSignals();
            this._connectToCurrentWindows();
            // Update wallpaper for new workspace
            this._updateBackground();
        });
    }

    /**
     * Called when the extension is disabled.
     * Disconnects all signals and cleans up references to prevent memory leaks.
     */
    disable() {
        // Disconnect workspace switching listener
        if (this._wsSwitchedId) this._wm.disconnect(this._wsSwitchedId);
        // Disconnect window monitoring signals
        if (this._windowAddedId) this._currentWs.disconnect(this._windowAddedId);
        if (this._windowRemovedId) this._currentWs.disconnect(this._windowRemovedId);
        // Disconnect all window minimize/restore signals
        this._disconnectFromCurrentWindows();
        // Clear the connection map (keeps Map instance to avoid race conditions)
        this._connIds.clear();
        // Remember, this is a map, nulling it may prevent been used later.
        // Causing "TypeError: can't access property "set", this._connIds is null" error
        this._currentWs = null;
        this._settings = null;
        this._backgroundSettings = null;
    }
}
