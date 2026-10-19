// ==========================================
// INICIALIZAÇÃO E EFEITOS VISUAIS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');

    // Controla a cor do menu ao rolar a página
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            if (header) header.classList.add('scrolled');
        } else {
            if (header) header.classList.remove('scrolled');
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

    // Carregar projetos ao iniciar a página do portfólio
    carregarProjetosPortefolio();

    // Inicializar o evento do formulário de contato/leads
    inicializarFormularioLeads();

    // Carregar os leads caso esteja na página do Dashboard
    carregarLeadsDashboard();
});

// ==========================================
// CONEXÃO COM O SUPABASE
// ==========================================
const SUPABASE_URL = 'https://zivdjnfypxjogmwmzfxl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0jUu47RgkVa2OyeAUREF2w_gY2yHPyr';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para testar a conexão buscando dados da tabela 'usuario'
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
// CAPTURA E ENVIO DE LEADS (CONTATO)
// ==========================================
function inicializarFormularioLeads() {
    const leadForm = document.getElementById('leadForm');

    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const telefone = document.getElementById('telefone')?.value.trim() || '';
            const mensagem = document.getElementById('mensagem')?.value.trim() || '';

            mostrarToast('A enviar mensagem...', 'info');

            try {
                // Inserção na tabela 'leads' no Supabase
                const { data, error } = await _supabase
                    .from('leads')
                    .insert([
                        { 
                            nome: nome, 
                            email: email, 
                            telefone: telefone, 
                            mensagem: mensagem 
                        }
                    ]);

                if (error) {
                    console.error('❌ Erro detalhado do Supabase:', error);
                    mostrarToast(`Erro: ${error.message}`, 'error');
                    return;
                }

                mostrarToast('Mensagem enviada com sucesso!', 'success');
                leadForm.reset();

            } catch (err) {
                console.error('❌ Erro ao enviar lead:', err);
                mostrarToast('Erro ao enviar mensagem. Tente novamente!', 'error');
            }
        });
    }
}

// ==========================================
// CARREGAR LEADS NO DASHBOARD (COM BOTÃO DO GMAIL)
// ==========================================
async function carregarLeadsDashboard() {
    const containerLeads = document.getElementById('lista-leads');
    
    // Se a tabela não existir nesta página, cancela
    if (!containerLeads) return;

    try {
        const { data, error } = await _supabase
            .from('leads')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error('❌ Erro ao buscar leads:', error.message);
            containerLeads.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #ff6b6b;">Erro ao carregar mensagens: ${error.message}</td></tr>`;
            return;
        }

        containerLeads.innerHTML = '';

        if (!data || data.length === 0) {
            containerLeads.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #aaa;">Nenhuma mensagem recebida ainda.</td></tr>';
            return;
        }

        data.forEach(lead => {
            const dataFormatada = lead.created_at 
                ? new Date(lead.created_at).toLocaleString('pt-BR') 
                : '-';

            // Link para abrir o Gmail diretamente na aba de composição
            const emailDestinatario = encodeURIComponent(lead.email || '');
            const assunto = encodeURIComponent(`Resposta ao seu contato - Portfólio Enzo Alves`);
            const corpo = encodeURIComponent(`Olá ${lead.nome || ''},\n\nRecebi a sua mensagem enviada através do portfólio:\n"${lead.mensagem || ''}"\n\n---`);
            
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailDestinatario}&su=${assunto}&body=${corpo}`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dataFormatada}</td>
                <td><strong>${lead.nome || '-'}</strong></td>
                <td><a href="mailto:${lead.email}" style="color: #4da6ff;">${lead.email || '-'}</a></td>
                <td>${lead.telefone || '-'}</td>
                <td>${lead.mensagem || '-'}</td>
                <td>
                    <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" style="padding: 6px 12px; background: #ea4335; color: #ffffff; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 0.85rem; display: inline-block; white-space: nowrap;">
                        📧 Responder no Gmail
                    </a>
                </td>
            `;
            containerLeads.appendChild(tr);
        });

    } catch (err) {
        console.error('❌ Erro geral ao carregar leads:', err);
        containerLeads.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ff6b6b;">Erro ao carregar mensagens.</td></tr>';
    }
}

// ==========================================
// FUNÇÃO DE NOTIFICAÇÃO TOAST
// ==========================================
function mostrarToast(mensagem, tipo = 'success') {
    let container = document.getElementById('toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.classList.add('toast', tipo);
    
    const icone = tipo === 'success' ? '✅' : (tipo === 'info' ? 'ℹ️' : '❌');
    toast.innerHTML = `<span>${icone}</span> <span>${mensagem}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

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
            if (mensagem) mensagem.innerText = 'Erro ao fazer login: E-mail ou senha incorretos.';
            mostrarToast('E-mail ou senha incorretos.', 'error');
            return;
        }

        mostrarToast(`Bem-vindo de volta, ${data.nome}!`, 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (err) {
        if (mensagem) mensagem.innerText = 'Erro ao tentar fazer login.';
        mostrarToast('Erro ao tentar fazer login.', 'error');
        console.error(err);
    }
}

async function fazerLogout() {
    await _supabase.auth.signOut();
    mostrarToast('Sessão terminada com sucesso.', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 800);
}

async function adicionarProjeto() {
    const nome = document.getElementById('titulo-projeto').value;
    const descricao = document.getElementById('descricao-projeto').value;
    const foto = document.getElementById('imagem-projeto').value;
    const link = document.getElementById('link-projeto').value;
    const status = document.getElementById('mensagem-status');

    if (!nome || !descricao || !foto || !link) {
        if (status) {
            status.style.color = "red";
            status.innerText = "Por favor, preencha todos os campos!";
        }
        mostrarToast("Preenche todos os campos do projeto!", "error");
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

        if (status) {
            status.style.color = "#28a745";
            status.innerText = "✅ Projeto adicionado com sucesso!";
        }
        
        mostrarToast("Projeto adicionado com sucesso!", "success");
        
        document.getElementById('titulo-projeto').value = '';
        document.getElementById('descricao-projeto').value = '';
        document.getElementById('imagem-projeto').value = '';
        document.getElementById('link-projeto').value = '';

    } catch (error) {
        if (status) {
            status.style.color = "red";
            status.innerText = "❌ Erro ao adicionar projeto.";
        }
        mostrarToast("Erro ao adicionar projeto no Supabase.", "error");
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

window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');
    
    if (splash) {
        const esconderSplash = () => {
            splash.classList.add('fade-out');
            setTimeout(() => splash.remove(), 500);
        };

        const timer = setTimeout(esconderSplash, 1800);

        splash.addEventListener('click', () => {
            clearTimeout(timer);
            esconderSplash();
        });
    }
});

function atualizarRelogioBanner() {
    const relogio = document.getElementById('relogio-banner');
    if (relogio) {
        const agora = new Date();
        relogio.textContent = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
}
setInterval(atualizarRelogioBanner, 1000);
atualizarRelogioBanner();