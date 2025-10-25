# 🗄️ Configuração do Banco de Dados - HortaStats

## ⚠️ **IMPORTANTE: Configuração Necessária**

Para que o sistema funcione com banco de dados real, você precisa configurar:

### 1. **Criar Banco de Dados Neon (PostgreSQL)**

1. **Acesse**: [console.neon.tech](https://console.neon.tech)
2. **Crie conta** gratuita
3. **Crie projeto**: `horta-stats`
4. **Copie a Connection String** (formato: `postgresql://user:pass@host:port/db`)

### 2. **Configurar Variáveis de Ambiente no Netlify**

Após fazer deploy no Netlify:

1. **Acesse**: [app.netlify.com](https://app.netlify.com)
2. **Vá em**: Site Settings > Environment Variables
3. **Adicione**:
   - `NETLIFY_DATABASE_URL` = `sua-connection-string-aqui`
   - `JWT_SECRET` = `sua-chave-secreta-aqui`

### 3. **Inicializar Banco de Dados**

Após configurar as variáveis, execute:

```bash
curl -X POST https://seudominio.netlify.app/.netlify/functions/db-setup
```

## 🔧 **Configuração Atual**

### **Banco de Dados**: Neon PostgreSQL
### **ORM**: @netlify/neon
### **Tabelas**:
- `posts` - Dados das plantas
- `images` - Imagens das plantas  
- `admin_users` - Usuários admin

## 📊 **Estrutura das Tabelas**

### **Tabela `posts`**:
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  plant_type VARCHAR(100) NOT NULL,
  plant_age VARCHAR(50),
  planting_date VARCHAR(50),
  height VARCHAR(50),
  weather VARCHAR(100),
  temperature VARCHAR(50),
  watering VARCHAR(100),
  fertilizer VARCHAR(100),
  pest_problems VARCHAR(100),
  notes TEXT,
  expected_harvest VARCHAR(50),
  growth_rate INTEGER DEFAULT 0,
  health_score INTEGER DEFAULT 0,
  leaf_count INTEGER DEFAULT 0,
  color_intensity INTEGER DEFAULT 0,
  author VARCHAR(100) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Tabela `images`**:
```sql
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  image_data BYTEA NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 **Deploy Steps**

### **1. Preparar Arquivos**
```bash
# Instalar dependências
npm install

# Verificar arquivos
ls -la netlify/functions/
```

### **2. Deploy no Netlify**
```bash
# Via CLI
netlify deploy --prod

# Ou via GitHub (recomendado)
# 1. Push para GitHub
# 2. Conectar repositório no Netlify
# 3. Deploy automático
```

### **3. Configurar Variáveis**
- `NETLIFY_DATABASE_URL` = Connection string do Neon
- `JWT_SECRET` = Chave secreta para JWT

### **4. Inicializar Banco**
```bash
curl -X POST https://seudominio.netlify.app/.netlify/functions/db-setup
```

## ✅ **Verificação**

### **Teste 1: API de Posts**
```bash
curl https://seudominio.netlify.app/.netlify/functions/posts
```

### **Teste 2: Criar Post**
```bash
curl -X POST https://seudominio.netlify.app/.netlify/functions/posts \
  -H "Content-Type: application/json" \
  -d '{"plantType":"Tomate","plantAge":"30","height":"25.5"}'
```

## 🔍 **Troubleshooting**

### **Erro: "Database not configured"**
- Verificar se `NETLIFY_DATABASE_URL` está configurada
- Verificar se a connection string está correta
- Verificar se o banco Neon está ativo

### **Erro: "Connection refused"**
- Verificar se o banco Neon está rodando
- Verificar firewall/network do Neon
- Verificar se a connection string tem IP correto

### **Erro: "Table doesn't exist"**
- Executar `db-setup` para criar tabelas
- Verificar se as tabelas foram criadas no Neon console

## 📞 **Suporte**

Se houver problemas:
1. Verificar logs do Netlify Functions
2. Verificar console do Neon
3. Testar connection string localmente
4. Verificar variáveis de ambiente

**O sistema está pronto para banco de dados real!** 🗄️✨
