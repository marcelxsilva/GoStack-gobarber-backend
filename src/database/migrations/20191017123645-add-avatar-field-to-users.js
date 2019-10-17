'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'users', // qual tabela a ser adicionada
      'avatar_id', // o nome da coluna a aser adicionada
      {
        type: Sequelize.INTEGER, // tipo do dado da coluna
        references: { // qual sera a chave estrangeira a ser referenciada em outra entidade
          model: 'files', // qual sera a tabela externa
          key: 'id' // chave que sera usada como referencia - sera o valor que ficara na coluna avatar_id de usuarios
        },
        onUpdate: 'CASCADE', // o que devera ser feito caso o dado seja atualizado.
        onDelete: 'SET NULL', // caso o avatar seja deletado o que sera feito na entidade de usuarios
        allowNUll: true
      }
    )
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'avatar_id');
  }
};
