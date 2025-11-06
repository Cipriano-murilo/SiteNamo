document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000';

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.getElementById('nameInput').value;
      const email = document.getElementById('emailInput').value;
      try {
        const response = await fetch(`${API_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email }),
        });
        if (response.ok) {
          localStorage.setItem('currentUserEmail', email);
          window.location.href = 'principal.html';
        } else {
          alert('Erro ao fazer login.');
        }
      } catch (error) {
        console.error('Erro de conexão no login:', error);
        alert('Não foi possível conectar ao servidor.');
      }
    });
  }

  const cronometroElement = document.getElementById('cronometro');
  if (cronometroElement) {
    const dataInicio = new Date('2025-03-08T00:00:00');
    const atualizarCronometro = () => {
      const agora = new Date();
      if (agora < dataInicio) {
        cronometroElement.innerHTML = "Nossa contagem começará em breve...";
        return;
      }
      let anos = agora.getFullYear() - dataInicio.getFullYear();
      let meses = agora.getMonth() - dataInicio.getMonth();
      let dias = agora.getDate() - dataInicio.getDate();
      if (dias < 0) {
        meses--;
        dias += new Date(agora.getFullYear(), agora.getMonth(), 0).getDate();
      }
      if (meses < 0) {
        anos--;
        meses += 12;
      }
      const textoAnos = anos === 1 ? 'ano' : 'anos';
      const textoMeses = meses === 1 ? 'mês' : 'meses';
      const textoDias = dias === 1 ? 'dia' : 'dias';
      cronometroElement.innerHTML = `${anos} ${textoAnos}, ${meses} ${textoMeses} e ${dias} ${textoDias}`;
    };
    atualizarCronometro();
    setInterval(atualizarCronometro, 1000 * 60 * 60 * 24);
  }

  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) {
    const modalImage = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');
    const closeButton = document.querySelector('.modal-close');
    const galleryImages = document.querySelectorAll('.container-fotos img');
    galleryImages.forEach(image => {
      image.addEventListener('click', () => {
        modalContainer.classList.add('show');
        modalImage.src = image.src;
        modalCaption.textContent = image.dataset.caption;
      });
    });
    const closeModal = () => modalContainer.classList.remove('show');
    closeButton.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (event) => {
      if (event.target === modalContainer) closeModal();
    });
  }

  const messageFormButton = document.querySelector('.mensagens button');
  if (messageFormButton) {
    const messageTextarea = document.querySelector('.mensagens textarea');
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'messages-list';
    const formContainer = document.querySelector('.container-form');
    formContainer.parentNode.insertBefore(messagesContainer, formContainer.nextSibling);

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/api/messages`);
        const messages = await response.json();
        messagesContainer.innerHTML = '';
        messages.forEach(msg => {
          const messageElement = document.createElement('div');
          messageElement.className = 'message-item';
          
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-btn';
          deleteBtn.innerHTML = '&times;';
          deleteBtn.dataset.id = msg.id;
          deleteBtn.id = "deletButton";

          const content = document.createElement('p');
          content.textContent = msg.content;
          
          const date = document.createElement('span');
          date.textContent = new Date(msg.created_at).toLocaleString('pt-BR');
          
          messageElement.appendChild(deleteBtn);
          messageElement.appendChild(content);
          messageElement.appendChild(date);
          messagesContainer.appendChild(messageElement);
        });
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        messagesContainer.innerHTML = '<p>Não foi possível carregar as mensagens. O back-end está rodando?</p>';
      }
    };

    const postMessage = async (content) => {
      const userEmail = localStorage.getItem('currentUserEmail');
      if (!userEmail) {
        alert('Erro: usuário não identificado. Por favor, faça login novamente.');
        window.location.href = 'index.html';
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, userEmail }),
        });
        if (response.ok) {
          messageTextarea.value = '';
          fetchMessages();
        } else {
          alert('Erro ao enviar a mensagem.');
        }
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        alert('Erro de conexão ao enviar a mensagem.');
      }
    };

    messageFormButton.addEventListener('click', () => {
      const content = messageTextarea.value.trim();
      if (content) {
        postMessage(content);
      }
    });

    messagesContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const messageId = event.target.dataset.id;
            try {
                const response = await fetch(`${API_URL}/api/messages/${messageId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    fetchMessages();
                } else {
                    alert('Erro ao deletar a mensagem.');
                }
            } catch (error) {
                console.error('Erro de conexão ao deletar:', error);
                alert('Erro de conexão ao deletar a mensagem.');
            }           
        }
    });
    fetchMessages();
  }
});