export interface Marcas {
    id: number;
    nome: string;   
    descricao: string;
}

const MarcasPage: Marcas[] = [
    { id: 1, nome: "Cerâmica", descricao: "Incesa, Portobello, Arielle, Tecnogres, Pamesa, Camelo Fior, Biancogrês, Pointer." },
    { id: 2, nome: "Porcelanato", descricao: "Portobello, Arielle, Tecnogres, Pamesa, Biancogrês, Elizabeth, Ceusa, Pointer, Villagres." },
    { id: 3, nome: "Laminado", descricao: "Eucatex, Durafloor ou Espaçofloor." }, 
    { id: 4, nome: "MEsquadria ", descricao: "Esaf, Alumasa, Atlantica, Ramassol ou Unicasa." },
    { id: 5, nome: "Ferragem", descricao: "Silvana, Stam, Arouca, Soprano, Aliança, Imab." },
    { id: 6, nome: "Inst. Elétrica", descricao: "Alumbra, Steck, Ilumi, Schneider, Margirius ou Fame." },
    { id: 7, nome: "Metal Sanitário", descricao: "Forusi, Deca, Celite, Fabrimar ou Docol." },
    { id: 8, nome: "Louças", descricao: "Celite, Deca, Incepa." },
    { id: 9, nome: "Porta (alumínio)", descricao: "Esaf, Mgm, Alumasa, Atlantica, Ramassol ou Unicasa." },
];

export default MarcasPage