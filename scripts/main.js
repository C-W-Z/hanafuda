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
        case gameState.choose_rules:
            start_button.check_press();
            back_button.check_press();
            if (page > 0)
                page_button[0].check_press();
            if (page < rule_text.length-1)
                page_button[1].check_press();
            for (let i = 0; i < rule_text[page].length; i++)
            rule_button[page][i].check_press();
            break;
        case gameState.settings:
            back_button.check_press();
            for (let i = 0; i < settings_button.length; i++)
                settings_button[i].check_press();
            devSource.check_press();
            break;
        case gameState.statistic:
            if (page > 0)
                page_button[0].check_press();
            if (page < 1)
                page_button[1].check_press();
            back_button.check_press();
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
    }
}

function keydown_func(e) {
    const key = e.key;
    //console.log(key);
    switch (key) {
        case 'r':
            resize_canvas();
            break;
        case 'ArrowLeft':
            if ((game.state == gameState.choose_rules || game.state == gameState.statistic) && page > 0)
                page_button[0].press_func();
            break;
        case 'ArrowRight':
            if ((game.state == gameState.choose_rules && page < rule_text.length-1) || (game.state == gameState.statistic && page < statistic_text.length-1))
                page_button[1].press_func();
            break;
        case 'Escape':
            if ((game.state > gameState.title && game.state < gameState.ingame) || game.state == gameState.game_result)
                back_to_title();
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

    if (time_func != null)
        time_func(time);

    // 清除整個canvas畫面
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

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

        case gameState.choose_rules:
            draw_choose_rules();
            break;
    
        case gameState.settings:
            setting_panel.draw();
            for (let i = 0; i < settings_button.length; i++)
                settings_button[i].draw();
            back_button.draw();
            break;

        case gameState.statistic:
            draw_statistics();
            back_button.draw();
            break;
    }
    devSource.draw();
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

/* init new game */
function start_game() {
    time_func = null;
    // store data
    data.store();

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

    game.reset_game();

    // update data
    data.battleTime++;

    // 決定親權 (0:player, 1:cpu)
    game.first = Math.floor(Math.random() * 2);
    start_month();
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