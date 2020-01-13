/**
 * Email model
 */
module.exports = function emailModel(we) {
  const model = {
    definition: {
      emailId: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
      },
      from: {
        type: we.db.Sequelize.TEXT,
        allowNull: false,
        skipSanitizer: true
      },
      to: {
        type: we.db.Sequelize.TEXT,
        allowNull: true,
        skipSanitizer: true
      },
      cc: {
        type: we.db.Sequelize.TEXT,
        allowNull: true,
        skipSanitizer: true
      },
      bcc: {
        type: we.db.Sequelize.TEXT,
        allowNull: true,
        skipSanitizer: true
      },
      replyTo: {
        type: we.db.Sequelize.TEXT,
        allowNull: true,
        skipSanitizer: true
      },
      inReplyTo: {
        type: we.db.Sequelize.TEXT,
        allowNull: true,
        skipSanitizer: true
      },
      variables: {
        type: we.db.Sequelize.VIRTUAL,
        allowNull: true,
        skipSanitizer: true,
        get()  {
          if (this.getDataValue('variables'))
            return JSON.parse( this.getDataValue('variables') );
          return {};
        },
        set(object) {
          if (typeof object == 'object') {
            this.setDataValue('variables', JSON.stringify(object));
          } else {
            throw new Error('invalid error in email variables value: ', object);
          }
        }
      },
      subject: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
      },
      text: {
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
      status: { // added, redered, send, error, canceled
        type: we.db.Sequelize.STRING,
        allowNull: false,
        defaultValue: 'added'
      }
    },

    associations: {
      logs: {
        type: 'hasMany',
        model: 'email-log',
        inverse: 'email'
      }
    },
    options: {
      classMethods: {}
    }
  }
  return model;
}
