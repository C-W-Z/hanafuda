/**
 * @title 花札Hanafuda
 * @author C-W-Z
 * @contact chenweizhang3021@gmail.com
 * @language 繁體中文, 日本語
 * @repo https://github.com/C-W-Z/hanafuda.git
 * @copyright © 2023 C-W-Z
 */

/* Main Function */
window.onload = function()
{
    /* get canvas */
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    resize_canvas();
    // control settings
    canvas.onmousedown = click_func;
    window.onmousemove  = updateMouseXY;
    document.addEventListener('keydown', keydown_func);

    /* load Data */
    data = new Data();

    init_game();
    animate(startTime);
}

function click_func(event) {
    /* not left click */
    if (event.button != 0)
        return;

    updateMouseXY(event);

    if (game == null) return;
    switch (game.state) {
        case gameState.title:
            for (let i = 0; i < title_button.length; i++)
                title_button[i].check_press();
            devSource.check_press();
            break;
        case gameState.settings:
            back_button.check_press();
            for (let i = 0; i < settings_button.length; i++)
                settings_button[i].check_press();
            devSource.check_press();
            break;
        case gameState.player_select_hand:
            player[PLR].selected_handID = pointedPlayerHandIndex();
            if (player[PLR].selected_handID >= 0) {
                player_select_hand(player[PLR].selected_handID);
                game.state = gameState.player_select_field;
            }
            break;
        case gameState.player_select_field:
            player[PLR].selected_fieldID = pointedFieldIndex();
            if (player[PLR].selected_fieldID >= 0 &&
               (player[PLR].needToThrow && field.card[player[PLR].selected_fieldID] == -1) ||
                Math.floor(player[PLR].hand[player[PLR].selected_handID]/4) == Math.floor(field.card[player[PLR].selected_fieldID]/4)) {
                // 玩家出牌
                player_play_card(PLR, player[PLR].selected_handID, player[PLR].selected_fieldID);
            } else {
                let tmp = pointedPlayerHandIndex();
                if (tmp >= 0) {
                    // 選擇另一張手牌
                    player_unselect_hand(player[PLR].selected_handID);
                    player_select_hand(tmp);
                } else {
                    // 取消選擇
                    player_unselect_hand(player[PLR].selected_handID);
                    game.state = gameState.player_select_hand;
                }
            }
            break;
        case gameState.player_choose_card:
            // 抽牌後選擇場牌(有2張同月份牌時)
            player[PLR].selected_fieldID = pointedFieldIndex();
            if (Math.floor(player[PLR].draw_cardID/4) == Math.floor(field.card[player[PLR].selected_fieldID]/4)) {
                field.update_noticed(-1);
                draw_card_animation(PLR, player[PLR].draw_cardID, player[PLR].selected_fieldID, field.card[player[PLR].selected_fieldID]);
            }
            break;
        case gameState.player_decide_koi:
            end_button.check_press();
            koi_button.check_press();
            break;
        case gameState.month_end:
            if (game.month == data.MAXMONTH)
                to_result_button.check_press();
            else
                next_month_button.check_press();
            break;
        case gameState.game_result:
            home_button.check_press();
            break;
        default:
            break;
    }
}

function keydown_func(e) {
    const key = e.key;
    switch (key) {
        case 'r':
            resize_canvas();
            break;

        default:
            break;
    }
}

/* resize canvas */
function resize_canvas() {
    R = window.devicePixelRatio;
    canvas.width = SCREEN_W * R;
    canvas.height = SCREEN_H * R;
    // auto adaptive size by height
    scaleRate = self.innerHeight / SCREEN_H;
    canvas.style.width = SCREEN_W * scaleRate + 'px';
    canvas.style.height = SCREEN_H * scaleRate + 'px';
    // fix text position
    context.textAlign = "center";
    context.textBaseline = 'middle';
}

// get mouse coorfinates
function updateMouseXY(event) {
    var rect = event.target.getBoundingClientRect();
    if (scaleRate > 0) {
        mouse.x = (event.clientX - rect.left) / scaleRate;
        mouse.y = (event.clientY - rect.top ) / scaleRate;
    }
    //console.log(mouse);
}

