const slackPluginsAPI = {
  LOCAL_STORAGE: 'slack_plugins',
  pluginsEnabled: true,
  // Loaded plugins
  plugins: {
    main: {
      name: 'main',
      desc: 'Enable custom plugins',
      enabled: true,
      callback() {
        window.slackPluginsAPI.togglePlugins();
      }
    }
  },

  togglePlugins() {
    this.pluginsEnabled = !this.pluginsEnabled;
    Object.entries(this.plugins).forEach(([pluginName, plugin]) => {
      // Activate/Disable the plugin
      plugin.switch && plugin.switch(this.pluginsEnabled);

      // Disable options
      if (plugin.$settingEl) {
        if (this.pluginsEnabled) {
          plugin.$settingEl.classList.remove('c-plugins--disabled');
        }
        else {
          plugin.$settingEl.classList.add('c-plugins--disabled');
        }
      }
    });
  },

  /**
   * Create the plugin section in the sidebar
   */
  _insertPluginSection() {
    // Plugins menu in the sidebar
    const $pluginsSection = document.createElement('div');
    $pluginsSection.id = 'pluginsSection';
    $pluginsSection.style.fontStyle = 'italic';
    $pluginsSection.addEventListener('click', () => {
      this._showPluginsUI();
    });

    // Menu item
    const $pluginsLinkBtn = document.createElement('button');
    $pluginsLinkBtn.className = 'c-button-unstyled p-channel_sidebar__link p-channel_sidebar__section_heading_label position_relative';
    $pluginsLinkBtn.innerHTML = `
<i class="c-icon p-channel_sidebar__link__icon c-icon--star c-icon--inherit" type="list" aria-hidden="true"></i>
<span class="p-channel_sidebar__name">Slack Tweaks</span>`;

    // Add on the top
    $pluginsSection.appendChild($pluginsLinkBtn);
    this.$sideBar.prepend($pluginsSection);
  },

  /**
   * Display the plugins settings modal
   */
  _showPluginsUI() {
    if (!this.pluginsUI) {
      this.pluginsUI = this._createPluginsUI();
    }
    document.body.append(this.pluginsUI);
  },

  /**
   * Generate the plugin settings UI.
   * TODO EXTRACT MAGIC STRINGS
   */
  _createPluginsUI() {
    // Modal
    const $reactModal = document.createElement('div');
    $reactModal.className = 'ReactModalPortal';

    // Overlay
    const $reactOverlay = document.createElement('div');
    $reactOverlay.className = 'ReactModal__Overlay ReactModal__Overlay--after-open c-sk-overlay';
    $reactModal.appendChild($reactOverlay);

    // Contents
    const $wrapper = document.createElement('div');
    $wrapper.className = 'ReactModal__Content c-sk-modal c-sk-modal--fixed';
    $reactOverlay.appendChild($wrapper);

    // Close btn
    const $closeBtn = document.createElement('button');
    $closeBtn.className = 'c-button-unstyled c-icon_button c-icon_button--light c-sk-modal__close_button';
    $closeBtn.innerHTML = `<i class="c-icon c-icon--times" type="times" aria-hidden="true"></i>`;
    // Close the modal
    $closeBtn.addEventListener('keydown', ({keyCode}) => {
      if (keyCode === 13) {
        requestAnimationFrame(() => $reactModal.remove());
      }
    });
    $closeBtn.addEventListener('click', () => {
      requestAnimationFrame(() => $reactModal.remove());
    });

    // Header
    const $header = document.createElement('div');
    $header.className = 'c-sk-modal_header';
    $header.innerHTML = `
<div data-qa="invite_modal_header" class="c-sk-modal_title_bar c-sk-modal_title_bar--pad_right">
<div class="c-sk-modal_title_bar__text"><h1>Slack Tweaks</h1></div>
</div>`;

    // Finally the settings
    const $settings = this._createSettings();

    $wrapper.append($closeBtn);
    $wrapper.append($header);
    $wrapper.append($settings);

    // animatsia!
    requestAnimationFrame(() => $wrapper.className += ' ReactModal__Content--after-open');

    return $reactModal;
  },

  /**
   * Create the modal inner part
   */
  _createSettings() {
    // Contents
    const $settings = document.createElement('div');
    $settings.className = 'c-sk-modal_content c-sk-modal_content--indicateBottom';

    // Wrapper
    const $settingsWrapper = document.createElement('div');
    $settingsWrapper.className = 'c-scrollbar c-scrollbar--inherit_size';
    $settingsWrapper.innerHTML = `<div data-qa="slack_kit_scrollbar" role="presentation" class="c-scrollbar__hider">
    <div role="presentation" class="c-scrollbar__child" style="width: 492px;">
        <div class="c-sk-modal__content__inner">
            <div data-qa="invite_modal_form" class="c-sk-modal_content_section"></div>
        </div>
    </div>
</div>`;
    $settings.append($settingsWrapper);

    // Get the placeholder for content
    const $content = $settingsWrapper.querySelector('.c-sk-modal_content_section');

    // Plugins List
    const $pluginList = document.createElement('div');
    $pluginList.className = 'c-virtual_list c-virtual_list--scrollbar c-scrollbar';
    $pluginList.innerHTML = `<div role="list" class="c-virtual_list c-virtual_list--scrollbar c-scrollbar" style="width: 440px; height: 481px;">
    <div data-qa="slack_kit_scrollbar" role="presentation" class="c-scrollbar__hider">
        <div role="presentation" class="c-scrollbar__child">
            <div data-qa="slack_kit_list" class="c-virtual_list__scroll_container c-plugins_list" role="presentation">
                
            </div>
        </div>
    </div>
</div>`;
    $content.append($pluginList);

    // Placeholder for plugins
    const $pluginListInner = $pluginList.querySelector('.c-plugins_list');
    // Header
    const $pluginListHeader = document.createElement('div');
    $pluginListHeader.className = 'c-virtual_list__item';
    $pluginListHeader.innerHTML =
      `<div class="p-channel_browser_section_header p-channel_browser_section_header--first">Plugins List</div>`;
    $pluginList.append($pluginListHeader);

    // Now load the plugins
    this._addPlugins($pluginListInner);

    return $settings;
  },

  // Add plugins to the UI
  _addPlugins($container) {
    for (let [pluginName, plugin] of Object.entries(this.plugins)) {
      if (!plugin) {
        continue;
      }

      const $divWrapper = document.createElement('div');
      $divWrapper.className = 'padding_bottom_75';

      // Toggle checkbox
      const $checkbox = this._createOptionCheckbox(plugin);
      $divWrapper.append($checkbox);

      // Explanation
      if (plugin.longDescription) {
        const $fullDescRow = document.createElement('span');
        $fullDescRow.className = 'p-admin_member_table__caption';
        $fullDescRow.innerText = plugin.longDescription;
        $divWrapper.append($fullDescRow);
      }

      if (plugin.extraContentId && plugin.extraContent) {
        const $extraContent = document.createElement('div');
        $extraContent.id = plugin.extraContentId;
        $extraContent.innerHTML = plugin.extraContent();

        if (plugin.extraContentOnClick) {
          for (const button of $extraContent.getElementsByTagName('button')) {
            button.addEventListener('click', plugin.extraContentOnClick.bind(plugin));
          }
        }

        $divWrapper.append($extraContent);
      }

      // Save the element to the plugin
      if (pluginName !== 'main') {
        plugin.$settingEl = $divWrapper;
      }

      $container.append($divWrapper);
    }
  },

  /**
   * Generate an option checkbox
   */
  _createOptionCheckbox(plugin) {
    const $wrapper = document.createElement('div');
    // $wrapper.className = 'padding_bottom_75';

    // Label
    const $label = document.createElement('label');
    $label.className = 'c-label c-label--inline c-label--pointer';
    $label.innerHTML = `<span class="c-label__text" data-qa-label-text="true">${plugin.desc}</span>`;
    $label.htmlFor = plugin.name;
    $label.title = plugin.desc;
    $wrapper.append($label);

    // Checkbox
    const $cb = document.createElement('input');
    $cb.className = 'c-input_checkbox';
    $cb.type = 'checkbox';
    $cb.id = plugin.name;
    $cb.name = plugin.name;
    $cb.checked = plugin.enabled;
    $label.append($cb);

    // Listen to events
    $cb.addEventListener('change', (event) => {
      const enabled = !!event.target.checked;
      // this.setPluginState(name, enabled);
      plugin.enabled = enabled;

      // Execute plugin
      // this.executePlugin(name, enabled);
      plugin.callback(enabled);

      if (plugin.extraContentId) {
        const $extraContent = document.getElementById(plugin.extraContentId);
        for (const child of $extraContent.children) {
          if (plugin.enabled) {
            child.removeAttribute('disabled');
          }
          else {
            child.setAttribute('disabled', true);
          }
        }
      }
    });

    return $wrapper;
  },

  /**
   * Create a tooltip for a plugin in the toolbar
   * @param plugin
   * @returns {HTMLDivElement}
   * @private
   */
  _createTooltip(plugin) {
    // Modal
    const $reactModal = document.createElement('div');
    $reactModal.className = 'ReactModalPortal';

    // Overlay
    const $reactOverlay = document.createElement('div');
    $reactOverlay.className =
      'ReactModal__Overlay ReactModal__Overlay--after-open c-popover c-popover--no-pointer c-popover--z_menu c-popover--fade';
    $reactModal.appendChild($reactOverlay);

    // Contents
    const $wrapper = document.createElement('div');
    $wrapper.className = 'ReactModal__Content ReactModal__Content--after-open popover';
    $wrapper.style.position = 'absolute';
    $wrapper.style.top = plugin.$el.offsetTop + plugin.$el.offsetHeight + 'px';
    $wrapper.style.left = plugin.$el.offsetLeft - (plugin.$el.offsetWidth * 2) + 'px';
    $reactOverlay.appendChild($wrapper);

    // Header
    const $popover = document.createElement('div');
    $popover.innerHTML = `<div role="presentation">
<div id="slack-kit-tooltip" role="tooltip" class="c-tooltip__tip c-tooltip__tip--bottom-right" data-qa="tooltip-tip">
${plugin.desc}
<div class="c-tooltip__tip_shortcut">${plugin.shortcut}</div>
<div class="c-tooltip__tip__arrow" style="right: 18px;"></div>
</div>
</div>`;

    $wrapper.append($popover);

    // animatsia!
    requestAnimationFrame(() => $wrapper.className += ' ReactModal__Content--after-open');

    return $reactModal;
  },

  /**
   * Create the plugin tooltip
   * @param plugin
   */
  addTooltip(plugin) {
    plugin.$el.addEventListener('mouseover', () => {
      if (plugin.$tooltip) {
        return;
      }
      plugin.$tooltip = this._createTooltip(plugin);
      document.body.append(plugin.$tooltip);
    });
    plugin.$el.addEventListener('mouseout', () => {
      plugin.$tooltip && plugin.$tooltip.remove();
      plugin.$tooltip = null;
    });
  },

  loadSettings() {
    try {
      let savedSettings = localStorage.getItem(this.LOCAL_STORAGE);
      if (savedSettings) {
        savedSettings = JSON.parse(savedSettings);

        Object.keys(this.plugins).forEach(key => {
          if (this.plugins[key] && this.plugins[key].loadSettings && savedSettings[key]) {
            this.plugins[key].loadSettings(savedSettings[key]);
          }
        });
      }
    } catch (e) {
      ;
    }
  },

  saveSettings() {
    const settings = {};
    settings.main = {
      pluginsEnabled: this.pluginsEnabled
    }

    Object.keys(this.plugins).forEach(key => {
      if (this.plugins[key] && this.plugins[key].saveSettings) {
        settings[key] = this.plugins[key].saveSettings();
      }
    });

    localStorage.setItem(this.LOCAL_STORAGE, JSON.stringify(settings));
  },

  /**
   * Main
   */
  init() {
    this._initSettings();

    // Add a keybinding to reinit
    document.addEventListener('keydown', ({keyCode, altKey, metaKey}) => {
      if (keyCode === 68 && (metaKey || altKey)) {
        this._initSettings();
      }
    });
  },

  // Init settings dialog
  _initSettings() {
    this.interval = setInterval(() => {
      if (document.getElementById('pluginsSection')) {
        // Already added
        return;
      }

      this.sidebarLoaded = !!document.querySelector('.p-channel_sidebar__static_list');

      if (this.sidebarLoaded) {
        this.$sideBar = document.querySelector('.p-channel_sidebar__static_list .c-scrollbar__hider');
        this._insertPluginSection();
        this.loadSettings();
        this.initPlugins();
        // clearInterval(this.interval);
      }

    }, 1000);
  },

  // Call plugins's init
  initPlugins() {
    Object.entries(this.plugins).forEach(([pluginName, plugin]) => {
      plugin.init && plugin.init();
    });
  }
};

