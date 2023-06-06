const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const extraPluginStealth = require('puppeteer-extra-plugin-stealth')()
const {column_load} = require("../../src/ev___tools/ms_excel/excel_tools");
const {ExcelWriter} = require("../../src/ev___tools/excel/ExcelWriter.js")
const _ = require("lodash");

puppeteer.use(extraPluginStealth);

//| Запускает браузер в скрытом режиме.
const browserOpen = async (headless = false) => await puppeteer.launch({
    headless: headless,
    isMobile: true,
    //| executablePath: executablePath(),
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    //| waitForInitialPage: true,
    //| slowMo: 10,
    args: ["--disable-setuid-sandbox"],
    'ignoreHTTPSErrors': true
});


const haveIn = (inWord, word) => {
    return Boolean(inWord.indexOf(word) !== -1);
}

const parse_data_by_template = async (
    p_input_url_list = [],
    p_data_from = "body", //| фильтр получения данных со страницы
    p_template = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}/gi, //| шаблон получения информации из данных
    p_buffer_path = "buffer.json", //| буффер для сохранения / загрузки
    p_sub_url_filter = () => null //| callback фильтр для ссылок внутри страницы
) => {

    let urls_data_f;

    if (fs.existsSync(p_buffer_path)) {
        urls_data_f = JSON.parse(String(fs.readFileSync(p_buffer_path)));
    } else {
        urls_data_f = _.cloneDeep(p_input_url_list);
    }

    //| сохраняем
    fs.writeFileSync(p_buffer_path, JSON.stringify(urls_data_f));

    //| запускаем браузер
    const browser = await browserOpen(true);
    const page = await browser.newPage();

    //| бежим по первичным ссылкам
    let urls_data_f_size = urls_data_f.length;
    for (let i = 0; i < urls_data_f_size; i++) {

        let url_el = urls_data_f[i];

        try {
            if (urls_data_f[i].links.length <= 0) {
                if (url_el.status) {
                    console.log(url_el.c_url, "/", i + 1, "/", urls_data_f_size, "- загружен");
                    continue;
                } else {
                    console.log(url_el.c_url, "/", i + 1, "/", urls_data_f_size, "- загрузка");
                }


                //| заходим на страницу
                await page.goto(url_el.c_url, {waitUntil: "networkidle0"});

                //| получаем список sub url
                let b_urls = await page.$$eval("a", links => {
                    return links.map(link => link.href);
                });


                //| фильтруем ссылки
                b_urls = b_urls.filter(url => {
                    return haveIn(url, "http") &&
                        haveIn(url, ".ru") &&
                        haveIn(url, url_el.i_url) &&
                        !haveIn(url, ".pdf") &&
                        !haveIn(url, "@") &&
                        !haveIn(url, "news") &&
                        !haveIn(url, "clients") &&
                        !haveIn(url, "news")
                });

                b_urls.push(url_el.c_url);

                //| убираем дубли
                let set_array = new Set([...b_urls]);
                b_urls = [];
                set_array.forEach(url => {
                    b_urls.push({
                        i_url: url_el.i_url,
                        url: url,
                        mails: []
                    })
                });

                urls_data_f[i].links = b_urls;
                fs.writeFileSync(p_buffer_path, JSON.stringify(urls_data_f));
            }

            for (let j = 0; j < urls_data_f[i].links.length; j++) {
                try {

                    if (urls_data_f[i].links[j].status) {
                        console.log(urls_data_f[i].links[j].url, "|", i + 1, "/", urls_data_f_size, "|", j + 1, "/", urls_data_f[i].links.length, "| - загружен");
                        continue;
                    } else {
                        console.log(urls_data_f[i].links[j].url, "|", i + 1, "/", urls_data_f_size, "|", j + 1, "/", urls_data_f[i].links.length, "| - загрузка");
                    }

                    //| получаем url текущей страницы
                    let current_url = page.url();

                    //| если мы уже на этой странице (первая стр) то и не нужно переходить.
                    if (current_url !== urls_data_f[i].links[j].url) {
                        await page.goto(urls_data_f[i].links[j].url, {waitUntil: "networkidle0"});
                    }

                    //| получаем контент по ссылке
                    let b_content_1 = await page.$eval(p_data_from, div => div.textContent);
                    let mails = b_content_1.match(p_template);

                    //| надо будет удалить, чисто для теста производительности
                    let b_content = await page.content();
                    let mails_2 = b_content.match(p_template);
                    //| ................................................................................................

                    //| если нашлось больше 0 мэйлов
                    if (Array.isArray(mails) && mails.length > 0) {

                        //| удаляем дубли и записываем.
                        let b_set = new Set(mails);
                        b_set.forEach(mail => urls_data_f[i].links[j].mails.push(mail));

                        //| изменяем статус и сохраняемся
                        urls_data_f[i].links[j].status = true;
                        fs.writeFileSync(p_buffer_path, JSON.stringify(urls_data_f));
                    }

                } catch (err) {
                    //| выводим ошибку
                    console.log(url_el.c_url, "|", i + 1, "/", urls_data_f_size, "|", j + 1, "/", urls_data_f[i].links.length, "| - ошибка");
                    continue;
                }

            }

        } catch (err) {
            console.log(url_el.c_url, "/", i + 1, "/", urls_data_f_size, "- загрузка");
            continue;
        }

    }

    await page.close();
    await browser.close();

    return urls_data_f;
}

(async function start() {

    let path = "work_path/input_url_list.xlsx";
    //| загружаем и приводим к нужному формату
    let input_url_list = await column_load(path, "1", 1);
    let url_excel_list = input_url_list.slice(1, input_url_list.length);
    url_excel_list = url_excel_list.filter(el => el.length > 0);
    input_url_list = url_excel_list.map(url => {
        let b_c_url = url.indexOf("https://www.") === -1 ? "https://www." + url : url;
        return {i_url: url, c_url: b_c_url, links: []};
    });

    let data = await parse_data_by_template(
        input_url_list,
        undefined,
        undefined,
        undefined,
        undefined,
        //     ... other params
        //     p_data_from = "body", //| фильтр получения данных со страницы
        //     p_template = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}/gi, //| шаблон получения информации из данных
        //     p_buffer_path = "buffer.json", //| буффер для сохранения / загрузки
        //     p_sub_url_filter = () => null //| callback фильтр для ссылок внутри страницы
    );


    //| формируем данные для сохранения
    let template_excel = [];
    data.forEach(link => {
        link.links.forEach(sub_link => {
            template_excel.push([sub_link.i_url, sub_link.url, ...sub_link.mails])
        });
    });

    await ExcelWriter.writeInExcel(template_excel, "output/result_2.xlsx");
})()