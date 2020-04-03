module.exports = function sendEmailCommand(program, helpers) {
  /**
   * Command to send emails with current project configuration and emails
   */
  let we, templateVariables;

  program
  .command('send-email')
  .option('-t, --to <email>', 'Email how will receive the text. Ex: contact.wejs.org')
  .option('-f, --from <email>', 'From email address. Ex: contact.wejs.org')
  .option('-H, --html [html]', 'Email content in html format')
  .option('-s, --text [text]', 'Email content in text format')
  .option('-S, --subject [text]', 'Email content in text format')
  .option('-T, --template [template]', 'Template name. keep empty to send without template')
  .option('-V, --variables [variables]', 'Template variables, locals. Set it as string with JSON.stringify()')
  .description('Send one email with current project configuration')
  .action(function run(opts) {
    we = helpers.getWe();

    const options = {
      to: opts.to,
      from: opts.from,
      subject: opts.subject,
      html: opts.html,
      text: opts.text
    };

    if (!opts.to) {
      we.log.error('we send-email: --to param is required', { options });
      return process.exit();
    }

    we.bootstrap( (err)=> {
      if (err) return doneAll(err);

      we.log.verbose('we send-email:Sending ...', { options });

      if (opts.template) {
        templateVariables = JSON.parse(opts.template);
        // send email with template
        we.email.sendEmail(opts.template, options, templateVariables, doneAll);
      } else {
        // send without template
        we.email.setDefaultEmailOptions(options);
        we.email.send(options, doneAll);
      }
    });

    function doneAll(err, result) {
      if (err) {
        we.log.error('Error on send email:', {
          error: err,
          result: result
        });
      } else {
        we.log.info('we send-email:success', {
          result
        });
      }
      // end / exit
      we.exit(process.exit);
    }
  });
}