const requestPromise = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const {Parser} = require('json2csv');
const XLSX = require('xlsx');

let paginacionArray = [];
let resultadosArray = [];
let resulatdostoExcle = [];

(async () => {
    try {
        let response = await requestPromise("https://quotes.toscrape.com/");
        let $ = cheerio.load(response); // html


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
            let response = await requestPromise(url);
            let $ = cheerio.load(response);

            const results = []


            $('div.row').eq(1).find('div.quote').each(function() {
                let frase = $(this).find('span.text').text();
                let author = $(this).find('span > small.author').text();

                let tags = [];

                $(this).find('div.tags > a').each(function() {
                    let tag = $(this).text();
                    tags.push(tag);
                })
                // console.log(frase);
                // console.log(author);

                const resultadosBusqueda = {
                    quote: frase,
                    author: author,
                    tags
                }

                results.push(resultadosBusqueda);
            })
            // console.log(results);

            resultadosArray.push(...results);

        }

        //Crear archivo JSON
        let data = JSON.stringify(resultadosArray);
        fs.writeFileSync("quotes.json", data);
        console.log("ARCVHIVO JSON CREADO!!!");

        //Crear archivo CSV
        const fields = ['quote', 'author', 'tags'];
        const json2csvParse =  new Parser({
            fields: fields,
            defaultValue: 'No Hay Info',
        });
        const csv = json2csvParse.parse(resultadosArray);
        fs.writeFileSync("uotes.csv", csv, "utf-8");
        console.log("ARCVHIVO CSV CREADO!!!");
 
        //Crear archivo XLSX
        resultadosArray.forEach(item => {
            const data = {
                quote: item.quote,
                author: item.author,
                tags: item.tags.join(', ') 
            }

            resulatdostoExcle.push(data);
        })

        const worksheet = XLSX.utils.json_to_sheet(resulatdostoExcle);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Quotes');

        XLSX.writeFile(workbook, 'quotes.xlsx');
        console.log('ARCHIVO XLSX CREADO!!');


    } catch (error) {
        console.log(error);
        console.error("Error Message: ", error.message);
    }
})();