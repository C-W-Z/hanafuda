function drawTitle() {
    // draw Card Images
    const gap = 120, h = 225;
    draw_rotate_card_large( 0, SCREEN_W/2 - gap * 1.8, h      , -Math.PI/ 8);
    draw_rotate_card_large( 8, SCREEN_W/2 - gap      , h - 30 , -Math.PI/16);
    draw_rotate_card_large(44, SCREEN_W/2 + gap * 1.8, h      ,  Math.PI/ 8);
    draw_rotate_card_large(40, SCREEN_W/2 + gap      , h - 30 ,  Math.PI/16);
    draw_rotate_card_large(28, SCREEN_W/2            , h - 45, 0);

    // draw Title
    const title_h = 200;
    context.strokeStyle = 'gold';
    context.lineWidth = 5 * R;
    context.fillStyle = 'black';
    context.font = 108 * R + "px 'Yuji Syuku', sans-serif";
    context.strokeText("花札", SCREEN_W/2 * R, title_h * R);
    context.fillText("花札", SCREEN_W/2 * R, title_h * R);
    context.strokeStyle = 'pink';
    context.font = 81 * R + "px 'Yuji Syuku', sans-serif";
    context.strokeText("こいこい", SCREEN_W/2 * R, (title_h+108/2+81/2) * R);
    context.fillText("こいこい", SCREEN_W/2 * R, (title_h+108/2+81/2) * R);
}

