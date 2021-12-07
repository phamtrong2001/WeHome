const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('facility_room', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        room_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'room',
                key: 'room_id'
            }
        },
        facility_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'facility',
                key: 'facility_id'
            }
        }
    }, {
        sequelize,
        tableName: 'facility_room',
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
                name: "room_id",
                using: "BTREE",
                fields: [
                    {name: "room_id"},
                ]
            },
            {
                name: "facility_id",
                using: "BTREE",
                fields: [
                    {name: "facility_id"},
                ]
            },
        ]
    });
};
