'use strict';
module.exports = (sequelize, DataTypes) => {
  const content_meta = sequelize.define('content_meta', {
    object_id: DataTypes.STRING,
    path: DataTypes.STRING,
    original: DataTypes.BOOLEAN,
    owner_id: DataTypes.INTEGER
  }, {
    underscored: true,
  });
  content_meta.associate = function(models) {
    // associations can be defined here
  };
  return content_meta;
};