function create_UI() {
    let w, h;
    /* title */
    w = 150, h = 50;
    title_button[0] = new Button(SCREEN_W/2-w/2, SCREEN_H/2+(h+10)*1, w, h, 0, title_button_text[0], 40, show_choose_rules, '', '', 'black');
    title_button[1] = new Button(SCREEN_W/2-w/2, SCREEN_H/2+(h+10)*2, w, h, 0, title_button_text[1], 40, show_statistics, '', '', 'black');
    title_button[2] = new Button(SCREEN_W/2-w/2, SCREEN_H/2+(h+10)*3, w, h, 0, title_button_text[2], 40, null, '', '', 'black');
    title_button[3] = new Button(SCREEN_W/2-w/2, SCREEN_H/2+(h+10)*4, w, h, 0, title_button_text[3], 40, show_settings, '', '', 'black');

    back_button = new Button(SCREEN_W/2-w/2, SCREEN_H/2+(h+10)*4, w, h, 0, '戻る', 40, back_to_title, '', '', 'black');

    /* 開發者 */
    w = FONT_SIZE*6, h = FONT_SIZE * 2;
    devSource = new Button(SCREEN_W - w, SCREEN_H - h, w, h, 0, '©C-W-Z', FONT_SIZE, ()=>{window.open('https://github.com/C-W-Z/hanafuda/','blank');}, '', '', 'black');

    w = 500, h = 450;
    setting_panel = new Button(SCREEN_W/2-w/2, SCREEN_H/2-h/2, w, h, 10);
    w = 300, h = 50;
    settings_button[0] = new Button(SCREEN_W/2-w/2, setting_panel.y+setting_panel.h/2-h*3.5, w, h, 10, settings_button_text[0], FONT_SIZE, resize_canvas, 'lightgray');
    settings_button[1] = new Button(SCREEN_W/2-w/2, setting_panel.y+setting_panel.h/2-h*1.5, w, h, 10, settings_button_text[1], FONT_SIZE, uploadData, 'lightgray');
    settings_button[2] = new Button(SCREEN_W/2-w/2, setting_panel.y+setting_panel.h/2+h*0.5, w, h, 10, settings_button_text[2], FONT_SIZE, downloadData, 'lightgray');
    settings_button[3] = new Button(SCREEN_W/2-w/2, setting_panel.y+setting_panel.h/2+h*2.5, w, h, 10, settings_button_text[3], FONT_SIZE, deleteData, 'red','black','red');

    w = 940, h = 500;
    statistic_panel = new Button(SCREEN_W/2-w/2, SCREEN_H/2-h/2-20, w, h, 10);
    w = 40, h = 50;
    page_button[0] = new Button(statistic_panel.x-w-20, statistic_panel.y+statistic_panel.h/2, w, h, 5, '<', 32, ()=>{page--;});
    page_button[1] = new Button(statistic_panel.x+statistic_panel.w+20, statistic_panel.y+statistic_panel.h/2, w, h, 5, '>', 32, ()=>{page++;});

    /* choose rules */
    w = back_button.w, h = back_button.h;
    start_button = new Button(SCREEN_W/2-w/2, SCREEN_H/2+(h+10)*3, w, h, 0, '開始', 40, start_game, '', '', 'black');
    w = 800, h = 450;
    choose_rule_panel = new Button(SCREEN_W/2-w/2, SCREEN_H/2-h/2-start_button.h-10, w, h, 10);

    rule_button = new Array(rule_text.length);
    for (let i = 0; i < rule_text.length; i++)
        rule_button[i] = new Array(rule_text[i].length);

    const fontsize = 30;
    w = fontsize * 4 + 2, h = fontsize + 2;
    const padding = 50, rx = choose_rule_panel.x + choose_rule_panel.w - w - padding;
    for (let p = 0; p < rule_text.length; p++)
        for (let i = 0; i < rule_text[p].length; i++)
            rule_button[p][i] = new Button(rx, choose_rule_panel.y+padding + (choose_rule_panel.h-padding*2-fontsize)/(rule_text[p].length-1) * i, w, h, 5, '', FONT_SIZE, ()=>{rule_change(i)}, 'lightgray');

    set_rule_buttons();
    rule_button[5][3].text = rule_button[5][4].text = '✘';
    rule_button[5][3].borderColor = rule_button[5][4].borderColor = '';

//#region in game UI
    // 文
    w = 60, h = 35;
    score_panel[CPU] = new Button(5, 5, w, h, 5, '0文', 20);
    score_panel[PLR] = new Button(5, SCREEN_H-h-5, w, h, 5, '0文', 20);
    // the size of panel of decide koi
    w = 400, h = 200;
    koi_panel = new Button(SCREEN_W/2-w/2, SCREEN_H/2-h/2, w, h, 10);
    end_button = new Button(SCREEN_W/2-w/2+w/8-w/24, SCREEN_H/2 + h/8, w/3, h/4, 10, "あがり", 24, ()=>{player_win_month(PLR);}, 'lightgray');
    koi_button = new Button(SCREEN_W/2+w/2-w/8+w/24-w/3, SCREEN_H/2 + h/8, w/3, h/4, 10, "こいこい", 24, ()=>{koikoi(PLR);}, 'lightgray');
    // the size of banner
    w = SCREEN_W + 20, h = 100;
    banner = new Button(-10, SCREEN_H/2-h/2, w, h, 0, '', 52, null);
    // the size of the panel of showing yaku and score
    w = 400, h = 400;
    yaku_panel = new Button(SCREEN_W/2-w/2, SCREEN_H/2-h/2 - 50/2, w, h, 10);
    // the size of restart button
    w = 400, h = 50;
    next_month_button = new Button(yaku_panel.x, yaku_panel.y+yaku_panel.h + 5, yaku_panel.w, h, 10, '次の対局へ', FONT_SIZE, start_month);
    to_result_button = new Button(yaku_panel.x, yaku_panel.y+yaku_panel.h + 5, yaku_panel.w, h, 10, '対局結果へ', FONT_SIZE, result_game);
    // the size of  result panel
    w = 400, h = 480;
    result_panel = new Button(SCREEN_W/2-w/2, SCREEN_H/2-h/2, w, h, 10);
    w = 400, h = 50;
    home_button = new Button(result_panel.x, result_panel.y+result_panel.h + 5, result_panel.w, h, 10, '回首頁', FONT_SIZE, back_to_title);
//#endregion
}

function check_hover_home_buttons(time) {
    switch (game.state) {
        case gameState.title:
            for (let i = 0; i < title_button.length; i++)
                title_button[i].text = title_button[i].include(mouse) ? ('>  ' + title_button_text[i] + '  <') : title_button_text[i];
            break;
        case gameState.choose_rules:
            start_button.text = start_button.include(mouse) ? '>  開始  <' : '開始';
        case gameState.settings:
        case gameState.statistic:
            back_button.text = back_button.include(mouse) ? '>  戻る  <' : '戻る';
            break;
    }
    devSource.textColor = devSource.include(mouse) ? 'gold' : 'black';
}

