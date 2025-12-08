import Meta from 'gi://Meta';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class TwoWallpapersExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._settings = null;
        this._wm = global.workspace_manager;
        this._currentWs = null;
        this._connIds = new Map();
        this._wsSwitchedId = null;
        this._windowAddedId = null;
        this._windowRemovedId = null;
    }

    _updateBackground() {
        if (!this._currentWs) return;

        const windows = this._currentWs.list_windows();
        const visibleCount = windows.filter(w => !w.minimized && !w.skip_taskbar).length;

        let uri = '';
        if (visibleCount === 0) {
            uri = this._settings.get_string('wallpaper-no-windows');
        } else {
            uri = this._settings.get_string('wallpaper-with-windows');
        }

        if (uri) {
            this._backgroundSettings.set_string('picture-uri', uri);
            this._backgroundSettings.set_string('picture-uri-dark', uri);
        }
    }

    _connectToCurrentWindows() {
        const windows = this._currentWs.list_windows();
        for (let w of windows) {
            const id = w.connect('notify::minimized', this._updateBackground.bind(this));
            this._connIds.set(w, id);
        }
    }

    _disconnectFromCurrentWindows() {
        for (let [w, id] of this._connIds) {
            if (w) w.disconnect(id);
        }
        this._connIds.clear();
    }

    _connectSignals() {
        this._windowAddedId = this._currentWs.connect('window-added', (ws, w) => {
            const id = w.connect('notify::minimized', this._updateBackground.bind(this));
            this._connIds.set(w, id);
            this._updateBackground();
        });

        this._windowRemovedId = this._currentWs.connect('window-removed', (ws, w) => {
            const id = this._connIds.get(w);
            if (id && w) w.disconnect(id);
            this._connIds.delete(w);
            this._updateBackground();
        });
    }

    enable() {
        this._backgroundSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.background' });
        this._settings = this.getSettings();
        this._currentWs = this._wm.get_active_workspace();
        this._connectSignals();
        this._connectToCurrentWindows();
        this._updateBackground();

        this._wsSwitchedId = this._wm.connect('workspace-switched', () => {
            this._disconnectFromCurrentWindows();
            this._currentWs.disconnect(this._windowAddedId);
            this._currentWs.disconnect(this._windowRemovedId);
            this._currentWs = this._wm.get_active_workspace();
            this._connectSignals();
            this._connectToCurrentWindows();
            this._updateBackground();
        });
    }

    disable() {
        if (this._wsSwitchedId) this._wm.disconnect(this._wsSwitchedId);
        if (this._windowAddedId) this._currentWs.disconnect(this._windowAddedId);
        if (this._windowRemovedId) this._currentWs.disconnect(this._windowRemovedId);
        this._disconnectFromCurrentWindows();
        this._connIds.clear();
        this._currentWs.cear();
        this._settings.cear();
        this._backgroundSettings.cear();
    }
}

