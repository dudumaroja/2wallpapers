import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Pango from 'gi://Pango';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TwoWallpapersPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({ title: '2Wallpapers Settings' });
        page.add(group);

        // Filtro para imagens
        const imageFilter = new Gtk.FileFilter();
        imageFilter.add_pixbuf_formats();

        // Função auxiliar para criar botão de seleção
        const createChooserButton = (key, title) => {
            const row = new Adw.ActionRow({ title });

            const button = new Gtk.Button({
                label: 'Select image',
                hexpand: false,
                halign: Gtk.Align.END,
            });

            // Define largura fixa
            button.set_size_request(200, -1);

            // Aplica truncamento ao label interno do botão
            const label = button.get_child();
            if (label && label instanceof Gtk.Label) {
                label.set_ellipsize(Pango.EllipsizeMode.END);
                label.set_max_width_chars(20); // limita caracteres visíveis
            }

            const currentUri = settings.get_string(key);
            if (currentUri) {
                const file = Gio.File.new_for_uri(currentUri);
                const basename = file.get_basename() || 'Select image';
                button.set_label(basename);
                button.set_tooltip_text(basename); // tooltip com nome completo
            }

            button.connect('clicked', () => {
                const dialog = new Gtk.FileChooserNative({
                    title: 'Select an image,
                    action: Gtk.FileChooserAction.OPEN,
                    transient_for: window,
                    modal: true,
                });
                dialog.add_filter(imageFilter);

                dialog.connect('response', (dlg, response) => {
                    if (response === Gtk.ResponseType.ACCEPT) {
                        const uri = dlg.get_file().get_uri();
                        settings.set_string(key, uri || '');
                        const basename = dlg.get_file().get_basename() || 'Select image';
                        button.set_label(basename);
                        button.set_tooltip_text(basename); // tooltip atualizado
                    }
                    dlg.destroy();
                });

                dialog.show();
            });

            row.add_suffix(button);
            group.add(row);
        };

        // Wallpaper sem janelas
        createChooserButton('wallpaper-no-windows', 'Clear Desktop Wallpaper');

        // Wallpaper com janelas
        createChooserButton('wallpaper-with-windows', 'With Windows Wallpaper');

        window.add(page);
    }
}