function back_to_title() {
    game.state = gameState.title;
    time_func = check_hover_home_buttons;
}

function show_settings() {
    game.state = gameState.settings;
}

function show_statistics() {
    page = 0;
    game.state = gameState.statistic;
}

const statistic_text = [
    [['対戦回数','総月数','総獲得文数','最高獲得総文数','月最高獲得文数','月平均獲得文数','7文以上確率','被7文以上率','こいこい率','こいこい成功率','こいこい阻止率'],
    ['勝利数','敗北数','勝率','勝利月数','敗北月数','月勝率','最大連勝数','最大連敗数','最大連勝月数','最大連敗月数']],
    [["五光","四光","雨四光","三光","松桐坊主","表菅原","飲み","花見で一杯","月見で一杯","猪鹿蝶","五鳥"],
    ["七短","六短","赤短・青短","赤短","青短","草","月札","タネ","短冊","カス","親権"]]
];

function draw_statistics() {
    statistic_panel.draw();

    context.fillStyle = 'white';
    const fontsize = 30;
    context.textAlign = 'left';
    context.font = fontsize * R + "px 'Yuji Syuku', sans-serif";
    const lx = SCREEN_W/4+SCREEN_W/16, rx = SCREEN_W*3/4-SCREEN_W/16, y = 120, xgap = 200, ygap = fontsize + 10;

    for (let i = 0; i < statistic_text[page][0].length; i++)
        context.fillText(statistic_text[page][0][i], (lx-xgap)*R, (y+ygap*i)*R);
    for (let i = 0; i < statistic_text[page][1].length; i++)
        context.fillText(statistic_text[page][1][i], (rx-xgap)*R, (y+ygap*i)*R);

    context.textAlign = 'right';

    const text = [
        [[
            `${data.battleTime}回`,
            `${data.battleMonth}月`,
            `${data.totalMoney[PLR]}文`,
            `${data.maxTotalMoney[PLR]}文`,
            `${data.maxMoneyMonth[PLR]}文`,
            `${data.battleMonth > 0 ? (data.totalMoney[PLR] / data.battleMonth).toFixed(1) : 0}文`,
            `${data.battleMonth > 0 ? (100 * data.sevenUpTime[PLR] / data.battleMonth).toFixed(1) : 0}%`,
            `${data.battleMonth > 0 ? (100 * data.sevenUpTime[CPU] / data.battleMonth).toFixed(1) : 0}%`,
            `${data.canKoiTime[PLR]   > 0 ? (100 * data.totalKoiTime[PLR] / data.canKoiTime[PLR]).toFixed(1) : 0}%`,
            `${data.totalKoiTime[PLR] > 0 ? (100 * data.koiSucessTime[PLR] / data.totalKoiTime[PLR]).toFixed(1) : 0}%`,
            `${data.totalKoiTime[CPU] > 0 ? (100 * (1 - data.koiSucessTime[CPU] / data.totalKoiTime[CPU])).toFixed(1) : 0}%`
        ],[
            `${data.totalWin[PLR]}回`,
            `${data.totalWin[CPU]}回`,
            `${data.battleTime > 0 ? (100 * data.totalWin[PLR] / data.battleTime).toFixed(1) : 0}%`,
            `${data.winMonth[PLR]}月`,
            `${data.winMonth[CPU]}月`,
            `${data.battleMonth > 0 ? (100 * data.winMonth[PLR] / data.battleMonth).toFixed(1):0}%`,
            `${data.totalMaxStreak[PLR]}回`,
            `${data.totalMaxStreak[CPU]}回`,
            `${data.maxStreakMonth[PLR]}月`,
            `${data.maxStreakMonth[CPU]}月`
        ]],
        [[
            `${data.yakuTime[PLR][1]}回`,
            `${data.yakuTime[PLR][2]}回`,
            `${data.yakuTime[PLR][3]}回`,
            `${data.yakuTime[PLR][4]}回`,
            `${data.yakuTime[PLR][5]}回`,
            `${data.yakuTime[PLR][6]}回`,
            `${data.yakuTime[PLR][7]}回`,
            `${data.yakuTime[PLR][8]}回`,
            `${data.yakuTime[PLR][9]}回`,
            `${data.yakuTime[PLR][10]}回`,
            `${data.yakuTime[PLR][11]}回`
        ],[
            `${data.yakuTime[PLR][12]}回`,
            `${data.yakuTime[PLR][13]}回`,
            `${data.yakuTime[PLR][14]}回`,
            `${data.yakuTime[PLR][15]}回`,
            `${data.yakuTime[PLR][16]}回`,
            `${data.yakuTime[PLR][17]}回`,
            `${data.yakuTime[PLR][18]}回`,
            `${data.yakuTime[PLR][19]}回`,
            `${data.yakuTime[PLR][20]}回`,
            `${data.yakuTime[PLR][21]}回`,
            `${data.yakuTime[PLR][0]}回`
        ]]
    ];

    for (let i = 0; i < text[page][0].length; i++)
        context.fillText(text[page][0][i], (lx+xgap)*R, (y+ygap*i)*R);
    for (let i = 0; i < text[page][1].length; i++)
        context.fillText(text[page][1][i], (rx+xgap)*R, (y+ygap*i)*R);

    context.textAlign = 'center';

    if (page > 0)
        page_button[0].draw();
    if (page < 1)
    page_button[1].draw();
}

