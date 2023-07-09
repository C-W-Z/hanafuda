/**
 * @title 花札Hanafuda
 * @author C-W-Z
 * @contact chenweizhang3021@gmail.com
 * @language 繁體中文, 日本語
 * @repo https://github.com/C-W-Z/Hanafuda.git
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
    document.addEventListener('keydown', keydown_func);
    // right click menu
    menu = document.getElementById("menu");
    resize_menu();
    window.oncontextmenu = right_click_menu;
    window.onclick = hide_menu;
    window.addEventListener('resize', resize_menu);
    // set menu options
    document.getElementById("resize").onclick = resize_canvas;

    /* load Data */
    data = new Data();

    init_game();
    animate(startTime);
}

/* 自訂右鍵選單 */
function right_click_menu(e) {
    // cancel default menu
    e.preventDefault();
    // move menu to mouse
    menu.style.left = 100 * e.clientX / self.innerWidth + '%';
    menu.style.top = 100 * e.clientY / self.innerHeight + '%';
    // show
    menu.style.display='block';
}

function hide_menu(e) {
    /* not right click */
    if (e.button != 2)
        menu.style.display = 'none'; // hide right click menu
}

function resize_menu() {
    const ratio = originR / window.devicePixelRatio;
    menu.style.fontSize = 16 * ratio + 'px';
}

