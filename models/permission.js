'use strict';
module.exports = (sequelize, DataTypes) => {
  const permission = sequelize.define('permission', {
    target_group_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    read: DataTypes.BOOLEAN,
    write: DataTypes.BOOLEAN,
    execute: DataTypes.BOOLEAN
  }, {
    underscored: true,
  });
  permission.associate = function(models) {
    // associations can be defined here
  };
  return permission;
};