function show_choose_rules() {
    page = 0;
    game.state = gameState.choose_rules;
}

const rule_text = [
    ['AI Level','ゲーム月','月札','親の交代','親権','Bonus'],
    ['飲み(鉄砲)(花月見)','花見で一杯','月見で一杯','雨流れ','霧流れ','花見、月見で一杯はBonus','花見、月見で一杯、飲みの文の蓄積'],
    ['五光','四光','雨四光','三光','三、雨四、四、五光の文の蓄積'],
    ['松桐坊主','表菅原(梅松桜)','猪鹿蝶','五鳥(ごとり)','草(草短)','「菊に盃」は「カス」としても使えます'],
    ['赤短・青短(ぶっく)','赤短','青短','赤短、青短、赤短・青短の文の蓄積','七短','六短','短冊、六短、七短の文の蓄積'],
    ['タネ','短冊','カス','手四','喰付']
];

function draw_choose_rules() {
    choose_rule_panel.draw();
    start_button.draw();
    back_button.draw();
    if (page > 0)
        page_button[0].draw();
    if (page < rule_text.length-1)
        page_button[1].draw();

    context.fillStyle = 'white';
    const fontsize = 30;
    context.textAlign = 'left';
    context.font = fontsize * R + "px 'Yuji Syuku', sans-serif";

    const padding = 50, lx = choose_rule_panel.x + padding, y = choose_rule_panel.y, h = choose_rule_panel.h;
    for (let i = 0; i < rule_text[page].length; i++)
        context.fillText(rule_text[page][i], lx * R, (y+padding+fontsize/2 + (h-padding*2-fontsize)/(rule_text[page].length-1) * i) * R);

    context.textAlign = 'center';
    
    for (let i = 0; i < rule_button[page].length; i++)
        rule_button[page][i].draw();
}

