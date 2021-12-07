const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('report', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user',
                key: 'user_id'
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        last_update: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        sequelize,
        tableName: 'report',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    {name: "id"},
                ]
            },
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
