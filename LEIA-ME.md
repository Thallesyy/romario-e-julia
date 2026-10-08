# O céu do nosso primeiro beijo: Romario e Julia

O céu de verdade do primeiro beijo do Romario e da Julia, em 08/10/2025, por volta das 18h,
em Esteio (RS).

O site começa no pôr do sol daquele fim de tarde. Quando o sol "se apaga", aparece o céu
de estrelas que estava lá em cima, com:
- as estrelas do catálogo Hipparcos, nas posições daquela hora;
- a Via Láctea;
- o Cruzeiro do Sul e o Escorpião.

Depois a viagem sobe pro espaço com as fotos do casal, até elas virarem a constelação "R.J"
em forma de coração. No fim vêm os vídeos.

No ar em https://thallesyy.github.io/romario-e-julia/

## Estado

- **Hora:** 18h.
  - O sol se pôs às 18h28, então às 18h ele ainda estava 6° acima do horizonte, no oeste.
  - A lua ainda não tinha nascido. Por isso a cena dela é a do Escorpião, que estava lá no
    alto.
- **Fotos:** são as 26 do Romario, em `fotos/` como `foto01` a `foto26`, na mesma ordem
  dos nomes do WhatsApp.
- **Vídeos:** os 5 vídeos ficam em `videos/` e aparecem depois da frase final.
  - Eles tocam sem som quando aparecem na tela, porque o iPhone só deixa assim.
  - Um toque no vídeo liga o som.
- **Textos:**
  - As legendas, o bilhete, a frase de baixo do final e as frases dos vídeos são frases
    do Romario. Só passei a primeira letra pra minúscula, pra combinar com o resto do site.
  - O resto é rascunho.
- **Não testado num iPhone de verdade.**

## O que mudou no código em relação ao original

- **Pôr do sol:** se o sol ainda estava no céu (`FASE_DIA`):
  - o site abre olhando pro pôr do sol, com o sol pertinho dos prédios;
  - o céu é desenhado no shader `fsDomo`;
  - o sol some junto com as luzes da cidade, e só aí as estrelas aparecem.
- **Cruzeiro do Sul:** o texto se ajusta à altura dele no céu.
  - Abaixo de 15° do horizonte: a câmera mira um pouco mais alto, o nome vai em cima da
    cruz e os prédios abrem espaço pra ela.
- **O voo no espaço** vai na direção do centro da Via Láctea, qualquer que seja a altura
  dele no céu (`ALT_VOO`).
- **O texto do Escorpião** diz "lá no alto", "subindo" ou "se pondo", conforme a posição.
- **Esteio** entrou no mapa de luzes.
- **O final** ganhou uma sombra suave atrás das frases.
- **Vídeos:** o final ganhou o aviso "role pra ver os nossos vídeos".
  - A seção `#videos` vem depois do trilho da viagem; o progresso da viagem usa só o
    trilho (`maxTrilho`).
  - Os botões "olhar o céu" e "ver de novo" foram pro fim dos vídeos.

## Onde trocar as coisas

Quase tudo fica no começo do `<script>` do `index.html`, no bloco "TUDO QUE É DO CASAL":

- `NOITE`: dia, hora, fuso, cidade, latitude e longitude. O céu, a Lua, os planetas e a
  Terra se recalculam sozinhos.
- `INICIAIS`: o nome da constelação.
- `MEMORIAS`: as fotos grandes, com as legendas.
- `TEXTOS`: todos os textos do caminho, o bilhete, o final e a frase antes dos vídeos.
- `VIDEOS`: os vídeos do final, com o formato (`'16/9'` deitado, `'9/16'` em pé) e a
  legenda.

Estas partes servem pra Esteio, mas precisam ser refeitas se um dia for outro lugar:

- `CIDADES`, `ESTRADAS` e `AGUAS`: o mapa de luzes visto de perto;
- `CONTORNO_RS` e o rótulo "Rio Grande do Sul" (e Uruguai, Argentina, Oceano Atlântico);
- as luzes no horizonte, mais fortes pro sul (`pesoSul`).

## Fotos

1. Coloque as fotos na pasta `fotos/`, em JPG, PNG ou WEBP. Fotos HEIC do iPhone só
   funcionam com o `pillow-heif` instalado.
2. No `MEMORIAS`, use o nome do arquivo sem a extensão como `id`.
3. Rode:

   ```
   python ferramentas/preparar-fotos.py
   ```

O script gera o `fotos.js`:

- todas as fotos da pasta viram estrelas do coração (30 ou mais deixam ele bonito);
- as fotos do `MEMORIAS` também viram polaroides.

Se uma polaroide cortar a cabeça de alguém, ponha `foco` na foto, de 0 (topo) a 1 (base).

## Como testar

Rode `python -m http.server` dentro da pasta e abra o endereço que ele mostrar.

- `index.html?t=0.5` começa no meio da viagem.
- `index.html?t=1` começa no final, logo antes dos vídeos.
- `index.html?simples=1` mostra a versão sem 3D.
- `index.html?teste=1&t=0.88` desenha só um quadro, pra tirar print.

## Arquivos

- `index.html`: a experiência toda.
- `astro.js`: as contas do céu (estrelas, Sol, Lua, planetas).
- `estrelas.js`: o catálogo de estrelas e constelações, gerado; não precisa mexer.
- `fotos.js`: as fotos embutidas, gerado pelo `ferramentas/preparar-fotos.py`.
- `videos/`: os vídeos do final.
- `fotos/`: as fotos originais do casal; não vão pro GitHub (`.gitignore`).
