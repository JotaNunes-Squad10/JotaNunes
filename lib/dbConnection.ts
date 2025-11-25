import mysql from 'mysql2/promise';

// Função para criar conexão com o banco de dados MySQL
export const createConnection = async () => {
    try {
        const connection = await mysql.createConnection({
            host: '138.197.205.150',
            user: 'mysql',
            password: 'jotanunes',
            database: 'jotanunes',
            port: 3306
        });
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        return connection;
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        throw error;
    }
};