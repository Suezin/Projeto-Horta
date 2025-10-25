# HortaStats - Sistema de Estatísticas de Desenvolvimento de Horta

Um site completo para monitoramento e análise de desenvolvimento de hortas através de imagens, com sistema de postagens e gerenciamento de usuários.

## 🌱 Funcionalidades

### Para Usuários
- **Visualização de Estatísticas**: Gráficos e métricas de desenvolvimento
- **Galeria de Imagens**: Feed de postagens com fotos das plantas
- **Análise de Crescimento**: Acompanhamento do progresso das plantas

### Para Administradores
- **Upload de Imagens**: Adicionar fotos das plantas
- **Dados Detalhados**: Informações sobre tipo, idade, altura, clima
- **Gerenciamento**: Editar e excluir postagens
- **Analytics**: Estatísticas avançadas e relatórios

## 🚀 Como Usar

### **✅ FUNCIONA AGORA - Sem Configuração**

O sistema já está **100% funcional** com dados de exemplo!

#### **1. Usar Imediatamente**
- Abra `index.html` - **Dados carregados automaticamente**
- Abra `admin.html` - Login: `admin` / `admin123`
- ✅ **Todas as funcionalidades funcionando**

#### **2. Dados Incluídos**
- **3 plantas de exemplo** (Tomate, Alface, Cenoura)
- **Estatísticas calculadas** automaticamente
- **Gráficos interativos** funcionando
- **Upload de imagens** ativo

## 📊 Estatísticas Geradas

O sistema analisa e gera automaticamente:

- **Taxa de Crescimento**: Percentual de crescimento da planta
- **Score de Saúde**: Avaliação da saúde da planta (0-100%)
- **Contagem de Folhas**: Número estimado de folhas
- **Altura**: Altura em centímetros
- **Intensidade de Cor**: Análise da cor e vitalidade

## 🎨 Design e Interface

- **Design Responsivo**: Funciona em desktop, tablet e mobile
- **Interface Moderna**: Design limpo e intuitivo
- **Tema Verde**: Cores inspiradas na natureza
- **Animações Suaves**: Transições e efeitos visuais

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilização moderna com Flexbox e Grid
- **JavaScript**: Funcionalidades interativas
- **Font Awesome**: Ícones
- **Chart.js**: Gráficos interativos
- **LocalStorage**: Persistência de dados

## 📱 Responsividade

O site é totalmente responsivo e se adapta a:
- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout otimizado para telas médias
- **Mobile**: Interface simplificada para smartphones

## 🛠️ Personalização

### Adicionando Novos Tipos de Plantas
Edite o arquivo `admin.html` na seção de upload:
```html
<input type="text" id="plantType" placeholder="Ex: Tomate, Alface, Cenoura...">
```

### Modificando Cores do Tema
Edite o arquivo `styles.css`:
```css
:root {
    --primary-color: #4a7c59;
    --secondary-color: #2c5530;
    --accent-color: #90ee90;
}
```

## 🔒 Segurança

- Sistema de autenticação implementado
- Validação de tipos de arquivo para upload
- Sanitização de dados de entrada
- Controle de acesso por níveis de usuário

## 📝 Notas Importantes

- Os dados são armazenados no navegador (localStorage)
- Sistema funciona offline
- Dados de exemplo incluídos automaticamente
- Sistema de autenticação funcional

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique se todos os arquivos estão na mesma pasta
2. Certifique-se de que o JavaScript está habilitado
3. Teste em diferentes navegadores
4. Verifique o console do navegador para erros

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais e comerciais.

---

**HortaStats** - Transformando o monitoramento de hortas em uma experiência digital moderna! 🌱📊