function rule_change(i) {
    switch (page) {
        case 0:
            switch (i) {
                case 0:
                    if (data.cpuLevel < 3) data.cpuLevel++;
                    else data.cpuLevel = 0;
                    rule_button[page][i].text = `Lv${data.cpuLevel}`;
                    break;
                case 1:
                    if (data.MAXMONTH == 1) data.MAXMONTH = 3;
                    else if (data.MAXMONTH == 3) data.MAXMONTH = 6;
                    else if (data.MAXMONTH == 6) data.MAXMONTH = 12;
                    else data.MAXMONTH = 1;
                    rule_button[page][i].text = `${data.MAXMONTH}ヶ月`
                    if (data.MAXMONTH != 12) data.month_yaku = false;
                    rule_button[0][2].text = data.month_yaku ? `${data.yaku_score[18]}文` : '✘';
                    break;
                case 2:
                    if (!data.month_yaku && data.MAXMONTH == 12) data.month_yaku = true;
                    else data.month_yaku = false;
                    rule_button[page][i].text = data.month_yaku ? `${data.yaku_score[18]}文` : '✘';
                    break;
                case 3:
                    data.first_change = !data.first_change;
                    rule_button[0][3].text = data.first_change ? '順番' : '勝者';
                    break;
                case 4:
                    data.first_priority = !data.first_priority;
                    rule_button[page][i].text = data.first_priority ? `${data.yaku_score[0]}文` : '✘';
                    break;
                case 5:
                    if (data.koi_bonus) {
                        data.koi_bonus = false;
                        data.seven_bonus = true;
                    } else if (data.seven_bonus) {
                        data.koi_bonus = false;
                        data.seven_bonus = false;
                    } else {
                        data.koi_bonus = true;
                        data.seven_bonus = false;
                    }
                    rule_button[0][5].text = data.koi_bonus ? 'こいこい倍' : (data.seven_bonus ? '7点倍' : '無');
            }
            break;
        case 1:
            switch (i) {
                case 0:
                    if (!data.flower_moon_sake) data.yaku_score[7] = 3, data.flower_moon_sake = true;
                    else if (data.flower_moon_sake && data.yaku_score[7] == 3) data.yaku_score[7] = 5;
                    else if (data.flower_moon_sake && data.yaku_score[7] == 5) data.yaku_score[7] = 6;
                    else data.flower_moon_sake = data.flower_moon_sake_accumulate = false, rule_button[1][6].text = '✘';
                    rule_button[page][i].text = data.flower_moon_sake ? `${data.yaku_score[7]}文` : '✘';
                    break;
                case 1:
                    if (!data.flower_sake) data.yaku_score[8] = 2, data.flower_sake = true;
                    else if (data.flower_sake && data.yaku_score[8] == 2) data.yaku_score[8] = 3;
                    else if (data.flower_sake && data.yaku_score[8] == 3) data.yaku_score[8] = 5;
                    else data.flower_sake = false;
                    rule_button[page][i].text = data.flower_sake ? `${data.yaku_score[8]}文` : '✘';
                    if (!data.flower_sake && !data.moon_sake) {
                        data.rain_rule = data.fog_rule = data.flower_moon_sake_bonus = data.flower_moon_sake_accumulate = false;
                        rule_button[1][3].text = '✘';
                        rule_button[1][4].text = '✘';
                        rule_button[1][5].text = '✘';
                        rule_button[1][6].text = '✘';
                    }
                    break;
                case 2:
                    if (!data.moon_sake) data.yaku_score[9] = 2, data.moon_sake = true;
                    else if (data.moon_sake && data.yaku_score[9] == 2) data.yaku_score[9] = 3;
                    else if (data.moon_sake && data.yaku_score[9] == 3) data.yaku_score[9] = 5;
                    else data.moon_sake = false;
                    rule_button[page][i].text = data.moon_sake ? `${data.yaku_score[9]}文` : '✘';
                    if (!data.flower_sake && !data.moon_sake) {
                        data.rain_rule = data.fog_rule = data.flower_moon_sake_bonus = data.flower_moon_sake_accumulate = false;
                        rule_button[1][3].text = '✘';
                        rule_button[1][4].text = '✘';
                        rule_button[1][5].text = '✘';
                        rule_button[1][6].text = '✘';
                    }
                    break;
                case 3:
                    if (data.flower_sake || data.moon_sake)
                        data.rain_rule = !data.rain_rule;
                    rule_button[1][3].text = data.rain_rule ? '✔' : '✘';
                    break;
                case 4:
                    if (data.flower_sake || data.moon_sake)
                        data.fog_rule = !data.fog_rule;
                    rule_button[1][4].text = data.fog_rule ? '✔' : '✘';
                    break;
                case 5:
                    if (data.flower_sake || data.moon_sake)
                        data.flower_moon_sake_bonus = !data.flower_moon_sake_bonus;
                    rule_button[1][5].text = data.flower_moon_sake_bonus ? '✔' : '✘';
                    break;
                case 6:
                    if (data.flower_moon_sake && (data.flower_sake || data.moon_sake))
                        data.flower_moon_sake_accumulate = !data.flower_moon_sake_accumulate;
                    rule_button[1][6].text = data.flower_moon_sake_accumulate ? '✔' : '✘';
                    break;
            }
            break;
        case 2:
            switch (i) {
                case 0:
                    if (data.yaku_score[1] == 10) data.yaku_score[1] = 15;
                    else data.yaku_score[1] = 10;
                    rule_button[page][i].text = `${data.yaku_score[1]}文`;
                    break;
                case 1:
                    if (data.yaku_score[2] == 8) data.yaku_score[2] = 10;
                    else data.yaku_score[2] = 8;
                    rule_button[page][i].text = `${data.yaku_score[2]}文`;
                    break;
                case 2:
                    if (data.yaku_score[3] == 7) data.yaku_score[3] = 8;
                    else data.yaku_score[3] = 7;
                    rule_button[page][i].text = `${data.yaku_score[3]}文`;
                    break;
                case 3:
                    if (data.yaku_score[4] == 5) data.yaku_score[4] = 6;
                    else data.yaku_score[4] = 5;
                    rule_button[page][i].text = `${data.yaku_score[4]}文`;
                    break;
                case 4:
                    data.light_accumulate = !data.light_accumulate;
                    rule_button[page][i].text = data.light_accumulate ? '✔' : '✘';
                    break;
            }
            break;
        case 3:
            switch (i) {
                case 0:
                    data.matsukiribozu = !data.matsukiribozu;
                    rule_button[3][0].text = data.matsukiribozu ? `${data.yaku_score[5]}文` : '✘';
                    break;
                case 1:
                    data.sugawara = !data.sugawara;
                    rule_button[3][1].text = data.sugawara ? `${data.yaku_score[6]}文` : '✘';
                    break;
                case 2:
                    data.inoshikacho = !data.inoshikacho;
                    rule_button[3][2].text = data.inoshikacho ? `${data.yaku_score[10]}文` : '✘';
                    break;
                case 3:
                    data.five_bird = !data.five_bird;
                    rule_button[3][3].text = data.five_bird ? `${data.yaku_score[11]}文` : '✘';
                    break;
                case 4:
                    data.grass = !data.grass;
                    rule_button[3][4].text = data.grass ? `${data.yaku_score[17]}文` : '✘';
                    break;
                case 5:
                    data.kiku_dross = !data.kiku_dross;
                    rule_button[3][5].text = data.kiku_dross ? '✔' : '✘';
                    break;
            }
            break;
        case 4:
            switch (i) {
                case 0:
                    if (!data.akatan_aotan) data.akatan_aotan = true, data.yaku_score[14] = 4;
                    else if (data.yaku_score[14] == 4) data.yaku_score[14] = 10;
                    else data.akatan_aotan = data.akatan_aotan_accumulate = false, rule_button[4][3].text = '✘';
                    rule_button[4][0].text = data.akatan_aotan ? `${data.yaku_score[14]}文` : '✘';
                    break;
                case 1:
                    if (!data.akatan) data.akatan = true, data.yaku_score[15] = 5;
                    else if (data.yaku_score[15] == 5) data.yaku_score[15] = 6;
                    else data.akatan = false;
                    rule_button[4][1].text = data.akatan ? `${data.yaku_score[15]}文` : '✘';
                    if (!data.akatan && !data.aotan) {
                        data.akatan_aotan_accumulate = false;
                        rule_button[4][3].text = '✘';
                    }
                    break;
                case 2:
                    if (!data.aotan) data.aotan = true, data.yaku_score[16] = 5;
                    else if (data.yaku_score[16] == 5) data.yaku_score[16] = 6;
                    else data.aotan = false;
                    rule_button[4][2].text = data.aotan ? `${data.yaku_score[16]}文` : '✘';
                    if (!data.akatan && !data.aotan) {
                        data.akatan_aotan_accumulate = false;
                        rule_button[4][3].text = '✘';
                    }
                    break;
                case 3:
                    if (data.akatan_aotan && (data.akatan || data.aotan))
                        data.akatan_aotan_accumulate = !data.akatan_aotan_accumulate;
                    rule_button[4][3].text = data.akatan_aotan_accumulate ? '✔' : '✘';
                    break;
                case 4:
                    data.seven_tan = !data.seven_tan;
                    rule_button[4][4].text = data.seven_tan ? `${data.yaku_score[12]}文` : '✘';
                    if (!data.seven_tan && !data.six_tan) {
                        data.tan_accumulate = false;
                        rule_button[4][6].text = '✘';
                    }
                    break;
                case 5:
                    data.six_tan = !data.six_tan;
                    rule_button[4][5].text = data.six_tan ? `${data.yaku_score[13]}文` : '✘';
                    if (!data.seven_tan && !data.six_tan) {
                        data.tan_accumulate = false;
                        rule_button[4][6].text = '✘';
                    }
                    break;
                case 6:
                    if (data.seven_tan || data.six_tan)
                        data.tan_accumulate = !data.tan_accumulate;
                    rule_button[4][6].text = data.tan_accumulate ? '✔' : '✘';
                    break;
            }
            break;
        case 5:
            switch (i) {
                case 0:
                    if (data.yaku_score[19] == 1) data.yaku_score[19] = 2;
                    else data.yaku_score[19] = 1;
                    rule_button[5][0].text = `${data.yaku_score[19]}文`;
                    break;
                case 1:
                    if (data.yaku_score[20] == 1) data.yaku_score[20] = 2;
                    else data.yaku_score[20] = 1;
                    rule_button[5][1].text = `${data.yaku_score[20]}文`;
                    break;
                case 2:
                    if (data.yaku_score[21] == 1) data.yaku_score[21] = 2;
                    else data.yaku_score[21] = 1;
                    rule_button[5][2].text = `${data.yaku_score[21]}文`;
                    break;
            }
            break;
    }
}

