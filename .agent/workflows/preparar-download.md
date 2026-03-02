---
description: Preparar o projeto para download (ZIP) removendo pastas desnecessárias e histórico Git
---

Este workflow prepara um arquivo ZIP limpo do projeto, removendo diretórios de dependências, cache e histórico Git, para que usuários possam baixar e usar como um projeto novo.

// turbo
1. Executar o comando de empacotamento:
   Este comando cria um diretório temporário, copia os arquivos ignorando pastas sensíveis e de cache, e remove qualquer rastro do Git original antes de gerar o arquivo `projeto-download.zip`.

   ```bash
   mkdir -p ../temp_zip_build && \
   rsync -av --progress . ../temp_zip_build \
     --exclude node_modules \
     --exclude .wrangler \
     --exclude .claude \
     --exclude .astro \
     --exclude .env \
     --exclude .git \
     --exclude .github \
     --exclude dist \
     --exclude .cache && \
   cd ../temp_zip_build && \
   # Garante que não há rastro de Git para o novo usuário
   rm -rf .git .github && \
   zip -r ../starter-kit-sniper-pages.zip . && \
   cd - && \
   mv ../starter-kit-sniper-pages.zip ./starter-kit-sniper-pages.zip && \
   rm -rf ../temp_zip_build
   ```

2. O arquivo `starter-kit-sniper-pages.zip` limpo e sem histórico Git está pronto na raiz do projeto.
