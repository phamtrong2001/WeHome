const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('room', {
        room_id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        room_name: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        address_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'address',
                key: 'address_id'
            }
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        room_type_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'room_type',
                key: 'room_type_id'
            }
        },
        host_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user',
                key: 'user_id'
            }
        },
        num_guest: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        num_bed: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        num_bedroom: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        num_bathroom: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        rule: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        accommodation_type: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        rate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        total_rated: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
        },
        confirmed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
        },
        last_update: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        sequelize,
        tableName: 'room',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    {name: "room_id"},
                ]
            },
            {
                name: "address_id",
                using: "BTREE",
                fields: [
                    {name: "address_id"},
                ]
            },
            {
                name: "room_type_id",
                using: "BTREE",
                fields: [
                    {name: "room_type_id"},
                ]
            },
            {
                name: "host_id",
                using: "BTREE",
                fields: [
                    {name: "host_id"},
                ]
            },
        ]
    });
};
