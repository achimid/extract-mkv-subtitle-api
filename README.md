# extract-mkv-subtitle-api

[Site](http://extractmkvsubtitle.ddns.net) => http://extractmkvsubtitle.ddns.net

[API](http://extractmkvsubtitle.ddns.net/api/v1) => http://extractmkvsubtitle.ddns.net/api/v1

Esta é uma API que tem como objetivo extrair legendas de arquivos de extensão MKV utilizando o MagnetLink Torrent para download do arquivo. Neste processo ela também pode efetuar a tradução do arquivo de legenda (Dialogos).

A extração da leganda para tradução é feita segundo o padrão de legenda SSA/ASS.

A tradução dos dialogos da legenda é feita de forma automático! Fica muito bom, mas não e perfeito, é apenas automático.

### Endpoints
    
    POST -  /extract                     - Criação de uma extração

    GET  -  /extract/:id                 - Recuperar os dados de uma extração pelo id

### Funcionamento

Você deve efetuar uma requisição `POST` para o endpoint `/extract` com as seguintes informações (body):

    {
        "magnetLink": "magnet:?xt=urn:btih:LD2KV6EC7RV7Z....",
        "langFrom": "en",
        "langTo": "pt",
        "ignoreCache": "true"
    }

Deve ser informado o `magnetLink` para download do arquivo MKV, este é o unico campo obrigatório. 

Caso seja de seu interesse informe tambem para qual linguagem você deseja efetuar a tradução automática `langTo`. Se você souber a linguagem de origem informe o campo `langFrom` como no exemplo acima.

Vale a pena lembra que o processo de download de um arquivo via torrent é bastante pesado e depende muito do tamanho do arquivo, da conexão de rede e da quantidade de seeds, então o processo pode demorar. Sendo assim a resposta da extração não é sincrona e caso exista um cache disponivel, ele sera utilizado. Para ignorar o uso de cache utilize `ignoreCache` como o exemplo acima descreve.

Como resultado será retornado o body a seguir:

    {
        "_id": "5e7e4ed5f8d1290017ecf5fc",
        "magnetLink": "magnet:?xt=urn:btih:LD2KV6EC7RV7....",
        "langTo": "pt",
        "subtitles": []
    }

Veja que a lista de legendas se encontra vasia. Quando o processo de download, extração e tradução for concluido, Se necessário você deve efetuar uma requisição `GET` para o endpoint `/extract/:id`, informando o id da extração no lugar de `:id` e o retorno será como a seguir:

    {
        "_id": "5e7e4ed5f8d1290017ecf5fc",
        "magnetLink": "magnet:?xt=urn:btih:58f4aaf882fc...",
        "langTo": "pt",
        "subtitles": [
            {
                "_id": "5e7e4f06f8d1290017ecf5fd",
                "fileName": "subtitle.2.srt",
                "filePath": "/tmp/58f4aaf882fc6bfca5640704a6d47ba371a9d553/subtitle.2.srt",
                "infoHash": "58f4aaf882fc6bfca5640704a6d47ba371a9d553",
                "magnetURI": "magnet:?xt=urn:btih:58f4aaf882fc...",
                "fileContent": "Hi!",
                "fileContentTranslated": "Olá!"
            }
        ],
        "createdAt": "2020-03-27T19:07:01.607Z",
        "updatedAt": "2020-03-27T19:07:51.746Z"
    }

Existe a possibilidade de um arquivo MKV possuir varias legendas embutidas, então ela serão nomeadas conforme o nome do arquivo e a posição da legenda no arquivo. Os atributos `fileContent` e `fileContentTranslated` são respectivamente a legenda originalmente extraido e a tradução.


### Socket Client

Como uma melhor extratégia de utilização do serviço, de preferência a utilização de Sockets ou invez de efetuar a estratégia de Pooling na API. É possivel implementar um cliente utilizando a biblioteca [Socket.io](https://www.npmjs.com/package/socket.io-client) como exemplo abaixo:


    const SERVER_URL = 'https://extract-mkv-subtitle-api.ddns.net/'
    const EXTRACTION_ID = '5e7e3d42f8d1290017ecf4bd'

    const socket = require('socket.io-client')(SERVER_URL, { transports: ['websocket'] })

    socket.on('reconnect_attempt', () => { socket.io.opts.transports = ['polling', 'websocket']})

    socket.on('connect', () => console.info('Socket conectado ao servidor'))

    socket.on('disconnect', () => console.info('Socket desconectado do servidor'))

    // socket.on(`${EXTRACTION_ID}`, (data) => console.info(data))
    // Recebe a notificação de todos os tipos de eventos. (Atenção, cada evento pode ter um corpo de mensagem diferente)

    // socket.on(`${EXTRACTION_ID}_STARTED`, (data) => console.info(data))
    // Recebe a notificação quando o download da extração foi iniciado
    // {
    //     "extra": {
    //         "file": "subtitle.mkv",
    //     },
    //     "status": "STARTED"
    // }



    // socket.on(`${EXTRACTION_ID}_DOWNLOADING`, (data) => console.info(data))
    // Recebe a notificação enquanto o download esta sendo realizado, em uma frequencia de 2s entre as notificações
    // {
    //     "extra": { 
    //         "progress": "44",
    //         "downloadSpeed": "16 MB",
    //         "uploadSpeed": "120 Kb",
    //         "msg": "Progresso [44%] [16 MB/s] [120 Kb/s]"
    //     },
    //     "status": 'DOWNLOADING'
    // }


    // socket.on(`${EXTRACTION_ID}_FINISHED`, (data) => console.info(data))
    // Recebe a notificação quando o download foi finalizado
    // {
    //     "extra": {
    //         "file": "subtitle.mkv",
    //         "downloadTime": "0.52s"
    //     },
    //     "status": "FINISHED"
    // }


    // socket.on(`${EXTRACTION_ID}_DONE`, (data) => console.info(data))
    // Recebe a notificação quando toda a operação foi realizada (download, extração, tradução, limpeza)    
    // {
    //     "_id": "5e7e4ed5f8d1290017ecf5fc",
    //     "magnetLink": "magnet:?xt=urn:btih:58f4aaf882fc...",
    //     "langTo": "pt",
    //     "subtitles": [
    //         {
    //             "_id": "5e7e4f06f8d1290017ecf5fd",
    //             "fileName": "subtitle.2.srt",
    //             "filePath": "/tmp/58f4aaf882fc6bfca5640704a6d47ba371a9d553/subtitle.2.srt",
    //             "infoHash": "58f4aaf882fc6bfca5640704a6d47ba371a9d553",
    //             "magnetURI": "magnet:?xt=urn:btih:58f4aaf882fc...",
    //             "fileContent": "Hi!",
    //             "fileContentTranslated": "Olá!"
    //         }
    //     ],
    //     "createdAt": "2020-03-27T19:07:01.607Z",
    //     "updatedAt": "2020-03-27T19:07:51.746Z"
    // }


#### TODOs

* Implementar a união das legendas traduzidas diretamente no arquivo e fornecer para download
* Permitir tradução para multiplas linguagens
* Possibilitar a extração de outros formatos de video alem de MKV
* Possibilitar o download do arquivo de outra maneiras (Mirros, Links Diretos e Upload de arquivos)
* Implementar sistema de Métrica para API
* Implementar sistema de authenticação e controle de requisições por conta
* Corrigir a extração para quando o arquivo esta em subpastas (url teste: magnet:?xt=urn:btih:5256bce7c4f3eaf0d19a02d56bc958b96e61be72&dn=Homeland.S08E10.1080p.WEB.H264-XLF[rartv]&tr=http://tracker.trackerfix.com:80/announce&tr=udp://9.rarbg.me:2860&tr=udp://9.rarbg.to:2940)
* Adicionar mensagem de retorno quando nenhuma legenda for encontrada ou der algum erro.
* Melhorar o tratamento de erro da API