window.slackPluginsAPI = slackPluginsAPI;

/** DO NOT TOUCH THIS PART **/
// Here are files included in the end bundle

// Themes.js
window.slackPluginsAPI = window.slackPluginsAPI || {};
window.slackPluginsAPI.plugins = window.slackPluginsAPI.plugins || {};

window.slackPluginsAPI.plugins.nextTheme = {
  name: 'nextTheme',
  desc: 'Loop over installed themes',
  longDescription: 'Add a button in the toolbar to loop over installed themes',
  enabled: true,
  shortcut: '',
  icon: 'magic',

  callback: function () {
    this.toggle();
  },
  // Theme list
  themes: [
    'oceanic',
    'darker',
    'lighter',
    'palenight',
    'deepocean',
    'monokai',
    'arcdark',
    'onedark',
    'onelight',
    'solardark',
    'solarlight',
    'dracula',
    'github',
    'nightowl',
    'lightowl'
  ],
  // Current theme
  currentTheme: 0,

  // Loop over themes
  nextTheme() {
    this.currentTheme = (this.currentTheme + 1) % this.themes.length;

    this.applyTheme();
  },

  applyTheme() {
    document.dispatchEvent(new CustomEvent('ThemeChanged', {
      detail: window.themePresets[this.themes[this.currentTheme]]
    }));
    window.slackPluginsAPI.saveSettings();
  },

  init() {
    // Next Theme
    const $nextThemeBtn = document.createElement('button');
    this.$el = $nextThemeBtn;

    $nextThemeBtn.className =
      'c-button-unstyled p-classic_nav__right__button p-classic_nav__right__button--sidebar p-classic_nav__right__sidebar p-classic_nav__no_drag';
    this.addIcon($nextThemeBtn);
    $nextThemeBtn.addEventListener('click', this.nextTheme.bind(this));
    // Add tooltip
    window.slackPluginsAPI.addTooltip(this);

    // this.toggleDisplay($nextThemeBtn, 'nextTheme');

    let $header = document.querySelector('.p-classic_nav__right_header');
    if ($header) {
      // Add buttons
      $header.appendChild($nextThemeBtn);
    }

    this.toggleDisplay(this.$el);
    this.applyTheme();
  },

  toggle() {
    this.toggleDisplay(this.$el);
    window.slackPluginsAPI.saveSettings();
  },

  loadSettings(settings) {
    Object.assign(this, settings);
  },

  saveSettings() {
    return {
      enabled: this.enabled,
      currentTheme: this.currentTheme
    }
  },

  // Show/hide a toolbar button
  toggleDisplay(button) {
    if (this.enabled) {
      button.style.display = 'flex';
    }
    else {
      button.style.display = 'none';
    }
  },

  switch(enabled) {
    this.enabled = enabled;
    this.toggle();
  },

  addIcon(button) {
    button.innerHTML = `<i class="c-icon c-icon--${this.icon}" type="magic" aria-hidden="true"></i>`;
  }
};

