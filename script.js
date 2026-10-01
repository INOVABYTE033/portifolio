// Aguarda todo o HTML carregar antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');

    // Controla a cor do menu ao rolar a página
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});

// 1. Conexão com o Supabase
const SUPABASE_URL = 'https://zivdjnfypxjogmwmzfxl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0jUu47RgkVa2OyeAUREF2w_gY2yHPyr';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Função para testar a conexão buscando dados da tabela 'usuario'
async function testarConexao() {
    try {
        const { data, error } = await _supabase.from('usuario').select('*');
        
        if (error) {
            console.error('❌ Erro ao conectar com o Supabase:', error.message);
        } else {
            console.log('✅ Conectado com sucesso ao Supabase!');
            console.log('Dados da tabela usuario:', data);
        }
    } catch (err) {
        console.error('❌ Erro de conexão:', err);
    }
}

// Executa o teste assim que a página abrir
testarConexao();

// ==========================================
// FUNÇÕES DA ÁREA ADMIN (LOGIN E DASHBOARD)
// ==========================================

// Função de Login consultando diretamente a tabela 'usuario'
async function fazerLogin() {
    const emailInput = document.getElementById('email-login').value;
    const senhaInput = document.getElementById('senha-login').value;
    const mensagem = document.getElementById('mensagem-erro');

    try {
        // Busca na tabela 'usuario' se existe alguém com esse e-mail e senha
        const { data, error } = await _supabase
            .from('usuario')
            .select('*')
            .eq('e-mail', emailInput) // Nome da coluna exato que está na sua tabela
            .eq('senha', senhaInput)   // Nome da coluna exato que está na sua tabela
            .single();

        if (error || !data) {
            mensagem.innerText = 'Erro ao fazer login: E-mail ou senha incorretos.';
            return;
        }

        // Se encontrou o usuário na tabela, o login deu certo!
        console.log('✅ Login efetuado com sucesso:', data.nome);
        window.location.href = 'dashboard.html';

    } catch (err) {
        mensagem.innerText = 'Erro ao tentar fazer login.';
        console.error(err);
    }
} // <--- AQUI ESTÁ A CHAVETA QUE FALTAVA FECHAR A FUNÇÃO FAZERLOGIN!

// 2. Função para sair (Logout)
async function fazerLogout() {
    await _supabase.auth.signOut();
    window.location.href = 'login.html';
}

// 3. Função para adicionar Projeto no banco de dados
async function adicionarProjeto() {
    const nome = document.getElementById('titulo-projeto').value;
    const descricao = document.getElementById('descricao-projeto').value;
    const foto = document.getElementById('imagem-projeto').value;
    const link = document.getElementById('link-projeto').value;
    const status = document.getElementById('mensagem-status');

    if (!nome || !descricao || !foto || !link) {
        status.style.color = "red";
        status.innerText = "Por favor, preencha todos os campos!";
        return;
    }

    try {
        // Insere os dados na tabela 'projetos' usando os nomes corretos das colunas
        const { data, error } = await _supabase
            .from('projetos')
            .insert([
                { 
                    nome: nome, 
                    descricao: descricao, 
                    foto: foto, 
                    link: link 
                }
            ]);

        if (error) throw error;

        status.style.color = "#28a745"; // Verde
        status.innerText = "✅ Projeto adicionado com sucesso!";
        
        // Limpa os campos depois de salvar
        document.getElementById('titulo-projeto').value = '';
        document.getElementById('descricao-projeto').value = '';
        document.getElementById('imagem-projeto').value = '';
        document.getElementById('link-projeto').value = '';

    } catch (error) {
        status.style.color = "red";
        status.innerText = "❌ Erro ao adicionar projeto.";
        console.error(error.message);
    }
}
// Função para buscar e exibir os projetos do Supabase no portefólio
async function carregarProjetosPortefolio() {
    const container = document.getElementById('lista-projetos');
    
    // Se não encontrar o contentor na página atual, interrompe a execução para não dar erro
    if (!container) return; 

    try {
        // Busca os dados na tabela 'projetos' do Supabase ordenados por ID decrescente (mais recentes primeiro)
        const { data, error } = await _supabase
            .from('projetos')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        // Limpa o texto de "A carregar..."
        container.innerHTML = '';

        if (!data || data.length === 0) {
            container.innerHTML = '<p>Ainda não há projetos registados.</p>';
            return;
        }

        // Cria o HTML para cada projeto encontrado na base de dados
        data.forEach(projeto => {
            const card = document.createElement('div');
            card.classList.add('projeto-card'); // Pode estilizar esta classe no style.css

            card.innerHTML = `
                <img src="${projeto.foto}" alt="${projeto.nome}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                <h3>${projeto.nome}</h3>
                <p>${projeto.descricao}</p>
                <a href="${projeto.link}" target="_blank" class="btn-visitar">Ver Projeto</a>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error('Erro ao carregar os projetos:', err.message);
        container.innerHTML = '<p>Erro ao carregar os projetos no momento.</p>';
    }
}

// Executa a função assim que a página estiver totalmente carregada
document.addEventListener('DOMContentLoaded', () => {
    carregarProjetosPortefolio();
});