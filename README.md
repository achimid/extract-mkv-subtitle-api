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
        "langsTo": ["pt", "es"],
        "ignoreCache": "true"
    }

Deve ser informado o `magnetLink` para download do arquivo MKV, este é o unico campo obrigatório. 

Caso seja de seu interesse informe tambem para qual linguagem você deseja efetuar a tradução automática `langTo`. Se você souber a linguagem de origem informe o campo `langFrom` como no exemplo acima.

Vale a pena lembra que o processo de download de um arquivo via torrent é bastante pesado e depende muito do tamanho do arquivo, da conexão de rede e da quantidade de seeds, então o processo pode demorar. Sendo assim a resposta da extração não é sincrona e caso exista um cache disponivel, ele sera utilizado. Para ignorar o uso de cache utilize `ignoreCache` como o exemplo acima descreve.

Como resultado será retornado o body a seguir:

    {
        "_id": "5e7e4ed5f8d1290017ecf5fc",
        "magnetLink": "magnet:?xt=urn:btih:LD2KV6EC7RV7....",
        "langTo": ["pt", "es"],
        "subtitles": []
    }

Veja que a lista de legendas se encontra vasia. Quando o processo de download, extração e tradução for concluido, Se necessário você deve efetuar uma requisição `GET` para o endpoint `/extract/:id`, informando o id da extração no lugar de `:id` e o retorno será como a seguir:

    {
        "_id": "5e97350ca332a5634daadf08",
        "langsTo": [
            "pt",
            "es"
        ],    
        "magnetLink": "magnet:?xt=urn:btih:NPJ3LKI...",
        "subtitles": [
            {
                "translations": [
                    {
                        "dialoguesMap": [
                            {
                                "_id": "5e97350fa332a5634daadf0b",
                                "line": "Dialogue: 0,0:01:42.98,0:01:44.40,flashbackitalics,MARIA,0000,0000,0000,,Hi...",
                                "original": "Hi...",
                                "translated": "Olá...",
                                "to": "pt",
                                "index": 0
                            }
                        ],
                        "content": "Olá...",
                        "_id": "5e97350fa332a5634daadf0a",
                        "to": "pt"
                    },
                    {
                        "dialoguesMap": [
                            {
                                "_id": "5e97350fa332a5634daae0b0",
                                "line": "Dialogue: 0,0:01:42.98,0:01:44.40,flashbackitalics,MARIA,0000,0000,0000,,Hi...",
                                "original": "Hi...",
                                "translated": "Hola...",
                                "to": "es",
                                "index": 0
                            }
                        ],
                        "content": "Hola...",
                        "_id": "5e97350fa332a5634daae0af",
                        "to": "es"
                    }
                ],
                "_id": "5e97350ea332a5634daadf09",
                "fileName": "Example.2.srt",
                "filePath": "/tmp/webtorrent/6bd3b5a9165603f1c29.../Example.2.srt",
                "infoHash": "bd3b5a9165603f1c29...",
                "magnetURI": "magnet:?xt=urn:btih:bd3b5a9165603f1c29...",
                "fileContent": "[Script Info]\nTitle: Example\nScriptType: v4.00+\nWrapStyle: 0\nPlayResX: 848\nPlayResY: 480\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,0,0,0,100,100,0,0,1,1.7,0,2,0,0,28,1\nStyle: main,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,0,0,0,100,100,0,0,1,1.7,0,2,0,0,28,0\nStyle: italics,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,1,0,0,100,100,0,0,1,1.7,0,2,0,0,28,0\nStyle: flashback,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,0,0,0,100,100,0,0,1,1.7,0,2,0,0,28,1\nStyle: Default - Top,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,0,0,0,100,100,0,0,1,1.7,0,8,0,0,28,1\nStyle: top,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,1,8,13,13,24,0\nStyle: italicstop,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,1,0,0,100,100,0,0,1,1.7,0,8,0,0,28,0\nStyle: flashbackitalics,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,1,0,0,100,100,0,0,1,1.7,0,2,0,0,28,0\nStyle: flashbacktop,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,0,0,0,100,100,0,0,1,1.7,0,8,0,0,28,0\nStyle: flashbackitalicstop,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,1,0,0,100,100,0,0,1,1.7,0,8,0,0,28,0\nStyle: sign_7566_32_Test_1,Open Sans Semibold,45,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,2,40,40,320,1\nStyle: sign_7566_33_The_White_Steel_,Open Sans Semibold,45,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,8,40,40,320,1\nStyle: sign_18293_193_Evankhell_s_Moth,Open Sans Semibold,45,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,2,40,40,280,1\nStyle: sign_14594_155_Caf___Latte,Open Sans Semibold,36,&H001D0C0D,&H000000FF,&H004C9EED,&H00000000,1,0,0,0,100,100,0,0,1,4,0,8,40,40,27,1\nStyle: sign_25078_286_Calling,Open Sans Semibold,33,&H00B7D2F9,&H000000FF,&H001C1ACE,&H00000000,1,0,0,0,100,100,0,0,1,4,0,1,40,40,27,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n\nDialogue: 0,0:01:42.98,0:01:44.40,flashbackitalics,MARIA,0000,0000,0000,,Olá...\n"
            }
        ],
        "createdAt": "2020-04-15T16:23:40.146Z",
        "updatedAt": "2020-04-15T16:23:48.850Z"
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
    {
        body: {
            "_id": "5e97350ca332a5634daadf08",
            "langsTo": [
                "pt",
                "es"
            ],    
            "magnetLink": "magnet:?xt=urn:btih:NPJ3LKI...",
            "subtitles": [
                {
                    "translations": [
                        {
                            "dialoguesMap": [
                                {
                                    "_id": "5e97350fa332a5634daadf0b",
                                    "line": "Dialogue: 0,0:01:42.98,0:01:44.40,flashbackitalics,MARIA,0000,0000,0000,,Hi...",
                                    "original": "Hi...",
                                    "translated": "Olá...",
                                    "to": "pt",
                                    "index": 0
                                }
                            ],
                            "content": "Olá...",
                            "_id": "5e97350fa332a5634daadf0a",
                            "to": "pt"
                        },
                        {
                            "dialoguesMap": [
                                {
                                    "_id": "5e97350fa332a5634daae0b0",
                                    "line": "Dialogue: 0,0:01:42.98,0:01:44.40,flashbackitalics,MARIA,0000,0000,0000,,Hi...",
                                    "original": "Hi...",
                                    "translated": "Hola...",
                                    "to": "es",
                                    "index": 0
                                }
                            ],
                            "content": "Hola...",
                            "_id": "5e97350fa332a5634daae0af",
                            "to": "es"
                        }
                    ],
                    "_id": "5e97350ea332a5634daadf09",
                    "fileName": "Example.2.srt",
                    "filePath": "/tmp/webtorrent/6bd3b5a9165603f1c29.../Example.2.srt",
                    "infoHash": "bd3b5a9165603f1c29...",
                    "magnetURI": "magnet:?xt=urn:btih:bd3b5a9165603f1c29...",
                    "fileContent": "[Script Info]\nTitle: Example\nScriptType: v4.00+\nWrapStyle: 0\nPlayResX: 848\nPlayResY: 480\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,0,0,0,100,100,0,0,1,1.7,0,2,0,0,28,1\nStyle: main,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,0,0,0,100,100,0,0,1,1.7,0,2,0,0,28,0\nStyle: italics,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,1,0,0,100,100,0,0,1,1.7,0,2,0,0,28,0\nStyle: flashback,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,0,0,0,100,100,0,0,1,1.7,0,2,0,0,28,1\nStyle: Default - Top,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,0,0,0,100,100,0,0,1,1.7,0,8,0,0,28,1\nStyle: top,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,1,8,13,13,24,0\nStyle: italicstop,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,1,0,0,100,100,0,0,1,1.7,0,8,0,0,28,0\nStyle: flashbackitalics,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,1,0,0,100,100,0,0,1,1.7,0,2,0,0,28,0\nStyle: flashbacktop,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,0,0,0,100,100,0,0,1,1.7,0,8,0,0,28,0\nStyle: flashbackitalicstop,Open Sans Semibold,36,&H00FFFFFF,&H000000FF,&H00020713,&H00000000,-1,1,0,0,100,100,0,0,1,1.7,0,8,0,0,28,0\nStyle: sign_7566_32_Test_1,Open Sans Semibold,45,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,2,40,40,320,1\nStyle: sign_7566_33_The_White_Steel_,Open Sans Semibold,45,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,8,40,40,320,1\nStyle: sign_18293_193_Evankhell_s_Moth,Open Sans Semibold,45,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,1,0,0,2,40,40,280,1\nStyle: sign_14594_155_Caf___Latte,Open Sans Semibold,36,&H001D0C0D,&H000000FF,&H004C9EED,&H00000000,1,0,0,0,100,100,0,0,1,4,0,8,40,40,27,1\nStyle: sign_25078_286_Calling,Open Sans Semibold,33,&H00B7D2F9,&H000000FF,&H001C1ACE,&H00000000,1,0,0,0,100,100,0,0,1,4,0,1,40,40,27,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n\nDialogue: 0,0:01:42.98,0:01:44.40,flashbackitalics,MARIA,0000,0000,0000,,Olá...\n"
                }
            ],
            "createdAt": "2020-04-15T16:23:40.146Z",
            "updatedAt": "2020-04-15T16:23:48.850Z"
        }
    }

### Possible Languages
    {
        'af': 'Afrikaans',
        'sq': 'Albanian',
        'am': 'Amharic',
        'ar': 'Arabic',
        'hy': 'Armenian',
        'az': 'Azerbaijani',
        'eu': 'Basque',
        'be': 'Belarusian',
        'bn': 'Bengali',
        'bs': 'Bosnian',
        'bg': 'Bulgarian',
        'ca': 'Catalan',
        'ceb': 'Cebuano',
        'ny': 'Chichewa',
        'zh-cn': 'Chinese Simplified',
        'zh-tw': 'Chinese Traditional',
        'co': 'Corsican',
        'hr': 'Croatian',
        'cs': 'Czech',
        'da': 'Danish',
        'nl': 'Dutch',
        'en': 'English',
        'eo': 'Esperanto',
        'et': 'Estonian',
        'tl': 'Filipino',
        'fi': 'Finnish',
        'fr': 'French',
        'fy': 'Frisian',
        'gl': 'Galician',
        'ka': 'Georgian',
        'de': 'German',
        'el': 'Greek',
        'gu': 'Gujarati',
        'ht': 'Haitian Creole',
        'ha': 'Hausa',
        'haw': 'Hawaiian',
        'iw': 'Hebrew',
        'hi': 'Hindi',
        'hmn': 'Hmong',
        'hu': 'Hungarian',
        'is': 'Icelandic',
        'ig': 'Igbo',
        'id': 'Indonesian',
        'ga': 'Irish',
        'it': 'Italian',
        'ja': 'Japanese',
        'jw': 'Javanese',
        'kn': 'Kannada',
        'kk': 'Kazakh',
        'km': 'Khmer',
        'ko': 'Korean',
        'ku': 'Kurdish (Kurmanji)',
        'ky': 'Kyrgyz',
        'lo': 'Lao',
        'la': 'Latin',
        'lv': 'Latvian',
        'lt': 'Lithuanian',
        'lb': 'Luxembourgish',
        'mk': 'Macedonian',
        'mg': 'Malagasy',
        'ms': 'Malay',
        'ml': 'Malayalam',
        'mt': 'Maltese',
        'mi': 'Maori',
        'mr': 'Marathi',
        'mn': 'Mongolian',
        'my': 'Myanmar (Burmese)',
        'ne': 'Nepali',
        'no': 'Norwegian',
        'ps': 'Pashto',
        'fa': 'Persian',
        'pl': 'Polish',
        'pt': 'Portuguese',
        'ma': 'Punjabi',
        'ro': 'Romanian',
        'ru': 'Russian',
        'sm': 'Samoan',
        'gd': 'Scots Gaelic',
        'sr': 'Serbian',
        'st': 'Sesotho',
        'sn': 'Shona',
        'sd': 'Sindhi',
        'si': 'Sinhala',
        'sk': 'Slovak',
        'sl': 'Slovenian',
        'so': 'Somali',
        'es': 'Spanish',
        'su': 'Sundanese',
        'sw': 'Swahili',
        'sv': 'Swedish',
        'tg': 'Tajik',
        'ta': 'Tamil',
        'te': 'Telugu',
        'th': 'Thai',
        'tr': 'Turkish',
        'uk': 'Ukrainian',
        'ur': 'Urdu',
        'uz': 'Uzbek',
        'vi': 'Vietnamese',
        'cy': 'Welsh',
        'xh': 'Xhosa',
        'yi': 'Yiddish',
        'yo': 'Yoruba',
        'zu': 'Zulu'
    }


### TODOs

* Implementar a união das legendas traduzidas diretamente no arquivo e fornecer para download
* Possibilitar a extração de outros formatos de video alem de MKV
* Possibilitar o download do arquivo de outra maneiras (Mirros, Links Diretos e Upload de arquivos)
* Implementar sistema de Métrica para API
* Implementar sistema de authenticação e controle de requisições por conta
* Adicionar mensagem de retorno quando nenhuma legenda for encontrada ou der algum erro.
* Melhorar o tratamento de erro da API

# MkvExtractor
* Remover a parte do ajuste das traduções das legendas. (Colocar na api do HorribleSubs ou criar uma API para traduções.)

# API de Tradução de Legendas...
* Criar uma API que recebe um arquivo de legenda e revolve outro arquivo traduzido, como o MKVExtractor realiza, mas criar uma api para externalizar isso
* Postar no openSubtitle automaticamente

Criar a API de Multiplos acessos ao banco de dados, nos inserts, pode utilizar o Promise.Race, ja no Find, utilizar o Promisse.All (ou até mesmo a nova versão do promise.all)
