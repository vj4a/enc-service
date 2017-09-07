module.exports = function(sequelize, DataTypes) {
  const Keys = sequelize.define("Keys", {
    public: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    private: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM("MASTER","OTHER"),
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {});
  return Keys;
};