/**
 * We.js email plugin feature
 */
const Email = require('./lib/Email');

module.exports = function loadPlugin(projectPath, Plugin) {
  const plugin = new Plugin(__dirname);

  plugin.setConfigs({
    emailTypes: {},
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
  });

  plugin.setRoutes({
    'get /email-template-type': {
      controller: 'email-template',
      action: 'getType',
      responseType: 'json'
    }
  });

  plugin.setResource({ name: 'email-template' });
  plugin.setResource({ name: 'email-log' });
  plugin.setResource({ name: 'email' });

  plugin.emailSSAttrs = [
    'smtp__replyTo',
    'smtp__port',
    'smtp__auth__user',
    'smtp__auth__pass',
    'smtp__debug',
    'smtp__ignoreTLS',
    'smtp__service',
    'smtp__name',
    // default mail options:
    'smtp__mailOptions__sendToConsole',
    'smtp__mailOptions__from',
    'smtp__mailOptions__subject',
    // optional params
    'smtp__host',
    'smtp__secure',
    'smtp__localAddress',
    'smtp__connectionTimeout',
    'smtp__greetingTimeout',
    'smtp__socketTimeout',
    'smtp__method',
    'smtp__tls'
  ];

  plugin.cachedSS = {};

  plugin.cacheCurrentSSEmailConfig = function cacheCurrentSSEmailConfig(we, done) {

    for (let i = 0; i < plugin.emailSSAttrs.length; i++) {
      let name = plugin.emailSSAttrs[i];

      if (we.systemSettings[name] === undefined) {
        delete plugin.cachedSS[name];
      } else {
        plugin.cachedSS[name] = we.systemSettings[name];
      }
    }

    we.email.resetTransporter(we);

    done();
  }

  plugin.resetEmailTransporter = function resetEmailTransporter(we) {
    if (!we.email || !we.email.transporter) return null;

    we.email.resetTransporter(we);
    return null;
  }

  // set we.email after load all plugins
  plugin.events.on('we:after:load:plugins', function(we){
    we.email = new Email(we);
  });

  plugin.hooks.on('we-core:on:register:templates', function(we, next){
    we.log.verbose('loadEmailTemplates step');
    we.email.init(we);

    next();
  });

  plugin.hooks.on('system-settings:started', plugin.cacheCurrentSSEmailConfig);
  plugin.events.on('system-settings:updated:after', plugin.resetEmailTransporter);

  return plugin;
};