// Sidebar.js
window.slackPluginsAPI = window.slackPluginsAPI || {};
window.slackPluginsAPI.plugins = window.slackPluginsAPI.plugins || {};

window.slackPluginsAPI.plugins.sidebar = {
  name: 'sidebar',
  desc: 'Toggle Sidebar',
  longDescription: 'Show or hide the sidebar',
  enabled: true,
  shortcut: '',
  icon: 'side-panel',

  sidebarEnabled: true,

  callback: function () {
    this.toggle();
  },

  // Toggle Sidebar
  toggleSidebar() {
    this.sidebarEnabled = !this.sidebarEnabled;
    this.applySidebar();

    window.slackPluginsAPI.saveSettings();
  },

  applySidebar() {
    const sidebar = document.querySelector('.p-workspace');
    if (this.sidebarEnabled) {
      sidebar.style.gridTemplateColumns = '0px auto';
    }
    else {
      sidebar.style.gridTemplateColumns = '220px auto';
    }
  },

  init() {
    // Toggle Sidebar
    const $sidebarBtn = document.createElement('button');
    this.$el = $sidebarBtn;

    $sidebarBtn.className =
      'c-button-unstyled p-classic_nav__right__button p-classic_nav__right__button--sidebar p-classic_nav__right__sidebar p-classic_nav__no_drag';
    this.addIcon($sidebarBtn);
    $sidebarBtn.addEventListener('click', this.toggleSidebar.bind(this));
    // Add tooltip
    window.slackPluginsAPI.addTooltip(this);

    // this.toggleDisplay($sidebarBtn, 'sidebar');

    let $header = document.querySelector('.p-classic_nav__right_header');
    if ($header) {
      // Add buttons
      $header.appendChild($sidebarBtn);
    }

    this.toggleDisplay(this.$el);
    this.applySidebar();
  },

  toggle() {
    this.toggleDisplay(this.$el);
    window.slackPluginsAPI.saveSettings();
  },

  loadSettings(settings) {
    Object.assign(this, settings);
  },

  saveSettings() {
    return {
      enabled: this.enabled,
      sidebarEnabled: this.sidebarEnabled
    };
  },

  // Show/hide a toolbar button
  toggleDisplay(button) {
    if (this.enabled) {
      button.style.display = 'flex';
    }
    else {
      button.style.display = 'none';
    }
  },

  switch(enabled) {
    this.enabled = enabled;
    this.toggle();
  },

  addIcon(button) {
    button.innerHTML = `<i class="c-icon c-icon--${this.icon}" type="magic" aria-hidden="true"></i>`;
  }
};

