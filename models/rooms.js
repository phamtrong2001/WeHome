const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rooms', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    total_point: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    total_reviews: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    place_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    guests: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    beds: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    bedrooms: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    bathrooms: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    rules: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    accommodation_type: {
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
    tableName: 'rooms',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "type_id",
        using: "BTREE",
        fields: [
          { name: "type_id" },
        ]
      },
      {
        name: "place_id",
        using: "BTREE",
        fields: [
          { name: "place_id" },
        ]
      },
    ]
  });
};
