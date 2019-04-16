'use strict';
module.exports = (sequelize, DataTypes) => {
  const group_member = sequelize.define('group_member', {
    group_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    underscored: true,
  });
  group_member.associate = function(models) {
    // associations can be defined here
  };
  return group_member;
};