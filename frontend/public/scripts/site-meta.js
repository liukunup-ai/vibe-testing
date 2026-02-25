(function() {
  try {
    const cachedSettings = localStorage.getItem('site_settings');
    if (cachedSettings) {
      const settings = JSON.parse(cachedSettings);
      if (settings.icon) {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = settings.icon;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      if (settings.title) {
        document.title = settings.title;
      }
    }
  } catch (e) {}
})();
