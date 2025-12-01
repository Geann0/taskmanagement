# 🐳 Guia de Instalação do Docker - Windows

## Passo 1: Baixar Docker Desktop

1. Acesse: https://www.docker.com/products/docker-desktop
2. Clique em **"Download for Windows"**
3. Aguarde o download do instalador

## Passo 2: Instalar Docker Desktop

1. Execute o instalador `Docker Desktop Installer.exe`
2. Siga as instruções na tela
3. Marque a opção **"Use WSL 2 instead of Hyper-V"** (recomendado)
4. Clique em **"Ok"** e aguarde a instalação
5. **Reinicie o computador** quando solicitado

## Passo 3: Configurar Docker Desktop

1. Após reiniciar, abra o **Docker Desktop**
2. Aceite os termos de uso
3. Aguarde o Docker iniciar (ícone de baleia na bandeja do sistema)
4. O ícone ficará estável quando estiver pronto

## Passo 4: Verificar Instalação

Abra o PowerShell e execute:

```powershell
docker --version
docker-compose --version
```

Você deve ver as versões instaladas.

## Passo 5: Iniciar MongoDB e Redis

No diretório do projeto, execute:

```powershell
cd "C:\Users\haduk\OneDrive\Desktop\Task Management App"
docker-compose up -d
```

## Passo 6: Verificar se Está Rodando

```powershell
docker ps
```

Você deve ver 2 containers:

- `taskapp-mongodb` (porta 27017)
- `taskapp-redis` (porta 6379)

## Comandos Úteis

### Ver logs dos containers:

```powershell
docker-compose logs -f
```

### Parar os containers:

```powershell
docker-compose down
```

### Reiniciar os containers:

```powershell
docker-compose restart
```

### Parar e remover volumes (apaga dados):

```powershell
docker-compose down -v
```

## Solução de Problemas

### Erro: "Docker daemon is not running"

- Abra o Docker Desktop e aguarde iniciar

### Erro: "WSL 2 installation is incomplete"

1. Execute como administrador:

```powershell
wsl --install
```

2. Reinicie o PC

### Erro: Porta já em uso

```powershell
# Verificar o que está usando a porta
netstat -ano | findstr :27017
netstat -ano | findstr :6379

# Matar o processo (substitua <PID>)
taskkill /PID <PID> /F
```

## Alternativa: Instalar Sem Docker

### MongoDB:

1. Baixe: https://www.mongodb.com/try/download/community
2. Instale como serviço do Windows
3. MongoDB rodará na porta 27017

### Redis:

1. Baixe: https://github.com/tporadowski/redis/releases
2. Extraia e execute `redis-server.exe`
3. Redis rodará na porta 6379

---

**Após instalar o Docker, volte e execute:**

```powershell
npm run docker:up
npm run dev
```
