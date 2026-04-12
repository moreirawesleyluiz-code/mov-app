# MOV

Aplicação web da **MOV** — comunidade de conexões reais (São Paulo). Inclui cadastro, login, painel autenticado, **Se Mov** (assinatura em modo demo) e o **fluxo Jantar** (data → zona → preferências → resumo → confirmar).

## Requisitos

- Node.js 20+
- npm

## Configuração

1. Copie o ambiente:

   ```bash
   copy .env.example .env
   ```

2. Defina `AUTH_SECRET` (obrigatório para sessão). Exemplo:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   Cole o valor em `.env` na chave `AUTH_SECRET`.

3. Instale dependências e prepare o banco:

   ```bash
   npm install
   npx prisma db push
   npm run db:seed
   ```

4. Desenvolvimento:

   ```bash
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000).

## Estrutura principal

| Rota | Descrição |
|------|-----------|
| `/` | Landing |
| `/login`, `/register` | Autenticação |
| `/app` | Início — Se Mov + resumo do fluxo do jantar |
| `/app/agenda` | Lista de datas (jantar) |
| `/app/agenda/[eventId]/regiao` | Escolha da zona em SP |
| `/app/agenda/[eventId]/preferencias` | Idioma, orçamento, restrições |
| `/app/agenda/[eventId]/resumo` | Revisão e **Confirmar** inscrição |
| `/app/planos` | **Nossos planos** (após confirmar o jantar — scroll único: planos, cupom, prova social, benefícios) |
| `/app/experiencias` | Portfólio (Clássico, Sensorial, Exclusivo) |
| `/app/comunidade` | O que é no app vs. WhatsApp |
| `/app/conta` | Dados da conta |

## Fluxo Jantar (assinante)

1. **Data** — `/app/agenda`
2. **Zona** — região de São Paulo
3. **Preferências** — idiomas, faixa de gasto, restrições (opcional)
4. **Resumo** — editar ou confirmar (grava inscrição na API)

Rascunho entre passos usa `sessionStorage` até confirmar.

## Próximos passos sugeridos

- Integração **Stripe** para assinatura Se Mov e ingressos.
- Painel **admin** para criar/editar eventos e curadoria.
- **Notificações** (e-mail / push) para confirmações e lembretes.
- Deploy (Vercel + PostgreSQL) e variáveis `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Prisma (SQLite em dev), Auth.js (NextAuth v5) com credenciais.
