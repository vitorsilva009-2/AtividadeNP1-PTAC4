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

        const resp = await fetch(`${API_URL}?_limit=15`, { signal: controle.signal });
        if (!resp.ok) throw new Error(`Erro HTTP: ${resp.status}`);

        const data = await resp.json();
        setIdeias(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setErro(err.message || 'Falha ao conectar com o servidor.');
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
        if (!resp.ok) throw new Error('Falha ao atualizar a ideia.');

        
        setIdeias(ideias.map(i => (i.id === idEmEdicao ? { ...i, title: titulo } : i)));
        setIdEmEdicao(null);
      } else {
        
        const resp = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 1,
            title: titulo,
            completed: false
          }),
        });
        if (!resp.ok) throw new Error('Falha ao cadastrar a nova ideia.');

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

  
  function iniciarEdicao(ideia) {
    setIdEmEdicao(ideia.id);
    setTitulo(ideia.title);
  }

  function cancelarEdicao() {
    setIdEmEdicao(null);
    setTitulo('');
  }

  
  async function excluirIdeia(id) {
    const listaAnterior = [...ideias];

    
    setIdeias(ideias.filter(i => i.id !== id));

    try {
      const resp = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!resp.ok) throw new Error('Falha ao excluir a ideia no servidor.');
    } catch (err) {
      
      alert(`Erro: ${err.message}. A ideia foi restaurada na lista.`);
      setIdeias(listaAnterior);
    }
  }

  
  async function toggleStatus(ideia) {
    const novoStatus = !ideia.completed;

    
    setIdeias(ideias.map(i => (i.id === ideia.id ? { ...i, completed: novoStatus } : i)));

    try {
      const resp = await fetch(`${API_URL}/${ideia.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ideia,
          completed: novoStatus
        }),
      });
      if (!resp.ok) throw new Error('Falha ao alterar o status da ideia.');
    } catch (err) {
      // Rollback do status em caso de falha na API
      alert(`Erro: ${err.message}`);
      setIdeias(ideias.map(i => (i.id === ideia.id ? { ...i, completed: ideia.completed } : i)));
    }
  }

  
  if (carregando) return <p>Carregando ideias...</p>;
  if (erro) return <p>Erro ao carregar dados: {erro}</p>;

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
          <button type="button" onClick={cancelarEdicao}>
            Cancelar
          </button>
        )}
      </form>

      
      {ideias.length === 0 ? (
        <p>Nenhuma ideia por aqui — que tal cadastrar a primeira?</p>
      ) : (
       
        <ul>
          {ideias.map((ideia) => (
            <li key={ideia.id}>
              <div>
                <strong>{ideia.title}</strong>
                <p>Status: {ideia.completed ? 'Executada' : 'Pendente'}</p>
              </div>
              <div>
               
                <button onClick={() => toggleStatus(ideia)}>
                  {ideia.completed ? 'Marcar como Pendente' : 'Marcar como Executada'}
                </button>
                
                <button onClick={() => iniciarEdicao(ideia)}>Editar</button>
                
                <button onClick={() => excluirIdeia(ideia.id)}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}