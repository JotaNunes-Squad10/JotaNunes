'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';

interface FormCabecalhoProps {
    empreendimentoId: string | number | null;
    nome: string;
    localizacao: string;
    descricao: string;
    padrao: string | number | null;
    onNomeChange: (value: string) => void;
    onLocalizacaoChange: (value: string) => void;
    onDescricaoChange: (value: string) => void;
    onPadraoChange: (value: string) => void;
}

const FormCabecalho = memo(function FormCabecalho({
    empreendimentoId,
    nome,
    localizacao,
    descricao,
    padrao,
    onNomeChange,
    onLocalizacaoChange,
    onDescricaoChange,
    onPadraoChange,
}: FormCabecalhoProps) {
    const [localNome, setLocalNome] = useState(nome);
    const [localLocalizacao, setLocalLocalizacao] = useState(localizacao);
    const [localDescricao, setLocalDescricao] = useState(descricao);
    
    const lastEmpreendimentoIdRef = useRef<string | number | null>(null);

    useEffect(() => {
        if (empreendimentoId !== lastEmpreendimentoIdRef.current) {
            lastEmpreendimentoIdRef.current = empreendimentoId;
            setLocalNome(nome);
            setLocalLocalizacao(localizacao);
            setLocalDescricao(descricao);
        }
    }, [empreendimentoId, nome, localizacao, descricao]);

    return (
        <div className="flex flex-col gap-3">
            <div>
                <label className="block text-sm font-medium">Nome do empreendimento</label>
                <input
                    type="text"
                    value={localNome}
                    onChange={(e) => setLocalNome(e.target.value)}
                    onBlur={() => onNomeChange(localNome)}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Localização</label>
                <input
                    type="text"
                    value={localLocalizacao}
                    onChange={(e) => setLocalLocalizacao(e.target.value)}
                    onBlur={() => onLocalizacaoChange(localLocalizacao)}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Alterar padrão</label>
                <Dropdown
                    value={padrao ?? ''}
                    options={[
                        { label: 'Residence', value: 'Residence' },
                        { label: 'Mais Viver', value: 'Mais Viver' },
                        { label: 'Vida Bela', value: 'Vida Bela' },
                    ]}
                    optionLabel="label"
                    optionValue="value"
                    onChange={(e: DropdownChangeEvent) => onPadraoChange(e.value)}
                    placeholder="Selecione um padrão"
                    className="w-full"
                />
            </div>
            <div>
                <label className="block font-semibold">Descrição</label>
                <textarea
                    value={localDescricao}
                    onChange={(e) => setLocalDescricao(e.target.value)}
                    onBlur={() => onDescricaoChange(localDescricao)}
                    className="w-full p-2 border rounded h-28"
                />
            </div>
        </div>
    );
});

export default FormCabecalho;
