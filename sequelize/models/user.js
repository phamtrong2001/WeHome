const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        user_id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        phone: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        email: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        username: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        password: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        last_update: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
        },
        role: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: "client"
        }
    }, {
        sequelize,
        tableName: 'user',
        hasTrigger: true,
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    {name: "user_id"},
                ]
            },
        ]
    });
};
