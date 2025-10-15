import type { NextApiRequest, NextApiResponse } from 'next';
import { createConnection } from '../../lib/dbConnection';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id, usuario, numero, email, senha } = req.body;
  try {
    const conn = await createConnection();
    const [result] = await conn.execute(
      'INSERT INTO temporarios (id, usuario, numero, email, senha) VALUES (?, ?, ?, ?, ?)',
      [id, usuario, numero, email, senha]
    );
    await conn.end();
    res.status(200).json({ ok: true, result });
  } catch (e) {
    console.error('Erro ao inserir no banco:', e);
    res.status(500).json({ error: 'Erro ao inserir no banco', details: String(e) });
  }
}