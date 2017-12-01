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
      }
    },

    associations: {},
    options: {
      instanceMethods: {
        render(templateVariables) {
          return new Promise( (resolve)=> {
            let result = {};

            if (this.subject) {
              result.subject = _.template(this.subject)(templateVariables);
            }

            if (this.text) {
              result.text = _.template(this.text)(templateVariables);
            }

            if (this.html) {
              result.html = _.template(this.html)(templateVariables);
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
