'use strict';
module.exports = (sequelize, DataTypes) => {
  const group = sequelize.define('group', {
    uuid: DataTypes.STRING,
    name: DataTypes.STRING,
    owner_id: DataTypes.INTEGER
  }, {
    underscored: true,
  });
  group.associate = function(models) {
    // associations can be defined here
  };
  return group;
};