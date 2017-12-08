/**
 * Email template model
 */
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
        allowNull: true
      },
      html: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
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
              result.subject = _.template(this.subject)(templateVariables);
            } else if (typeSettings.defaultSubject) {
              result.subject = _.template(typeSettings.defaultSubject)(templateVariables);
            }

            if (this.text) {
              result.text = _.template(this.text)(templateVariables);
            } else if (typeSettings.defaultText) {
              result.text = _.template(typeSettings.defaultSubject)(templateVariables);
            }

            if (this.html) {
              result.html = _.template(this.html)(templateVariables);
            } else if (typeSettings.defaultHTML) {
              result.html = _.template(typeSettings.defaultHTML)(templateVariables);
            }

            resolve(result);
          });
        }
      },
      classMethods: {}
    }
  }
  return model;
}
