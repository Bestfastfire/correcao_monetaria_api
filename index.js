const puppeteer = require('puppeteer');
const fs = require('fs')

const extractJson = async (url, name) => {
    console.log(`extracting to -> ${name}`)
    const browser = await puppeteer.launch({
        headless: "new"
    });

    const page = await browser.newPage();

    // Navegar até a página
    await page.goto(url,{waitUntil: "networkidle0"});
    // await page.setViewport({
    //     width: 1920,
    //     height: 500
    // });

    // Clicar no botão para expandir a tabela
    await page.click('#btnTabelaCompleta');

    // Aguardar um curto período de tempo para garantir que a tabela seja carregada
    // await page.waitForTimeout(1000);

    // Extrair os dados da tabela
    const data = await page.evaluate(() => {
        const headers = ["Ano", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const rows = [];

        // // Extrair os cabeçalhos
        // document.querySelectorAll('#preview6 > div > table thead th').forEach((header) => {
        //     header
        //     headers.push(header.textContent.trim());
        // });

        // Extrair os dados das linhas da tabela
        document.querySelectorAll('#preview6 > div > table tbody tr').forEach((row) => {
            const rowData = {};

            row.querySelectorAll('td').forEach((cell, index) => {
                if(cell.parentNode.children.length > 12){
                    let text = cell.textContent.trim();

                    if(text.length > 0 && text !== '-'){
                        text = text.replace(',', '.')
                        text = parseFloat(text)

                        rowData[headers[index]] = text
                    }
                }
            });

            if(Object.keys(rowData).length > 0){
                rows.push(rowData);

            }
        });

        return rows;
    });

    await browser.close();
    fs.writeFileSync(__dirname + `/src/${name}.json`, JSON.stringify(data))
    console.log(`done extracting to -> ${name}`)
};

const extractAll = async () => {
    const urls = [
        {
            name: 'ipca', url: 'https://www.debit.com.br/tabelas/ipca-indice-nacional-de-precos-ao-consumidor-amplo'
        },
        {
            name: 'igpm', url: 'https://www.debit.com.br/tabelas/igpm-fgv-indice-geral-de-precos-mercado'
        },
        {
            name: 'selic', url: 'https://www.debit.com.br/tabelas/selic'
        },
        {
            name: 'cdi', url: 'https://www.debit.com.br/tabelas/cdi'
        }
    ]

    for(let item of urls){
        await extractJson(item.url, item.name)

    }
}

extractAll().then(r => console.log(`done`))