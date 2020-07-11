/**
 * Email template model
 */
const Handlebars = require('handlebars'),
  compile = Handlebars.compile,
  juice = require('juice');

module.exports = function emailTemplateModel(we) {
  const _ = we.utils._;
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

  const model = {
    definition: {
      subject: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
      },
      text: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
      },
      css: {
        type: we.db.Sequelize.TEXT,
        allowNull: true,
        skipSanitizer: true
      },
      html: {
        type: we.db.Sequelize.TEXT,
        allowNull: true,
        skipSanitizer: true
      },
      type: {
        type: we.db.Sequelize.STRING,
        allowNull: true
      },
      typeSettings: {
        type: we.db.Sequelize.VIRTUAL,
        get() {
          if (!this.type) {
            return {};
          }
          return we.config.emailTypes[ this.type ] || {};
        }
      }
    },

    associations: {},
    options: {
      instanceMethods: {
        render(templateVariables) {
          return new Promise( (resolve)=> {
            const typeSettings = this.typeSettings;
            let result = {};

            if (this.subject) {

              result.subject = compile(this.subject)(templateVariables);
            } else if (typeSettings.defaultSubject) {
              result.subject = compile(typeSettings.defaultSubject)(templateVariables);
            }

            if (this.text) {
              result.text = compile(this.text)(templateVariables);
            } else if (typeSettings.defaultText) {
              result.text = compile(typeSettings.defaultSubject)(templateVariables);
            }

            if (this.html) {
              result.html = compile(this.html)(templateVariables);
            } else if (typeSettings.defaultHTML) {
              result.html = compile(typeSettings.defaultHTML)(templateVariables);
            }

            if (result.html && this.css) {
              result.html = '<style>' + this.css + '</style>' + result.html;
              result.html = juice(result.html);

              resolve(result);
            } else {
              resolve(result);
            }
          });
        }
      },
      classMethods: {}
    }
  }
  return model;
}
