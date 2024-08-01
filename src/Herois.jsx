import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CSSTransition } from 'react-transition-group';
import './Herois.css';

const letrasAlfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const Herois = () => {
    const [herois, setHerois] = useState([]);
    const [consulta, setConsulta] = useState('');
    const [heroisFiltrados, setHeroisFiltrados] = useState([]);
    const [heroisSelecionados, setHeroisSelecionados] = useState([]);
    const [vencedor, setVencedor] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    const heroiRefs = useRef({}); // Referências para os elementos dos heróis

    useEffect(() => {
        const buscarHerois = async () => {
            try {
                const resposta = await axios.get('https://homologacao3.azapfy.com.br/api/ps/metahumans');
                setHerois(resposta.data);
                setHeroisFiltrados(resposta.data);
            } catch (erro) {
                console.error('Erro ao carregar dados da API:', erro);
            }
        };

        buscarHerois();
    }, []);

    useEffect(() => {
        setHeroisFiltrados(
            herois.filter(hero =>
                hero.name.toLowerCase().includes(consulta.toLowerCase())
            )
        );
    }, [consulta, herois]);

    useEffect(() => {
        // Rolagem para o primeiro herói que começa com a letra
        if (consulta) {
            const heroiInicial = heroisFiltrados.find(heroi =>
                heroi.name.toLowerCase().startsWith(consulta.toLowerCase())
            );
            if (heroiInicial && heroiRefs.current[heroiInicial.id]) {
                heroiRefs.current[heroiInicial.id].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [consulta, heroisFiltrados]);

    const selecionarHeroi = (heroi) => {
        if (heroisSelecionados.includes(heroi)) {
            setHeroisSelecionados(heroisSelecionados.filter(selecionado => selecionado !== heroi));
        } else if (heroisSelecionados.length < 2) {
            setHeroisSelecionados([...heroisSelecionados, heroi]);
        }
        setMostrarModal(true); // Abre o modal ao selecionar um herói
    };

    const limparSelecao = () => {
        setHeroisSelecionados([]);
        setVencedor(null); // Limpa o vencedor quando a seleção é limpa
    };

    const calcularTotalEstatisticas = (estatisticas) => {
        const { intelligence, strength, speed, durability, power, combat } = estatisticas;
        return intelligence + strength + speed + durability + power + combat;
    };

    const lutar = () => {
        if (heroisSelecionados.length === 2) {
            const [heroi1, heroi2] = heroisSelecionados;
            const totalEstatisticas1 = calcularTotalEstatisticas(heroi1.powerstats);
            const totalEstatisticas2 = calcularTotalEstatisticas(heroi2.powerstats);
            const vencedor = totalEstatisticas1 > totalEstatisticas2 ? heroi1 : heroi2;
            setVencedor(vencedor);
            setHeroisSelecionados([]); // Limpa os heróis selecionados após a luta
        }
    };

    const fecharModal = () => {
        setMostrarModal(false);
        setHeroisSelecionados([]); // Limpa a seleção quando o modal é fechado
        setVencedor(null); // Limpa o vencedor quando o modal é fechado
    };

    const filtrarPorLetra = (letra) => {
        setConsulta(letra);
    };

    return (
        <div className="herois-container">
            <div className="barra-alfabeto">
                {letrasAlfabeto.map(letra => (
                    <button
                        key={letra}
                        onClick={() => filtrarPorLetra(letra)}
                        className="botao-letra"
                    >
                        {letra}
                    </button>
                ))}
            </div>
            <input
                type="text"
                placeholder="Pesquisar Super-Heróis..."
                value={consulta}
                onChange={e => setConsulta(e.target.value)}
                className="barra-pesquisa"
            />
            <div className="herois-grid">
                {heroisFiltrados.map(heroi => (
                    <div
                        key={heroi.id}
                        ref={el => heroiRefs.current[heroi.id] = el} // Salva referência do elemento
                        className={`heroi-item ${heroisSelecionados.includes(heroi) ? 'selecionado' : ''}`}
                        onClick={() => selecionarHeroi(heroi)}
                    >
                        <img
                            src={heroi.images.md}
                            alt={heroi.name}
                            className="heroi-imagem"
                        />
                        <h3 className="heroi-nome">{heroi.name}</h3>
                    </div>
                ))}
            </div>
            <CSSTransition
                in={mostrarModal}
                timeout={300}
                classNames="modal"
                unmountOnExit
            >
                <div className="modal-canto">
                    <div className="modal-conteudo">
                        {heroisSelecionados.length > 0 && (
                            <>
                                <h2>Heróis Selecionados</h2>
                                <div className="modal-herois">
                                    {heroisSelecionados.map(heroi => (
                                        <div key={heroi.id} className="modal-heroi-item">
                                            <img src={heroi.images.md} alt={heroi.name} className="modal-heroi-imagem" />
                                            <h3>{heroi.name}</h3>
                                        </div>
                                    ))}
                                </div>
                                {heroisSelecionados.length === 2 && (
                                    <>
                                        <button onClick={lutar} className="botao-lutar">
                                            Lutar!
                                        </button>
                                        <button onClick={limparSelecao} className="botao-limpar">
                                            Limpar Seleção
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                        {vencedor && (
                            <div className="vencedor">
                                <h2>Vencedor: {vencedor.name}</h2>
                                <img src={vencedor.images.md} alt={vencedor.name} className="imagem-vencedor" />
                            </div>
                        )}
                        <button onClick={fecharModal} className="botao-fechar-modal">
                            Fechar
                        </button>
                    </div>
                </div>
            </CSSTransition>
        </div>
    );
};

export default Herois;
