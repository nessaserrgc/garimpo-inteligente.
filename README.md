# Garimpo Inteligente

Central própria para pesquisar, pontuar, organizar e acompanhar produtos de afiliados.

## MVP atual

- Cadastro manual de produtos de Shopee, Mercado Livre, Amazon e TikTok Shop.
- TikTok Shop orientado exclusivamente a moda feminina.
- Pontuação inicial de potencial (0–100) para organizar a triagem.
- Filtros por plataforma e status.
- Registro manual de cliques e comissões.
- Exportação CSV.
- Armazenamento local no navegador (localStorage).

## Executar

Abra `index.html` no navegador. Não requer instalação de dependências ou servidor.

## Importante

Esta versão não consulta APIs de marketplaces nem coleta dados de vendas automaticamente. Os dados inseridos ficam no navegador/dispositivo utilizado e não são sincronizados entre dispositivos. A pontuação é uma triagem inicial, não uma previsão ou garantia de vendas.

## Próximas etapas

1. Validar fontes e permissões oficiais das APIs de afiliados.
2. Criar backend seguro para armazenar credenciais fora do navegador e do repositório.
3. Implementar importação de produtos e links autorizados.
4. Integrar rastreamento de cliques e relatórios de conversão.
5. Adicionar geração de roteiros, pins e carrosséis.
6. Planejar distribuição com limites e políticas de cada plataforma.

## Segurança

Nunca coloque App Secret, tokens, senhas ou cookies neste repositório, no código do navegador ou em mensagens públicas. Se uma credencial foi compartilhada, revogue-a e gere outra.