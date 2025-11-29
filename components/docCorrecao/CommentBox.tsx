import React, { useState, useEffect } from 'react';

interface CommentBoxProps {
    position: { top: number; left: number };
    initialComment: string;
    onSave: (comment: string) => Promise<void>;
    onDelete: () => Promise<void>;
    onClose: () => void;
    hasExistingComment: boolean;
}

const CommentBox: React.FC<CommentBoxProps> = ({ 
    position, 
    initialComment, 
    onSave, 
    onDelete, 
    onClose,
    hasExistingComment 
}) => {
    const [comment, setComment] = useState(initialComment);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setComment(initialComment);
    }, [initialComment]);

    const handleSave = async () => {
        if (comment.trim().length === 0) return;
        setIsSaving(true);
        try {
            await onSave(comment);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsSaving(true);
        try {
            await onDelete();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: position.top, left: position.left, width: 340, zIndex: 9999 }}>
            <div className="bg-white border rounded shadow-lg p-3 text-sm">
                <label className="block text-xs font-semibold mb-1">Comentário</label>
                <textarea
                    autoFocus
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full h-28 p-2 border rounded text-sm resize-none"
                    placeholder="Digite seu comentário aqui..."
                    disabled={isSaving}
                />
                <div className="mt-2 flex justify-end gap-2">
                    <button 
                        onClick={onClose} 
                        className="px-3 py-1 text-sm rounded hover:bg-gray-400 bg-gray-300"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleDelete} 
                        disabled={!hasExistingComment || isSaving} 
                        className="px-3 py-1 text-sm rounded hover:bg-red-600 bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Excluir
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={comment.trim().length === 0 || isSaving} 
                        className="px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CommentBox);
