# 🚀 Guia de Deploy - HortaStats

## 📋 **Arquivos Essenciais**

### **Páginas Principais**
- `index.html` - Página principal com estatísticas
- `admin.html` - Página administrativa
- `styles.css` - Estilos do sistema
- `script.js` - Lógica da página principal
- `admin-script.js` - Lógica da página admin
- `api-client.js` - Cliente API com dados locais

### **Arquivos de Configuração**
- `package.json` - Dependências do projeto
- `netlify.toml` - Configuração do Netlify
- `README.md` - Documentação do projeto

## 🌐 **Deploy Simples**

### **1. Deploy Local**
```bash
# Abrir index.html no navegador
# Sistema funciona imediatamente
```

### **2. Deploy no Netlify**
```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod
```

### **3. Deploy no GitHub Pages**
1. Fazer upload dos arquivos para repositório GitHub
2. Ir em Settings > Pages
3. Selecionar branch main
4. Salvar

### **4. Deploy no Vercel**
```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod
```

## 🔧 **Configurações Específicas**

### **Netlify**
```toml
[build]
  publish = "."

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### **Vercel**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ]
}
```

## 📱 **Teste de Funcionamento**

### **1. Teste Local**
- Abrir `index.html` no navegador
- Verificar se carrega dados automaticamente
- Testar navegação entre seções

### **2. Teste Admin**
- Abrir `admin.html`
- Login: `admin` / `admin123`
- Testar upload de imagens
- Verificar se dados são salvos

### **3. Teste Responsivo**
- Testar em diferentes tamanhos de tela
- Verificar se interface se adapta
- Testar em mobile e tablet

## 🎯 **Resultado Final**

- ✅ **Sistema funcionando** em qualquer plataforma
- ✅ **Dados carregados** automaticamente
- ✅ **Interface responsiva** funcionando
- ✅ **Upload de imagens** ativo
- ✅ **Estatísticas** calculadas

## 📞 **Suporte**

Se houver problemas:
1. Verifique se todos os arquivos estão presentes
2. Teste localmente primeiro
3. Verifique o console do navegador
4. Confirme se o JavaScript está habilitado

**O sistema está pronto para deploy em qualquer plataforma!** 🌱📊