function animate(time) {
    if (!startTime) // it's the first frame
        startTime = time || performance.now();

    // 清除整個canvas畫面
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    if (time_func != null)
        time_func(time);

    // 重畫整個畫面
    if (guessing)
        draw_guess_card();
    else if (game.state > gameState.ingame)
        draw_gaming();
    else
        draw_home_page();

    requestAnimationFrame(animate);
}

function draw_home_page() {
    switch (game.state) {
        case gameState.title:
            drawTitle();
            // draw Buttons
            for (let i = 0; i < title_button.length; i++)
                title_button[i].draw();
            break;
    
        case gameState.settings:
            setting_panel.draw();
            for (let i = 0; i < settings_button.length; i++)
                settings_button[i].draw();
            back_button.draw();
            break;
        default:
            break;
    }
    devSource.draw();
}

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

/* draw canvas when gaming */
function draw_gaming() {
    // draw the deck at center
    draw_card(CARD_BACK_ID, DECK_P.x, DECK_P.y);

    player[CPU].update_card_info();
    player[PLR].update_card_info();

    // draw the field cards
    field.update_card_info();
    for (let i = 0; i < FIELD_SPACE; i++) {
        if (field.card[i] >= 0)
            card[field.card[i]].draw();
        else if (player[PLR].selected_handID >= 0 && player[PLR].noticed[player[PLR].selected_handID] == false)
            draw_noticed(Field.X(i), Field.Y(i));
    }

    for (let i = 0; i < 2; i++) {
        // draw the collect cards of players
        for (const arr of player[i].collect)
            for (const c of arr)
                card[c].draw();
        // draw the hand cards of players
        for (const c of player[i].hand)
            card[c].draw();
    }

    // draw moving cards
    for (let i = 0; i < movingCard.length; i++)
        if (game.state != gameState.deal || (game.state == gameState.deal && card[movingCard[i]].px != DECK_P.x && card[movingCard[i]].py != DECK_P.y))
            card[movingCard[i]].draw();

    /* draw the information of this game */
    
    context.font = FONT_SIZE * R + "px 'Yuji Syuku', sans-serif";
    // 幾月
    if (data.month_yaku)
        month_panel.text = `${NUMBER[game.month]}月` + ` ${tuki_name[game.month-1]}`;
    else
        month_panel.text = `${NUMBER[game.month]}月`;
    month_panel.draw();

    // 親
    const circleY = (game.first == CPU) ? 30 : SCREEN_H - 30;
    context.beginPath();
    context.arc((SCREEN_W - 30) * R, circleY * R, 15 * R, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();
    context.strokeStyle = 'black';
    context.lineWidth = 3 * R;
    context.stroke();
    context.fillStyle = 'black';
    context.font = FONT_SIZE * R + "px 'Yuji Syuku', sans-serif";
    context.fillText("親", (SCREEN_W - 30) * R, circleY * R);

    // 文
    score_panel[PLR].text = `${player[PLR].total_money}文`;
    score_panel[CPU].text = `${player[CPU].total_money}文`;
    score_panel[PLR].draw();
    score_panel[CPU].draw();

    /* draw UI */
    switch (game.state) {
        case gameState.player_decide_koi:
            draw_decide_koi();
            break;
        case gameState.show_yaku_animation:
            banner.draw();
            break;
        case gameState.koikoi_animation:
            banner.text = 'こいこい';
            banner.draw();
            break;
        case gameState.month_end:
            draw_show_yaku();
            break;
        case gameState.game_result:
            draw_game_result();
            break;
        default:
            break;
    }
}

function init_game() {
    guessing = false;

    /* Card Imgs */
    for (let i = 0; i < CARD_NUM+1; i++)
        cardImg[i].src = `imgs/${i}.webp`;

    /* init game obj */
    game = new Game();
    game.state = gameState.title;

    /* init UI in game */
    create_UI();

    time_func = check_hover_home_buttons;
}

function create_UI() {
    let w, h;
    /* title */
    w = 150, h = 50;
    title_button[0] = new Button(SCREEN_W/2-w/2, SCREEN_H/2+(h+10)*1, w, h, 0, title_button_text[0], 40, start_game, '', '', 'black');
    title_button[1] = new Button(SCREEN_W/2-w/2, SCREEN_H/2+(h+10)*2, w, h, 0, title_button_text[1], 40, null, '', '', 'black');
    title_button[2] = new Button(SCREEN_W/2-w/2, SCREEN_H/2+(h+10)*3, w, h, 0, title_button_text[2], 40, null, '', '', 'black');
    title_button[3] = new Button(SCREEN_W/2-w/2, SCREEN_H/2+(h+10)*4, w, h, 0, title_button_text[3], 40, show_settings, '', '', 'black');

    back_button = new Button(SCREEN_W/2-w/2, SCREEN_H/2+(h+10)*4, w, h, 0, '返回', 40, back_to_title, '', '', 'black');

    /* 開發者 */
    w = FONT_SIZE*6, h = FONT_SIZE * 2;
    devSource = new Button(SCREEN_W - w, SCREEN_H - h, w, h, 0, '©C-W-Z', FONT_SIZE, ()=>{window.open('https://github.com/C-W-Z/hanafuda/','blank')}, '', '', 'black');

    w = 500, h = 450;
    setting_panel = new Button(SCREEN_W/2-w/2, SCREEN_H/2-h/2, w, h, 10);
    w = 300, h = 50;
    settings_button[0] = new Button(SCREEN_W/2-w/2, setting_panel.y+setting_panel.h/2-h*3.5, w, h, 10, settings_button_text[0], FONT_SIZE, resize_canvas, 'lightgray');
    settings_button[1] = new Button(SCREEN_W/2-w/2, setting_panel.y+setting_panel.h/2-h*1.5, w, h, 10, settings_button_text[1], FONT_SIZE, uploadData, 'lightgray');
    settings_button[2] = new Button(SCREEN_W/2-w/2, setting_panel.y+setting_panel.h/2+h*0.5, w, h, 10, settings_button_text[2], FONT_SIZE, downloadData, 'lightgray');
    settings_button[3] = new Button(SCREEN_W/2-w/2, setting_panel.y+setting_panel.h/2+h*2.5, w, h, 10, settings_button_text[3], FONT_SIZE, deleteData, 'red','black','red');

    /* in game */
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
}

function check_hover_home_buttons(time) {
    switch (game.state) {
        case gameState.title:
            for (let i = 0; i < title_button.length; i++)
                title_button[i].text = title_button[i].include(mouse) ? ('>  ' + title_button_text[i] + '  <') : title_button_text[i];
            break;
        case gameState.settings:
            back_button.text = back_button.include(mouse) ? ('>  返回  <') : '返回';
            break;
        default:
            break;
    }
    devSource.textColor = devSource.include(mouse) ? 'gold' : 'black';
}

/* init new game */
function start_game() {
    time_func = null;

    // init all cards
    card = new Array(CARD_NUM);
    for (let i = 0; i < CARD_NUM; i++)
        card[i] = new Card(i);

    // init field
    field = new Field();

    // init player & cpu
    player = new Array(2);
    player[PLR] = new Player(PLR); // player
    player[CPU] = new Player(CPU); // cpu

    // init moving cards array
    movingCard = new Array();

    // UI
    // 月份
    const w = FONT_SIZE + 10;
    const h = FONT_SIZE * (data.month_yaku ? 6 : 3) + 10;
    month_panel = new Button(5, SCREEN_H/2-h/2, w, h, 5);
    month_panel.vertical = true;

    // update data
    data.battleTime[data.MAXMONTH-1]++;

    // 決定親權 (0:player, 1:cpu)
    choose_first();
}

function choose_first() {
    game.state = gameState.decide_first;
    after_guess = after_choose_first;
    start_guess();
}

function after_choose_first() {
    game.first = guess_result;
    start_month();
}

function back_to_title() {
    game.state = gameState.title;
    time_func = check_hover_home_buttons;
}

function show_settings() {
    game.state = gameState.settings;
}