/**
 * We.js email sender
 */

const nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport');
let async;

function Email(we) {
  this.we = we;
  async = we.utils.async;

  // email template class
  // this.EmailTemplate = EmailTemplate;

  this.templates = {};
  // default transporter to send emails
  this.transporter = null;
  this.mailOptions = null;
}

Email.prototype = {
  // init function
  init(we, transporter) {
    this.resetTransporter(we, transporter);
  },
  resetTransporter(we, transporter) {
    this.mailOptions = we.config.email.mailOptions;

    if (transporter) {
      this.transporter = transporter
    } else {
      const configs = this.getConfiguration(we);

      if (configs.mailOptions) {
        this.mailOptions = configs.mailOptions;
      }

      // create reusable transporter object using SMTP transport
      this.transporter = nodemailer
        .createTransport( smtpTransport(configs) );
    }
  },
  /**
   * Get configuration
   *
   * @param  {Object} we
   * @return {Object} Email transport configuration
   */
  getConfiguration(we) {
    if (we.systemSettings) {
      const ss = we.systemSettings;

      if (ss.smtp__auth__user && ss.smtp__auth__pass) {
        const _ = we.utils._;

        let cfgs = {};

        for(let name in we.systemSettings) {
          if (name.indexOf('smtp__') === 0) {
            _.set(
              cfgs,
              name.replace('smtp__', '').replace('__', '.'),
              we.systemSettings[name]
            );
          }
        }

        cfgs.type = 'SMTP';
        cfgs.service = 'Zoho';
        cfgs.secure = true;

        return cfgs;
      }


    }

    // defaults to local static config:
    return we.config.email;
  },
  /**
   * Send email with template
   *
   * @param  {String}   templateName      Template name
   * @param  {Object}   options           Options for nodemailer
   * @param  {Object}   templateVariables variables to be avaible in template
   * @param  {Function} cb                callback
   */
  sendEmail(type, options, templateVariables, cb) {
    const we = this.we;

    options.type = type;
    options.status = 'added';
    options.variables = templateVariables;

    return this.render(options)
    .then( ()=> {

      this.setDefaultEmailOptions(options);

      return we.db.models.email
      .create(options)
      .then( (record)=> {
        // email rendered ... try to send
        return this.sendP(record);
      })
      .then( (info)=> {
        // success ... send
        cb(null, info);
        return null;
      });
    })
    .catch(cb);
  },

  /**
   * Render one email
   * Load email template model and if avaible render the email.
   *
   * @param  {Object} options
   * @return {Promise}
   */
  render(options) {
    return this.we.db.models['email-template']
    .findOne({
      where: { type: options.type }
    })
    .then( (tpl)=> {
      if (!tpl) {
        // template not found, cant render... keep email status = added
        return options;
      }

      return tpl.render(options.variables)
      .then( (result)=> {
        if (!options.subject && result.subject) {
          options.subject = result.subject;
        }
        options.html = result.html;
        options.text = result.text;
        options.status = 'rendered';

        return options;
      });
    })
    // .then( (email)=> {
    //   if (email.status == 'rendered') {}
    // });
  },

  /**
   * Set default email options if not is set
   *
   * @param {Object} options  Email options or email record
   */
  setDefaultEmailOptions(options) {
    const mo = this.mailOptions;

    if (options.email && !options.to) options.to = options.email;
    if (!options.from) options.from = mo.from;
    if (!options.replyTo) options.replyTo = mo.replyTo;

    return options;
  },

  /**
   * Send one email
   *
   * @param  {Object}   options options to use in nodemailer
   * @param  {Function} cb      callback
   */
  send(options, cb) {
    const email = this;

    if (
      email.we.env == 'test' ||
      options.testEmail ||
      email.mailOptions.sendToConsole
    ) {
      email.showDebugEmail(options);
      cb(null, {
        messageId: '1'
      });
      return null;
    }

    if (options.toJSON) {
      options = options.toJSON();
    }

    // send mail with defined transport object
    email.transporter.sendMail(options, (error, info)=> {
      if (error) {
        email.we.log.error('Error on send email:', error);
        return cb(error, options);
      }

      email.we.log.debug('Email send:', info, options);
      // success
      return cb(null, info, options);
    });
  },

  /**
   * Send one email with promise support
   *
   * @param  {Object} email email record to send
   * @return {Promise}
   */
  sendP(email) {
    return new Promise( (resolve, reject)=> {
      this.send(email, (err, info)=> {
        if (err) {
          email.status = 'error';

          return email.save()
          .then( ()=> {
            reject(err);
            return null;
          });
        }
        // on success update email status to send:
        email.status = 'send';
        email.emailId = info.messageId;

        return email.save()
        .then( ()=> {
          resolve(info);
          return null;
        });

      });
    });
  },
  /**
   * Show email on terminal - to tests and if dont have a email server configured
   */
  showDebugEmail (options) {
    const log = this.we.log;

    if (options.toJSON) options = options.toJSON();

    // dont send emails in test enviroment
    log.warn('---- email.showDebugEmail ----');
    log.warn('---- Email options: ----');
    log.info(options);
    log.warn('---- Displaying the html email that would be sent ----');
    log.info('HTML:\n',options.html);
    log.warn('---- Displaying the text email that would be sent ----');
    log.info('text:\n',options.text);
    log.warn('----------------------------- END --------------------------');
  }
}

module.exports = Email;