function click_func(event) {
    /* not left click */
    if (event.button != 0)
        return;

    updateMouseXY(event);

    if (game == null) return;
    switch (game.state) {
        case gameState.title:
            start_game();
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
            if (game.month == game.MAXMONTH)
                to_result_button.check_press();
            else
                next_month_button.check_press();
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
    else if (game.state == gameState.title)
        draw_title();
    else
        draw_gaming();

    requestAnimationFrame(animate);
}

function draw_title() {
    context.fillStyle = 'rgb(0,0,0)';
    context.font = 108 * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    context.fillText("花札", SCREEN_W/2 * R, (SCREEN_H/2 - 108/2) * R);
    context.font = 81 * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    context.fillText("こいこい", SCREEN_W/2 * R, (SCREEN_H/2 + 81/2) * R);
    context.font = 40.5 * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    context.fillText("クリックして開始", SCREEN_W/2 * R, (SCREEN_H/2 + 108) * R);
}

/* draw canvas when gaming */
function draw_gaming() {
    // draw field background
    //context.fillStyle = 'darkred';
    //context.fillRect((Field.X(0) - (CARD_IMG_W - CARD_W) / 2) * R, (Field.Y(0) - (CARD_IMG_H - CARD_H) / 2) * R, (CARD_IMG_W + Field.X(FIELD_SPACE-1) - Field.X(0)) * R, (CARD_IMG_H + Field.Y(FIELD_SPACE-1) - Field.Y(0)) * R);

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
        //if (card[c].px != DECK_P.x && card[c].py != DECK_P.y)
        card[movingCard[i]].draw();

    /* draw the information of this game */
    
    context.font = FONT_SIZE * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    // 幾月
    if (game.month_yaku)
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
    context.font = FONT_SIZE * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
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
        case gameState.koikoi_animation:
            draw_koikoi();
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

    /* init UI in game */
    let w, h;
    // 文
    w = 60, h = 35;
    score_panel[CPU] = new Button(5, 5, w, h, 5, '0文', 20);
    score_panel[PLR] = new Button(5, SCREEN_H-h-5, w, h, 5, '0文', 20);
    // the size of panel of decide koi
    w = 400, h = 200;
    koi_panel = new Button(SCREEN_W/2-w/2, SCREEN_H/2-h/2, w, h, 10);
    end_button = new Button(SCREEN_W/2-w/2+w/8-w/24, SCREEN_H/2 + h/8, w/3, h/4, 10, "あがり", 24, ()=>{player_win_month(PLR);}, 'lightgray');
    koi_button = new Button(SCREEN_W/2+w/2-w/8+w/24-w/3, SCREEN_H/2 + h/8, w/3, h/4, 10, "こいこい", 24, ()=>{koikoi(PLR);}, 'lightgray');
    // the size of banner of koi koi
    w = SCREEN_W + 20, h = 100;
    koikoi_banner = new Button(-10, SCREEN_H/2-h/2, w, h, 0, "こいこい", 52, null);
    // the size of the panel of showing yaku and score
    w = 400, h = 400;
    yaku_panel = new Button(SCREEN_W/2-w/2, SCREEN_H/2-h/2 - 50/2, w, h, 10);
    // the size of restart button
    w = 400, h = 50;
    next_month_button = new Button(SCREEN_W/2-w/2, yaku_panel.y+yaku_panel.h + 5, w, h, 10, '次の対局へ', 24, start_month);
    to_result_button = new Button(SCREEN_W/2-w/2, yaku_panel.y+yaku_panel.h + 5, w, h, 10, '対局結果へ', 24, result_game);
    // the size of  result panel
    w = 400, h = 480;
    result_panel = new Button(SCREEN_W/2-w/2, SCREEN_H/2-h/2, w, h, 10);
}

/* init new game */
function start_game() {
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
    const h = FONT_SIZE * (game.month_yaku ? 6 : 3) + 10;
    month_panel = new Button(5, SCREEN_H/2-h/2, w, h, 5);
    month_panel.vertical = true;

    // update data
    data.battleTime[game.MAXMONTH-1]++;

    /* 正式開始 */
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

//#region Guess Smaller Card from Two Cards

function start_guess() {
    guessing = true;

    let month = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    shuffle(month);
    guess_card[0] = new Card(month[0] * 4);
    guess_card[1] = new Card(month[11] * 4);
    guess_card[0].px = SCREEN_W/2 - CARD_SHOW_W * 2;
    guess_card[0].py = SCREEN_H/2-CARD_SHOW_H/2;
    guess_card[1].px = SCREEN_W/2 + CARD_SHOW_W;
    guess_card[1].py = SCREEN_H/2-CARD_SHOW_H/2;
    guess_text = '札を一枚選んでください';

    canvas.onmousedown = guess_click_func;
}

function draw_guess_card() {
    guess_card[0].draw_large();
    guess_card[1].draw_large();

    context.fillStyle = 'black';
    context.font = 36 * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
    context.fillText(guess_text, (SCREEN_W/2) * R, (SCREEN_H/2 - CARD_SHOW_H/2 - 36) * R);
}

function pointedGuessIndex() {
    if (mouse.x >= guess_card[0].px && mouse.x <= guess_card[0].px + CARD_SHOW_W &&
        mouse.y >= guess_card[0].py && mouse.y <= guess_card[0].py + CARD_SHOW_H)
        return 0;
    if (mouse.x >= guess_card[1].px && mouse.x <= guess_card[1].px + CARD_SHOW_W &&
        mouse.y >= guess_card[1].py && mouse.y <= guess_card[1].py + CARD_SHOW_H)
        return 1;
    return -1;
}

function check_guess_result(mouse) {
    if (mouse.x >= guess_card[0].px && mouse.x <= guess_card[0].px + CARD_SHOW_W &&
        mouse.y >= guess_card[0].py && mouse.y <= guess_card[0].py + CARD_SHOW_H)
        return (guess_card[0].ID < guess_card[1].ID);
    if (mouse.x >= guess_card[1].px && mouse.x <= guess_card[1].px + CARD_SHOW_W &&
        mouse.y >= guess_card[1].py && mouse.y <= guess_card[1].py + CARD_SHOW_H)
        return (guess_card[1].ID < guess_card[0].ID);
    return false;
}

function guess_click_func(e) {
    /* not left click */
    if (e.button != 0)
        return;
    updateMouseXY(e);
    let i = pointedGuessIndex();
    console.log(i);
    if (i >= 0)
    {
        guess_result = check_guess_result(mouse);
        console.log(guess_result);
        startTime = performance.now();
        time_func = flip_guess_card(i);
        next_func = function (time) {
            guess_text = (guess_result ? 'あなた' : '相手') + 'が親になりました';
            
            next_func = function (time) {
                endAnimation();
                guessing = false;
                after_guess();
            }

            /* draw month under the two guess cards */
            context.fillStyle = 'black';
            context.font = 36 * R + "px 'Yuji Syuku', 'Microsoft YaHei', sans-serif";
            context.fillText(NUMBER[Math.floor(guess_card[0].ID / 4)+1]+'月', (guess_card[0].px + CARD_SHOW_W/2) * R, (guess_card[0].py + CARD_SHOW_H + 36) * R);
            context.fillText(NUMBER[Math.floor(guess_card[1].ID / 4)+1]+'月', (guess_card[1].px + CARD_SHOW_W/2) * R, (guess_card[1].py + CARD_SHOW_H + 36) * R);
            
            if (time - startTime >= GUESS_WAIT) {
                startTime = null;
                time_func = next_func;
            }
        }

        canvas.onmousedown = click_func;
    }
}

function flip_guess_card(i) {
    return function(time) {
        const deltaTime = (time - startTime) / FLIP_TIME;
        if (deltaTime >= 1) {
            guess_card[i].scaleX = 1;
            guess_card[Number(!i)].scaleX = 1;
            startTime = null;
            time_func = next_func;
        } else if (deltaTime >= 0.5) {
            guess_card[i].scaleX = 1;
            guess_card[Number(!i)].scaleX = Math.abs(easeOutQuad(time-startTime-FLIP_TIME*0.5, 1, -4*(deltaTime-0.5), FLIP_TIME*0.5));
            if (deltaTime >= 0.75)
                guess_card[Number(!i)].back = false;
        } else {
            guess_card[i].scaleX = Math.abs(easeOutQuad(time-startTime, 1, -4*deltaTime, FLIP_TIME*0.5));
            if (deltaTime >= 0.25)
                guess_card[i].back = false;
        }
    }
}

//#endregion