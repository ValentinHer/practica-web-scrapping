const requestPromise = require('request-promise');
const cheerio = require('cheerio');

let paginacionArray = [];
let resultadosArray = [];

(async () => {
    try {
        let response = await requestPromise("https://quotes.toscrape.com/");
        let $ = cheerio.load(response); // html


        // const obtenerPaginaciones = $('ul.pager > li > a').attr('href');

        paginacionArray.push(`https://quotes.toscrape.com/`);

        let existPage = true;

        while(existPage) {
            let response = await requestPromise(paginacionArray[paginacionArray.length - 1]);
            let $ = cheerio.load(response);

            const paginacion = $('ul.pager > li.next > a').attr('href');
            const url = `https://quotes.toscrape.com${paginacion}`;
            
            if (paginacion === undefined){
                existPage = false;
                break;
            }

            paginacionArray.push(url);
        }

        console.log(paginacionArray);

        // recuperar datos
        for(let url of paginacionArray){
            let response = await requestPromise(urlVisitada);
            let $ = cheerio.load(response);

            let frase = $('');

        }


        // // Obtener paginaciones
        // for(let i = 1; i < 10; i++){
        //     paginacionArray.push(`https://quotes.toscrape.com/${page}/${i}/`);
        // }

    } catch (error) {
        console.log(error);
        console.error("Error Message: ", error.message);
    }
})();