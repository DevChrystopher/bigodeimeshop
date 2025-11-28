document.addEventListener('DOMContentLoaded', () => {
    // 1. Variáveis Globais (usadas por todas as funções)
    const filtrosContainer = document.getElementById('painel-filtros');
    const inputBusca = document.getElementById('barra-pesquisa'); // Adicionei a barra aqui
    const produtos = document.querySelectorAll('#grade-afiliado .afiliado');
    const botoesPreco = document.querySelectorAll('.grupo-precos button');

    if (!filtrosContainer || !inputBusca) return;

    // ===========================================
    // FUNÇÕES DE UTILIDADE
    // ===========================================

    /**
     * Extrai, limpa e retorna o menor preço numérico do cartão.
     */
    function obterMenorPrecoNumerico(produto) {
        let menorPreco = Infinity;
        const precoSpans = produto.querySelectorAll('.preco-valor');
        
        precoSpans.forEach(span => {
            const precoTexto = span.textContent || span.innerText;
            
            // Lógica de limpeza:
            const precoLimpo = precoTexto
                .replace(/[^\d,\.]/g, '') 
                .replace(/\./g, '')       
                .replace(/,/g, '.')       
                .trim();
            
            const precoNumerico = parseFloat(precoLimpo);

            if (!isNaN(precoNumerico) && precoNumerico < menorPreco) {
                menorPreco = precoNumerico;
            }
        });

        return menorPreco === Infinity ? 0 : menorPreco;
    }


    // ===========================================
    // FUNÇÃO PRINCIPAL DE FILTRAGEM
    // ===========================================

    function aplicarFiltros() {
        // --- COLETA DE DADOS ---

        // 1. Termo de Busca (Texto)
        const termoBusca = inputBusca.value.toLowerCase().trim();

        // 2. Filtros de Categoria (Tags)
        const filtrosCategoriaAtivos = Array.from(
            document.querySelectorAll('#painel-filtros input[type="checkbox"]:checked')
        ).map(checkbox => checkbox.dataset.filtro);

        // 3. Filtro de Preço (Range)
        const botaoPrecoAtivo = document.querySelector('.grupo-precos button.active-price');
        let rangePrecoAtivo = null;

        if (botaoPrecoAtivo) {
            rangePrecoAtivo = botaoPrecoAtivo.dataset.range;
        }

        // --- APLICAR FILTROS EM CADA PRODUTO ---

        produtos.forEach(produto => {
            const categoriaProduto = produto.dataset.categoria ? 
                                       produto.dataset.categoria.split(',').map(c => c.trim()) : 
                                       [];
            const tituloProduto = produto.querySelector('h3') ? produto.querySelector('h3').innerText.toLowerCase() : '';
            const precoProduto = obterMenorPrecoNumerico(produto);

            let passaFiltroTexto = false;
            let passaFiltroCategoria = false;
            let passaFiltroPreco = false;

            // 1. LÓGICA DE FILTRAGEM DE TEXTO
            if (termoBusca === '' || tituloProduto.includes(termoBusca)) {
                passaFiltroTexto = true;
            }

            // 2. LÓGICA DE FILTRAGEM DE CATEGORIA
            if (filtrosCategoriaAtivos.length === 0) {
                passaFiltroCategoria = true;
            } else {
                passaFiltroCategoria = filtrosCategoriaAtivos.some(filtro => categoriaProduto.includes(filtro));
            }

            // 3. LÓGICA DE FILTRAGEM DE PREÇO
            if (!rangePrecoAtivo) {
                passaFiltroPreco = true; 
            } else {
                const [minStr, maxStr] = rangePrecoAtivo.split('-');
                const min = parseFloat(minStr);
                const max = maxStr === 'max' ? Infinity : parseFloat(maxStr);

                if (precoProduto >= min && precoProduto < max) {
                    passaFiltroPreco = true;
                }
            }

            // DECISÃO FINAL: Mostrar SOMENTE se passar em TODOS os filtros
            const deveMostrar = passaFiltroTexto && passaFiltroCategoria && passaFiltroPreco;

            if (deveMostrar) {
                // Use 'flex' para o layout dos cards
                produto.style.display = 'flex'; 
            } else {
                produto.style.display = 'none';
            }
        });
    }

    // ===========================================
    // ESCUTADORES DE EVENTOS
    // ===========================================

    // 1. Busca por Texto: Chama a função principal a cada digitação
    inputBusca.addEventListener('keyup', aplicarFiltros);

    // 2. Filtros de Categoria: Chama a função principal a cada mudança de checkbox
    filtrosContainer.addEventListener('change', aplicarFiltros);
    
    // 3. Filtros de Preço: Os cliques chamam aplicarFiltros (definido acima)

    // ESCUTADOR FALTANDO: Adiciona o evento de clique a cada botão de preço
botoesPreco.forEach(botao => {
    botao.addEventListener('click', function() {
        // Lógica para seleção única de preço:
        const jaAtivo = this.classList.contains('active-price');
        
        // Remove a classe ativa de TODOS os botões
        botoesPreco.forEach(b => b.classList.remove('active-price'));
        
        // Se o botão não estava ativo, ative-o (só desativa se já estava ativo)
        if (!jaAtivo) {
            this.classList.add('active-price');
        }
        
        // Re-aplica a filtragem
        aplicarFiltros();
    });
});

    // Inicia a aplicação dos filtros ao carregar a página (mostra todos por padrão)
    aplicarFiltros(); 
});