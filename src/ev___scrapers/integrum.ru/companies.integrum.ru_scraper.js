const fs = require("fs");
const path = require("path");
const {browser_open} = require("../../ev___tools/puppeteerBrowser/f_puppeteer_browser.js");


const timeout = ms => new Promise(r => setTimeout(r, ms));


const skip_and_goto = async (browser_page, page_num = 1, time = 10000) => {

    let last_page = null;
    let counter = 0;

    while (true) {

        console.log("search page number:", page_num, "iteration:", ++counter);

        //| получаем список handlers кнопок пагинации
        let handlers = await browser_page.$$(".i-pagination > ul > li");

        //| получаем handler всех кнопок пагинации
        for (let i = 0; i < handlers.length; i++) {
            let buff = await browser_page.evaluate(link => {
                return {
                    className: link.className,
                    textContent: link.textContent.replace(/[^.\d]+/g, "").toLowerCase()
                }
            }, handlers[i]);
            handlers[i] = {
                handle: handlers[i],
                ...buff
            }
        }

        //| определяем, если ли среди них нужная, если да возвращаем ее
        for (let handle of handlers) {
            if (handle && handle.textContent === String(page_num)) {
                return {
                    page: handle,
                    flag: true
                }
            }
        }

        //| записываем посленюю страницу в буффер
        last_page = handlers[handlers.length - 2].textContent;


        //| если мы не на последней странице, то переходим на нее.
        await handlers[handlers.length - 2].handle.click();
        await browser_page.waitForNetworkIdle({idleTime: 1000, timeout: 120000});
    }
}



