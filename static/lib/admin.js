/* globals $, app, socket, define */

define('admin/plugins/assetsdomain', ['settings'], (settings) => {
  const ACP = {};
  const settingHash = 'assetsdomain';
  const formClass = `.${settingHash}-settings`;

  function saveSettings() {
    settings.save(settingHash, $(formClass), () => {
      app.alert({
        type: 'success',
        title: 'Settings Saved',
        message: 'Please reload your NodeBB to apply these settings',
        clickfn() {
          socket.emit('admin.reload');
        },
      });
    });
  }

  ACP.init = () => {
    settings.load(settingHash, $(formClass));
    $('#save').on('click', saveSettings);
  };


  return ACP;
});
