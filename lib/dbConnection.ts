import mysql from 'mysql2/promise';

// Função para criar conexão com o banco de dados MySQL
export const createConnection = async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'metro.proxy.rlwy.net',
            user: 'root',
            password: 'iOJZKMIVbfvAaRuZyFtZYUXbbMNheCcA',
            database: 'railway',
            port: 43457
        });
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        return connection;
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        throw error;
    }
};