// Fonts.js
window.slackPluginsAPI = window.slackPluginsAPI || {};
window.slackPluginsAPI.plugins = window.slackPluginsAPI.plugins || {};

window.slackPluginsAPI.plugins.fonts = {
  name: 'fonts',
  desc: 'Custom Fonts',
  longDescription: 'Enter the custom fonts, separated by commas',
  enabled: true,
  shortcut: '',
  icon: 'format',

  DEFAULT_CUSTOM: 'Roboto, Slack-Lato, appleLogo, sans-serif',
  DEFAULT: 'Slack-Lato, appleLogo, sans-serif',

  fontFamily: 'Roboto, Slack-Lato, appleLogo, sans-serif',
  fontsEnabled: false,

  extraContentId: 'customFonts',

  extraContent() {
    return `<input class="c-input_text p-prefs_modal__custom_theme_input" style="width:70%" placeholder="Enter fonts, separated by commas" id="fontFamily" name="fontFamily" type="text" value="${this.fontFamily}">
<button id="customFontsButton" name="customFontsButton" class="c-button c-button--outline c-button--medium null--outline null--medium" type="button">Apply</button>`;
  },

  callback: function () {
    this.toggle();
  },

  extraContentOnClick() {
    const ff = document.getElementById('fontFamily').value;
    if (ff) {
      this.fontFamily = ff;
      this.applyFonts();
    }
  },

  // Toggle Fonts
  toggleFonts() {
    this.fontsEnabled = !this.fontsEnabled;
    this.applyFonts();
  },

  applyFonts() {
    if (this.fontsEnabled) {
      document.querySelector('body').style.fontFamily = this.fontFamily;
    }
    else {
      document.querySelector('body').style.fontFamily = 'Slack-Lato,appleLogo,sans-serif';
    }
    window.slackPluginsAPI.saveSettings();
  },

  init() {
    // Toggle Fonts
    const $fontsToggleBtn = document.createElement('button');
    this.$el = $fontsToggleBtn;

    $fontsToggleBtn.className =
      'c-button-unstyled p-classic_nav__right__button p-classic_nav__right__button--sidebar p-classic_nav__right__sidebar p-classic_nav__no_drag';
    this.addIcon($fontsToggleBtn);
    $fontsToggleBtn.addEventListener('click', this.toggleFonts.bind(this));
    // Add tooltip
    window.slackPluginsAPI.addTooltip(this);

    let $header = document.querySelector('.p-classic_nav__right_header');
    if ($header) {
      // Add buttons
      $header.appendChild($fontsToggleBtn);
    }

    this.toggleDisplay(this.$el);
    this.applyFonts();
  },

  toggle() {
    this.toggleDisplay(this.$el);
    window.slackPluginsAPI.saveSettings();
  },

  loadSettings(settings) {
    Object.assign(this, settings);
  },

  saveSettings() {
    return {
      enabled: this.enabled,
      fontFamily: this.fontFamily,
      fontsEnabled: this.fontsEnabled
    };
  },

  // Show/hide a toolbar button
  toggleDisplay(button) {
    if (this.enabled) {
      button.style.display = 'flex';
    }
    else {
      button.style.display = 'none';
    }
  },

  switch(enabled) {
    this.enabled = enabled;
    this.toggle();
  },

  addIcon(button) {
    button.innerHTML = `<i class="c-icon c-icon--${this.icon}" type="magic" aria-hidden="true"></i>`;
  }
};


/** END DO NOT TOUCH THIS PART */

window.slackPluginsAPI.init();
