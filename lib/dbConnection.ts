import mysql from 'mysql2/promise';

// Função para criar conexão com o banco de dados MySQL
export const createConnection = async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'srv1066.hstgr.io',
            user: 'u515524061_jotanunes',
            password: 'JotaNunes2026',
            database: 'u515524061_jotanunes',
            port: 3306
        });
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        return connection;
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        throw error;
    }
};