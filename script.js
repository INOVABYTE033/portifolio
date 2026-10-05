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

    // ==========================================
    // MOTOR DE PARTÍCULAS INTERATIVAS (FUNDO VIVO)
    // ==========================================
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.floor(width / 30);

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 1.8 + 0.5
        });
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';

        particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            // Conectar partículas vizinhas
            for (let j = index + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ==========================================
    // EFEITO SPOTLIGHT NOS CARDS (SEGUE O RATO)
    // ==========================================
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.projeto-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
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
        }
    } catch (err) {
        console.error('❌ Erro de conexão:', err);
    }
}

testarConexao();

// ==========================================
// FUNÇÕES DA ÁREA ADMIN (LOGIN E DASHBOARD)
// ==========================================

async function fazerLogin() {
    const emailInput = document.getElementById('email-login').value;
    const senhaInput = document.getElementById('senha-login').value;
    const mensagem = document.getElementById('mensagem-erro');

    try {
        const { data, error } = await _supabase
            .from('usuario')
            .select('*')
            .eq('e-mail', emailInput)
            .eq('senha', senhaInput)
            .single();

        if (error || !data) {
            mensagem.innerText = 'Erro ao fazer login: E-mail ou senha incorretos.';
            return;
        }

        console.log('✅ Login efetuado com sucesso:', data.nome);
        window.location.href = 'dashboard.html';

    } catch (err) {
        mensagem.innerText = 'Erro ao tentar fazer login.';
        console.error(err);
    }
}

async function fazerLogout() {
    await _supabase.auth.signOut();
    window.location.href = 'login.html';
}

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

        status.style.color = "#28a745";
        status.innerText = "✅ Projeto adicionado com sucesso!";
        
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

async function carregarProjetosPortefolio() {
    const container = document.getElementById('lista-projetos');
    
    if (!container) return; 

    try {
        const { data, error } = await _supabase
            .from('projetos')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;

        container.innerHTML = '';

        if (!data || data.length === 0) {
            container.innerHTML = '<p>Ainda não há projetos registados.</p>';
            return;
        }

        data.forEach(projeto => {
            const card = document.createElement('div');
            card.classList.add('projeto-card');

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

document.addEventListener('DOMContentLoaded', () => {
    carregarProjetosPortefolio();
});