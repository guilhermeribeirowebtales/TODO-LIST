# Skill: Revisão de Código Frontend (Vue 3, Pinia e Vuetify)
> **Description:** Analisa as alterações no frontend para garantir o uso correto da Composition API, gestão de estado segura, layouts responsivos e rotas otimizadas.

---

## 🎯 Critérios de Ativação
Esta skill deve ser executada quando:
- O utilizador solicitar explicitamente uma revisão de frontend (`/revisao-vue`).
- Forem alterados ficheiros com extensão `.vue`.
- Ocorrerem alterações nos diretórios `router/`, `stores/` ou `components/`.

---

## 🔍 Lista de Verificação (Checklist)

O Kiro deve analisar o código alterado com base nos seguintes pilares:

### 1. Gestão de Estado (Pinia)
- [ ] **Instanciação Segura:** Garantir que as stores (`useAuthStore()`) **nunca** são invocadas na raiz do ficheiro (ex: fora do `beforeEach` no router ou fora do `setup` dos componentes).
- [ ] **Persistência de Dados:** Validar se o armazenamento local (localStorage) é acedido de forma segura e se o token é tratado corretamente (sem expor dados sensíveis).

### 2. Vue 3 Composition API
- [ ] **Script Setup:** Confirmar o uso de `<script setup>` em novos componentes para manter a consistência e performance.
- [ ] **Reatividade Correta:** Verificar se `ref` é usado para primitivos e `reactive` para objetos.
- [ ] **Mutação de Props:** Garantir que as propriedades (props) injetadas não sofrem mutação direta dentro do componente filho.

### 3. UI, Layout e Integrações (Vuetify & Apollo)
- [ ] **Nomenclatura Vuetify:** Evitar a invenção de componentes (ex: usar `<v-btn>` em vez de tags inexistentes como `<v-icon-btn>`).
- [ ] **Sistema de Grelha (Grid):** Preferir o uso de `<v-row>` e `<v-col>` para alinhar e dimensionar inputs lado-a-lado, em vez de classes CSS flexbox personalizadas.
- [ ] **Chamadas à API:** Garantir que o Apollo Client está a injetar corretamente o cabeçalho `Authorization: Bearer <token>` nas requisições.

### 4. Rotas e Performance
- [ ] **Lazy Loading:** Confirmar que as rotas não essenciais (ex: páginas de edição ou criação) usam importação dinâmica (`component: () => import(...)`).
- [ ] **Navigation Guards:** Validar a lógica de autenticação no `router.beforeEach` para evitar ciclos infinitos e garantir que a função `next()` é chamada de forma apropriada.

---

## 📋 Formato de Saída (Output)

Ao concluir a revisão, o Kiro deve apresentar os resultados de forma estruturada:

1. **Resumo Executivo:** Uma breve avaliação (ex: "Aprovado com ressalvas" ou "Necessita de Correções Urgentes").
2. **Problemas Críticos (Bloqueadores):** Lista de bugs reais, falhas na instanciação do Pinia ou problemas de rotas.
3. **Sugestões de Melhoria (Opcional):** Dicas de refatoração UI ou otimização de reatividade.
4. **Exemplos de Código:** Para cada problema identificado, mostrar o trecho atual e a versão corrigida proposta.