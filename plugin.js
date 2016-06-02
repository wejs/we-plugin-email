/**
 * We.js email plugin feature
 */
var Email = require('./lib/Email');

module.exports = function loadPlugin(projectPath, Plugin) {
  var plugin = new Plugin(__dirname);
  plugin.setConfigs({
    // see https://github.com/andris9/nodemailer-smtp-transport for config options
    email: {
      // default mail options
      mailOptions: {
        // by default log emails in console
        sendToConsole: true,
        // default from and to
        from: 'We.js project <contato@wejs.org>', // sender address
        subject: 'A We.js project email', // Subject line
      },
      // connection configs
      port: 25,
      auth: {
        user: '',
        pass: ''
      },
      debug: true,
      ignoreTLS: false,
      name: null,
      // optional params
      // host: 'localhost',
      // secure: 'true',
      // localAddress: '',
      // connectionTimeout: '',
      // greetingTimeout: '',
      // socketTimeout: '',

      // authMethod: '',
      // tls: ''
    }
  })
  // set we.email after load all plugins
  plugin.events.on('we:after:load:plugins', function(we){
    we.email = new Email(we);
  });

  plugin.hooks.on('we-core:on:register:templates', function(we, next){
    we.log.verbose('loadEmailTemplates step');
    we.email.init(we);

    we.email.loadEmailTemplates(we, function (err, templates) {
      if (err) return next(err);
      we.email.templates = templates;
      next();
    });
  })

  return plugin;
};