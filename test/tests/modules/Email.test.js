var assert = require('assert');
var helpers = require('we-test-tools').helpers;
var email, we;

function emailStub() {
  return {
    to: 'contact@wejs.org',
    from: we.config.email.mailOptions.from,
    subject: we.config.email.mailOptions.subject,
    html: '<h2>Hello world!</h2>',
    test: 'Hello in text'
  }
}

describe('lib.Email', function () {
  before(function (done) {
    we = helpers.getWe();
    email = we.email;
    done();
  });

  before(function (done) {
    // add one email type to send:
    we.config.emailTypes = {
      siteContact: {
        label: 'Email de contato do site',
        templateVariables: {
          name: {
            description: 'Nome da pessoa ou organização que está entrando em contato'
          },
          phone: {
            description: 'Telefone da pessoa ou organização'
          },
          email: {
            description: 'Email da pessoa ou organização que está entrando em contato'
          },
          message: {
            description: 'Mensagem da pessoa ou organização que está entrando em contato'
          },
          ip: {
            description: 'IP da pessoa ou organização que está entrando em contato'
          },
          siteName: {
            description: 'Nome deste site'
          },
          siteUrl: {
            description: 'Endereço deste site'
          }
        }
      }
    };

    done();
  });

  describe('send', function() {
    var oldTrasporter;

    before(function (done) {
      var transporter = require('nodemailer')
        .createTransport({
          transport: 'Stub'
        });

      oldTrasporter = email.transporter;

      email.transporter = transporter;

      email.we.env = 'dev';
      email.mailOptions.sendToConsole = false;

      done();
    });

    after( function(done) {
      email.transporter = oldTrasporter;

      email.we.env = 'test';
      email.mailOptions.sendToConsole = true;

      done();
    });
  });

  describe('showDebugEmail', function(){
    it('should run showDebugEmail if are in test env', function (done) {
      var showDebugEmailCalled = false;
      var options = emailStub();
      var old_showDebugEmail = email.showDebugEmail;
      email.showDebugEmail = function(opts) {
        assert.equal(opts.from, email.mailOptions.from);
        assert.equal(opts.subject, email.mailOptions.subject);
        assert.equal(opts.to, options.to);
        assert.equal(opts.html, options.html);
        assert.equal(opts.text, options.text);
        showDebugEmailCalled = true;
      }

      email.send(options, function (err) {
        if (err) return done(err);

        assert(showDebugEmailCalled, 'showDebugEmail not run');

        email.showDebugEmail = old_showDebugEmail;

        done();
      });
    });

    it('should run showDebugEmail if email.mailOptions.sendToConsole', function (done) {
      var old_env = we.env;
      we.env = 'dev';
      var old_sendToConsole = email.mailOptions.sendToConsole;
      email.mailOptions.sendToConsole = true;

      var showDebugEmailCalled = false;
      var options = emailStub();
      var old_showDebugEmail = email.showDebugEmail;
      email.showDebugEmail = function(opts) {
        assert.equal(opts.from, email.mailOptions.from);
        assert.equal(opts.subject, email.mailOptions.subject);
        assert.equal(opts.to, options.to);
        assert.equal(opts.html, options.html);
        assert.equal(opts.text, options.text);
        showDebugEmailCalled = true;
      }

      email.send(options, function (err) {
        if (err) return done(err);

        assert(showDebugEmailCalled, 'showDebugEmail not run');

        email.showDebugEmail = old_showDebugEmail;
        we.env = old_env;
        email.mailOptions.sendToConsole = old_sendToConsole;

        done();
      });
    });

    it('should run showDebugEmail and print the email in console', function (done) {
      var called_info, called_warn;

      var info = we.log.info;
      we.log.info = function() {
        called_info = true;
      }
      var warn = we.log.warn;
      we.log.warn = function() {
        called_warn = true
      }

      var options = emailStub();

      email.send(options, function (err) {
        if (err) return done(err);

        assert(called_info, 'we.log.info called');
        assert(called_warn, 'we.log.warn called');

        we.log.info = info;
        we.log.warn = warn

        done();
      });
    });
  });
});