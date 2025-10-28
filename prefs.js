import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TwoWallpapersPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({ title: 'Configurações de Wallpapers' });
        page.add(group);

        // Filtro para imagens
        const imageFilter = new Gtk.FileFilter();
        imageFilter.add_pixbuf_formats();

        // Função auxiliar para criar botão de seleção
        const createChooserButton = (key, title) => {
            const row = new Adw.ActionRow({ title });
            const button = new Gtk.Button({ label: 'Selecionar Imagem', hexpand: true });
            const currentUri = settings.get_string(key);
            if (currentUri) {
                const file = Gio.File.new_for_uri(currentUri);
                button.set_label(file.get_basename() || 'Selecionar Imagem');
            }

            button.connect('clicked', () => {
                const dialog = new Gtk.FileChooserNative({
                    title: 'Selecione uma Imagem',
                    action: Gtk.FileChooserAction.OPEN,
                    transient_for: window,
                    modal: true,
                });
                dialog.add_filter(imageFilter);

                dialog.connect('response', (dlg, response) => {
                    if (response === Gtk.ResponseType.ACCEPT) {
                        const uri = dlg.get_file().get_uri();
                        settings.set_string(key, uri || '');
                        button.set_label(dlg.get_file().get_basename() || 'Selecionar Imagem');
                    }
                    dlg.destroy();
                });

                dialog.show();
            });

            row.add_suffix(button);
            group.add(row);
        };

        // Wallpaper sem janelas
        createChooserButton('wallpaper-no-windows', 'Wallpaper quando não há janelas visíveis');

        // Wallpaper com janelas
        createChooserButton('wallpaper-with-windows', 'Wallpaper quando há janelas visíveis');

        window.add(page);
    }
}
