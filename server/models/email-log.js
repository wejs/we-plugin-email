/**
 * Email log model
 */
module.exports = function emailLogModel(we) {
  const model = {
    definition: {
      label: {
        type: we.db.Sequelize.STRING,
        allowNull: false
      },
      text: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: we.db.Sequelize.STRING,
        allowNull: false
      }
    },

    associations: {
      email: {
        type: 'belongsTo',
        model: 'email',
        inverse: 'logs'
      }
    },
    options: {
      classMethods: {}
    }
  }
  return model;
}
