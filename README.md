


## Este projeto é baseado nas aulas do Bootcamp da Rocketseat


## Ferramentas utilizadas

#### Express
Como alguns ja sabem, o express é um framework que facilita o desenvolvimento de APIs simples e robustas.

#### Nodemon
Quando estamos desenvolvendo um server com express, após realizar algumas modificações no código é necessario parar o processo e iniciar novamente para o server recarregar as modificações realizada. Fazer isso todas as vezes acaba ficando cansativo quando estamos desenvolvendo, por esse motivo existe o [nodemon](https://nodemon.io) ele monitora todas as modificações feitas no arquivo e reinicia o server automaticamente.

#### Sucrase
Sucrase é um compilador semelhante ao babel, porem um pouco mais rapido podendo trazer um ganho de velocidade de 4x ou até 20x mais em comparação ao babel, voce pode acessar  o [Github do sucrase](https://github.com/alangpierce/sucrase) para saber mais.

Neste projeto estou utilizando o sucrase pois ele me permite a utilização de algumas abstrações que são utilizadas em outros frameworks mas que não são suportadas com nodejs, como por exemplo a importação de um pacote que no node é <code>const express = require('express');</code>, o sucrase me da a possibilidade de utilizar o import, trocando o código por <code>import express from 'express';</code>

Após a instalação foi criado um arquivo um arquivo chamado <code>nodemon.json</code> na raiz do projeto com o conteudo:

```JSON
{
    "execMap": {
        "js": "node -r sucrase/register"
    }
}

```
Este comando diz que antes de ser executado o nodemon ele executa o register do Sucrase, possibilitando que a utilização das abstrações não gere erro no código.

#### Docker
[Docker](https://www.docker.com/products/docker-enterprise) permite o isolamento de  um aplicação ou ambiente inteiro dentro de um container, essas aplicações são chamadas de imagens. Dentro deste projeto estou utilizando a imagem do [Postgres](https://hub.docker.com/_/postgres).

#### Postbird
É um cliente grafico para o gerenciamento de banco de dados, que neste caso é destinado ao postgresSQL, [Saiba mais sobre](https://electronjs.org/apps/postbird)

#### Sequelize
É um ORM é um ferramenta para realizar a abstração da forma que trabalhamos com banco de dados, [Sequelize](https://sequelize.org) é utilizado para administrar banco de dados SQL.

#### bcryptjs
Utilizado para encriptar a senha do usuário da aplicação

#### Json Web Token
Utilizado para gerar um token de sessão da aplicação

#### Yup
Utilizado para validar as entradas do usuário na aplicação, algumas requisições possuem valores obrigatórios casos esses valores nao estiver presente na requisição será disparado um erro

#### multer
Para lidar com arquivos durante as requisições, utillizado para upload de arquivos.
