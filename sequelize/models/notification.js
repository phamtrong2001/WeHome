const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('notification', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user',
                key: 'user_id'
            }
        },
        details: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        last_update: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.Sequelize.fn('current_timestamp')
        }
    }, {
        sequelize,
        tableName: 'notification',
        timestamps: false,
        indexes: [
            {
                name: "user_id",
                using: "BTREE",
                fields: [
                    {name: "user_id"},
                ]
            },
        ]
    });
};
