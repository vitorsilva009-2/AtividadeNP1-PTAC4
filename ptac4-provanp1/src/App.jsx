import { useState, useEffect } from 'react';

export default function App() {
 
  const [ideias, setIdeias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

 
  const [titulo, setTitulo] = useState('');
  const [idEmEdicao, setIdEmEdicao] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const API_URL = 'https://jsonplaceholder.typicode.com/todos';

  
  useEffect(() => {
    const controle = new AbortController();

    async function buscarIdeias() {
      try {
        setCarregando(true);
        setErro(null);

        const resp = await fetch(`${API_URL}?_limit=10`, { signal: controle.signal });
        if (!resp.ok) throw new Error(`Erro HTTP: ${resp.status}`);

        const data = await resp.json();
        setIdeias(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setErro(err.message);
        }
      } finally {
        setCarregando(false);
      }
    }

    buscarIdeias();

    return () => controle.abort();
  }, []);

  
  async function handleSubmit(e) {
    e.preventDefault();
    if (!titulo.trim()) return;

    setEnviando(true);

    try {
      if (idEmEdicao) {
       
        const resp = await fetch(`${API_URL}/${idEmEdicao}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titulo,
            completed: false,
            userId: 1
          }),
        });
        if (!resp.ok) throw new Error('Falha ao atualizar ideia');

        setIdeias(ideias.map(i => (i.id === idEmEdicao ? { ...i, title: titulo } : i)));
        setIdEmEdicao(null);
      } else {
       
        const resp = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: titulo,
            completed: false,
            userId: 1
          }),
        });
        if (!resp.ok) throw new Error('Falha ao cadastrar ideia');

        const novaIdeia = await resp.json();
        setIdeias([{ ...novaIdeia, id: Date.now() }, ...ideias]);
      }

      setTitulo('');
    } catch (err) {
      alert(err.message);
    } finally {
      setEnviando(false);
    }
  }

  
  async function toggleConcluido(ideia) {
    try {
      const resp = await fetch(`${API_URL}/${ideia.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ideia,
          completed: !ideia.completed
        }),
      });
      if (!resp.ok) throw new Error('Falha ao alterar status da ideia');

      setIdeias(ideias.map(i => (i.id === ideia.id ? { ...i, completed: !i.completed } : i)));
    } catch (err) {
      alert(err.message);
    }
  }

 
  function iniciarEdicao(ideia) {
    setIdEmEdicao(ideia.id);
    setTitulo(ideia.title);
  }

 
  async function excluirIdeia(id) {
    try {
      const resp = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!resp.ok) throw new Error('Falha ao excluir ideia');

      setIdeias(ideias.filter(i => i.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  if (carregando) return <p>Carregando ideias...</p>;
  if (erro) return <p>Erro: {erro}</p>;

  return (
    <div>
      <h1>Avaliação Vitor HUgo - PTAS 4</h1>

      
      <form onSubmit={handleSubmit}>
        <h3>{idEmEdicao ? 'Editar Ideia' : 'Nova Ideia'}</h3>
        <input
          type="text"
          placeholder="Digite o título da ideia..."
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={enviando}
        />
        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : idEmEdicao ? 'Salvar' : 'Adicionar'}
        </button>
        {idEmEdicao && (
          <button
            type="button"
            onClick={() => { setIdEmEdicao(null); setTitulo(''); }}
          >
            Cancelar
          </button>
        )}
      </form>

      {/* Exibição do estado vazio ou da lista */}
      {ideias.length === 0 ? (
        <p>Nenhuma ideia encontrada.</p>
      ) : (
        <ul>
          {ideias.map((i) => (
            <li key={i.id}>
              <div>
                <input
                  type="checkbox"
                  checked={i.completed}
                  onChange={() => toggleConcluido(i)}
                />
                <span>
                  {i.title}
                </span>
              </div>
              <div>
                <button onClick={() => iniciarEdicao(i)}>Editar</button>
                <button onClick={() => excluirIdeia(i.id)}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}