function set_rule_buttons() {
    rule_button[0][0].text = `Lv${data.cpuLevel}`;
    rule_button[0][1].text = `${data.MAXMONTH}ヶ月`;
    rule_button[0][2].text = data.month_yaku ? `${data.yaku_score[18]}文` : '✘';
    rule_button[0][3].text = data.first_change ? '順番' : '勝者';
    rule_button[0][4].text = data.first_priority ? `${data.yaku_score[0]}文` : '✘';
    rule_button[0][5].text = data.koi_bonus ? 'こいこい倍' : (data.seven_bonus ? '7点倍' : '無');

    rule_button[1][0].text = data.flower_moon_sake ? `${data.yaku_score[7]}文` : '✘';
    rule_button[1][1].text = data.flower_sake ? `${data.yaku_score[8]}文` : '✘';
    rule_button[1][2].text = data.flower_sake ? `${data.yaku_score[9]}文` : '✘';
    rule_button[1][3].text = data.rain_rule ? '✔' : '✘';
    rule_button[1][4].text = data.fog_rule ? '✔' : '✘';
    rule_button[1][5].text = data.flower_moon_sake_bonus ? '✔' : '✘';
    rule_button[1][6].text = data.flower_moon_sake_accumulate ? '✔' : '✘';

    rule_button[2][0].text = `${data.yaku_score[1]}文`;
    rule_button[2][1].text = `${data.yaku_score[2]}文`;
    rule_button[2][2].text = `${data.yaku_score[3]}文`;
    rule_button[2][3].text = `${data.yaku_score[4]}文`;
    rule_button[2][4].text = data.light_accumulate ? '✔' : '✘';

    rule_button[3][0].text = data.matsukiribozu ? `${data.yaku_score[5]}文` : '✘';
    rule_button[3][1].text = data.sugawara ? `${data.yaku_score[6]}文` : '✘';
    rule_button[3][2].text = data.inoshikacho ? `${data.yaku_score[10]}文` : '✘';
    rule_button[3][3].text = data.five_bird ? `${data.yaku_score[11]}文` : '✘';
    rule_button[3][4].text = data.grass ? `${data.yaku_score[17]}文` : '✘';
    rule_button[3][5].text = data.kiku_dross ? '✔' : '✘';

    rule_button[4][0].text = data.akatan_aotan ? `${data.yaku_score[14]}文` : '✘';
    rule_button[4][1].text = data.akatan ? `${data.yaku_score[15]}文` : '✘';
    rule_button[4][2].text = data.aotan ? `${data.yaku_score[16]}文` : '✘';
    rule_button[4][3].text = data.akatan_aotan_accumulate ? '✔' : '✘';
    rule_button[4][4].text = data.seven_tan ? `${data.yaku_score[12]}文` : '✘';
    rule_button[4][5].text = data.six_tan ? `${data.yaku_score[13]}文` : '✘';
    rule_button[4][6].text = data.tan_accumulate ? '✔' : '✘';

    rule_button[5][0].text = `${data.yaku_score[19]}文`;
    rule_button[5][1].text = `${data.yaku_score[20]}文`;
    rule_button[5][2].text = `${data.yaku_score[21]}文`;
}