// main function
(async function start() {

    //| запуск браузера
    const browser = await browser_open(false, __dirname);
    let page = await browser.newPage();


    //| {'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2'}
    //| загружаемся на сайт
    await page.goto("https://companies.integrum.ru/selection", {waitUntil: "networkidle2"});

    //| проверяем наличие селектора на странице | возможно регистрация не потребуется
    let login_handle = await page.$("input[name=UserLogin]");

    //| регистрация на странице
    if (login_handle) {

        //| вводим логин, пароль.
        await page.$eval("input[name=UserLogin]", input => input.value = "EverestKons1");
        await page.$eval("input[name=UserPassword]", input => input.value = "kawov436");

        //| дожидаемся загрузки после нажатия кнопки "Войти"
        await Promise.all([
            page.click("input[name=LoginBtn]"),
            page.waitForNavigation({waitUntil: "networkidle2"}) //| Бл, работает только внутри Promise.all
        ]);

    }

    //| скрываем банер
    let banner_handle = await page.$("#jvlabelWrap");
    if (banner_handle) await page.$eval("#jvlabelWrap", b => b.style.display = "none");


    //| выбираем "исключить неактивные компании (недействующие)"
    await page.waitForSelector("#ctl00_CPH1_SimpleSearchForm1_SimpleSearchPanel1_ExcludeNotActiveChk");
    await page.click("#ctl00_CPH1_SimpleSearchForm1_SimpleSearchPanel1_ExcludeNotActiveChk");


    //| переходим на вкладку "Учредители"
    await page.waitForSelector("#ctl00_CPH1_SimpleSearchForm1_FoundersSearch");
    await page.click("#ctl00_CPH1_SimpleSearchForm1_FoundersSearch");


    //| выбираем "нерезиденты"
    await page.waitForSelector("#ctl00_CPH1_FoundersSearchForm1_ctl00_FounderType2");
    await page.click("#ctl00_CPH1_FoundersSearchForm1_ctl00_FounderType2");


    //| кликаем "Поиск" | дожидаемся загрузки данных
    await page.waitForSelector("#ctl00_CPH1_FoundersSearchForm1_SimpleSearchPanel1_SearchBtn");
    await Promise.all([
        page.click("#ctl00_CPH1_FoundersSearchForm1_SimpleSearchPanel1_SearchBtn"),
        page.waitForNavigation({waitUntil: "networkidle2"})
    ]);


    //| флаг пагинации конца пагинации
    let pagination_the_end_flag = false;
    let while_counter = 0;


    //| переходим на ту стр, с которой остановились
    const last_page_number = 102;
    let handle_page = await skip_and_goto(page, last_page_number);
    if (
        handle_page &&
        handle_page.page &&
        handle_page.flag
    ){
        await handle_page.page.handle.click();
        await page.waitForNetworkIdle({idleTime: 3000, timeout: 120000});
        while_counter = last_page_number;
    }


    //| запускаем пагинацию по сайту
    while (!pagination_the_end_flag) {

        console.log("iteration ", ++while_counter);


        //| функция перемотки на стр. остановки
        // let b_page = await skip_and_goto(page, 50);
        // await b_page.click();
        // await timeout(3000);


        //| создаем директорию для загрузки файлов на каждой итерации
        //| наверное лучше привязаться не к итерации, а к номеру страницы, но как...
        let download_folder = path.resolve(__dirname, "download", String(while_counter));

        if (!fs.existsSync(download_folder)) {
            //| создаем директорию для сейва
            fs.mkdirSync(download_folder);
        }


        //| изменяем директорию сохранения по умолчанию.
        const client = await page.target().createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: download_folder,
        });


        //| выбираем все checkboxes
        await page.$$eval(
            ".progress-container input[type=checkbox]",
            inputs => inputs.map(input => input.checked = true)
        );


        //| выбираем первый checkbox 2 раза, чтобы появилась кнопка "Добавить"
        let checkbox_handles = await page.$(".progress-container input[type=checkbox]");
        if (checkbox_handles) await checkbox_handles.click();
        if (checkbox_handles) await checkbox_handles.click();
        await timeout(500);

        //| добавляем в список на выгрузку
        await page.waitForSelector("#ctl00_ContentPlaceHolder2__addToBasketButton");
        await page.click("#ctl00_ContentPlaceHolder2__addToBasketButton");
        await page.waitForNetworkIdle();

        //| открываем меню выгрузки
        await page.click("#ctl00_ContentPlaceHolder2_ExcelBtn");
        await timeout(500);

        //| выбираем текущую выборку
        await page.waitForSelector("#ctl00_ContentPlaceHolder2__exportBasketResultRadio")
        await page.click("#ctl00_ContentPlaceHolder2__exportBasketResultRadio");
        await timeout(600);


        //| открываем меню параметров отчета
        try {
            await page.waitForSelector("#ctl00_ContentPlaceHolder2_ShowCustomBtn");
            await page.click("#ctl00_ContentPlaceHolder2_ShowCustomBtn");
        } catch (err) {
            console.log(err)
        }
        await timeout(600);

        //| выбираем все параметры
        await page.waitForSelector("#ctl00_ContentPlaceHolder2_Panel2 input[type=checkbox]");
        await page.$$eval(
            "#ctl00_ContentPlaceHolder2_Panel2 input[type=checkbox]",
            inputs => inputs.map(input => input.checked = true)
        );
        await timeout(500);


        //| Нажимаем загрузить
        await page.click("#ctl00_ContentPlaceHolder2_ShowReportBtn1");
        await timeout(16000);


        //| убираем галочки с input boxes
        await page.$$eval(
            ".progress-container input[type=checkbox]",
            inputs => inputs.map(input => input.checked = false)
        );


        //| Клик "посмотреть выборку"
        try {
            await page.click("#ctl00_ContentPlaceHolder2__viewBasktButton");
        } catch (err) {
            console.log(err);
        }
        await page.waitForNetworkIdle();


        //| Клик "Очистить выборку"
        try {
            await page.waitForSelector("#_clearBasketLink");
            await page.click("#_clearBasketLink");
        } catch (err) {
            console.log(err);
        }
        await page.waitForNetworkIdle();


        //| закрываем меню
        // await page.waitForSelector("#_saveButton");
        try {
            await page.click("#_saveButton", {button: "left"});
        } catch (err) {
            console.log(err);
        }


        await timeout(1000);

        //| получаем список handlers кнопок пагинации
        let handlers = await page.$$(".i-pagination > ul > li");


        //| запускаем цикл по handlers
        //| преобразуем, добавляем класс и контент
        for (let i = 0; i < handlers.length; i++) {
            let buff = await page.evaluate(link => {
                return {
                    className: link.className,
                    content: link.textContent.replace(/[^.\d]+/g, "")
                }
            }, handlers[i]);
            handlers[i] = {
                handle: handlers[i],
                ...buff
            }
        }


        let next_handle = null;

        for (let i = 0; i < handlers.length; i++) {

            //| если класс предыдущего handle = "active"
            //| значит текущий handle кнопка перехода на след. стр.
            if (
                handlers[i - 1] &&
                handlers[i - 1].className.toLowerCase() === "active"
            ) {

                if (handlers[i].className.toLowerCase() === "last") {
                    pagination_the_end_flag = true;
                    break;
                }

                next_handle = handlers[i];
                break;

            }

        }


        //| завершаем пагинацию если флаг включен.
        if (pagination_the_end_flag) {
            console.log("Загрузка завершена");
            break;
        }

        console.log("iteration ", while_counter, "- complete");

        let time = performance.now();

        //| переходим на следующую страницу
        await next_handle.handle.click();
        await page.waitForNetworkIdle({idleTime: 3000, timeout: 120000});

        time = performance.now() - time;
        console.log("время пагинации (сек.):", time);
    }

})()