const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('feedback', {
        room_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'room',
                key: 'room_id'
            }
        },
        client_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user',
                key: 'user_id'
            }
        },
        feed_back: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false
        },
        last_update: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        sequelize,
        tableName: 'feedback',
        timestamps: false,
        indexes: [
            {
                name: "room_id",
                using: "BTREE",
                fields: [
                    {name: "room_id"},
                ]
            },
            {
                name: "client_id",
                using: "BTREE",
                fields: [
                    {name: "client_id"},
                ]
            },
        ]
    });
};
