// Fonts.js
window.slackPluginsAPI = window.slackPluginsAPI || {};
window.slackPluginsAPI.plugins = window.slackPluginsAPI.plugins || {};

class DimPlugin extends window.slackPluginsAPI.pluginBase {
  constructor() {
    super();
    // Mandatory
    this.name = 'hideAway';
    this.desc = 'Dim Absent People';
    this.longDescription = 'Dim Absent People and Channels from the sidebar';
    this.enabled = true;
    this.shortcut = '';
    this.icon = 'channels';

    this.tweakEnabled = false;
  }

  onToolbarClick() {
    this.toggleHide();
  }

  /**
   * Toggle the setting
   */
  toggleHide() {
    this.tweakEnabled = !this.tweakEnabled;
    this.applyDim();
  }

  /**
   * Apply Dim
   */
  applyDim() {
    if (this.tweakEnabled) {
      document.querySelectorAll('.p-channel_sidebar__name--away').forEach(el => {
        el.closest('.p-channel_sidebar__static_list__item').classList.add('-dim');
      });
    }
    else {
      document.querySelectorAll('.p-channel_sidebar__name--away').forEach(el => {
        el.closest('.p-channel_sidebar__static_list__item').classList.remove('-dim');
      });
    }
    window.slackPluginsAPI.saveSettings();
  }

  /**
   * Apply
   */
  apply() {
    this.applyDim();
  }

  /**
   * Save Settings
   */
  saveSettings() {
    return {
      enabled: this.enabled,
      tweakEnabled: this.tweakEnabled
    };
  }
}

window.slackPluginsAPI.plugins.hideAway = new DimPlugin();
