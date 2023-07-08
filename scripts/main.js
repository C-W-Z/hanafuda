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
    R = window.devicePixelRatio;
    canvas.width = SCREEN_W * R;
    canvas.height = SCREEN_H * R;
    // auto adaptive size by height
    scaleRate = self.innerHeight / SCREEN_H;
    canvas.style.width = SCREEN_W * scaleRate + 'px';
    canvas.style.height = SCREEN_H * scaleRate + 'px';
    context = canvas.getContext('2d');
    // text settings
    context.textAlign = "center";
    context.textBaseline = 'middle';
    // control settings
    canvas.onmousedown = click_func;
    document.addEventListener('keydown', keydown_func);

    init_game();
    animate(startTime);
}

function click_func(event) {
    /* must be left click */
    if (event.button != 0) return;
    updateMouseXY(event);

    if (game == null) return;
    switch (game.state) {
        case gameState.title:
            game.state = gameState.start;
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
            /* resize screen */
            R = window.devicePixelRatio;
            canvas.width = SCREEN_W * R;
            canvas.height = SCREEN_H * R;
            // auto adaptive size by height
            scaleRate = self.innerHeight / SCREEN_H;
            canvas.style.width = SCREEN_W * scaleRate + 'px';
            canvas.style.height = SCREEN_H * scaleRate + 'px';
            context.textAlign = "center";
            context.textBaseline = 'middle';
            break;
    
        default:
            break;
    }
}

// get mouse coorfinates
function updateMouseXY(event) {
    var rect = event.target.getBoundingClientRect();
    if (scaleRate > 0) {
        mouse.x = (event.clientX - rect.left) / scaleRate;
        mouse.y = (event.clientY - rect.top ) / scaleRate;
    }
}

function pointedFieldIndex() {
    if (card == null) return -1;
    for (let i = 0; i < FIELD_SPACE; i++)
        if (mouse.x >= Field.X(i) && mouse.x <= Field.X(i) + CARD_W &&
            mouse.y >= Field.Y(i) && mouse.y <= Field.Y(i) + CARD_H)
            return i;
    return -1;
}

function pointedPlayerHandIndex() {
    if (card == null) return -1;
    for (let i = 0; i < player[PLR].hand.length; i++)
        if (mouse.x >= card[player[PLR].hand[i]].px && mouse.x <= card[player[PLR].hand[i]].px + CARD_W &&
            mouse.y >= card[player[PLR].hand[i]].py && mouse.y <= card[player[PLR].hand[i]].py + CARD_H)
            return i;
    return -1;
}

function animate(time) {
    if (!startTime) // it's the first frame
        startTime = time || performance.now();

    // 清除整個canvas畫面
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    if (time_func != null)
        time_func(time);

    // 重畫整個畫面
    if (game.state == gameState.title)
        draw_title();
    else
        draw_gaming();

    requestAnimationFrame(animate);
}

function endAnimation() {
    time_func = null;
    next_func = null;
    while (movingCard.length > 0)
        movingCard.pop();
}

function draw_title() {
    context.textAlign = "center";
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
    context.lineWidth = 2 * R;
    context.fillStyle = 'black';
    context.strokeStyle = 'black';
    if (game.MAXMONTH >= 10)
        context.fillText(NUMBER[10], (FONT_SIZE/2+1) * R, (SCREEN_H/2 - FONT_SIZE*3 + (FONT_SIZE * (0+0.5))) * R);
    context.fillText(NUMBER[game.MAXMONTH%10], (FONT_SIZE/2+1) * R, (SCREEN_H/2 - FONT_SIZE*2 + (FONT_SIZE * (0+0.5))) * R);
    context.fillText("月"                 , (FONT_SIZE/2+1) * R, (SCREEN_H/2 - FONT_SIZE*2 + (FONT_SIZE * (1+0.5))) * R);
    context.strokeRect(0, (SCREEN_H/2 - FONT_SIZE*3) * R, (FONT_SIZE+2) * R, (FONT_SIZE*3) * R);
    // 幾戰目
    if (game.month >= 10)
        context.fillText(NUMBER[10], (FONT_SIZE/2+1) * R, (SCREEN_H/2 + (FONT_SIZE * (0+0.5))) * R);
    context.fillText(NUMBER[game.month%10], (FONT_SIZE/2+1) * R, (SCREEN_H/2 + (FONT_SIZE * (1+0.5))) * R);
    context.fillText("戦"              , (FONT_SIZE/2+1) * R, (SCREEN_H/2 + (FONT_SIZE * (2+0.5))) * R);
    context.fillText("目"              , (FONT_SIZE/2+1) * R, (SCREEN_H/2 + (FONT_SIZE * (3+0.5))) * R);
    context.strokeRect(0, SCREEN_H/2 * R, (FONT_SIZE+2) * R, (FONT_SIZE * 4) * R);

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
    /* init game data */
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
    end_button = new Button(SCREEN_W/2-w/2+w/8-w/24, SCREEN_H/2 + h/8, w/3, h/4, 10, "あがり", 24, ()=>{player_win(PLR);}, 'lightgray');
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

    /* 正式開始 */
    // 決定親權 (0:player, 1:cpu)
    game.first = Math.floor(Math.random() * 2);
    start_month();
}

function start_month() {
    /* init month */
    // init deck
    deck = new Array(CARD_NUM);
    for (let i = 0; i < CARD_NUM; i++)
        deck[i] = i;

    // reset cards
    for (let i = 0; i < CARD_NUM; i++)
        card[i].reset_month();
    
    // reset field
    field.reset_month();;

    // reset players
    player[PLR].reset_month();
    player[CPU].reset_month();

    // reset game info
    game.reset_month();
    game.month++;
    game.first = Number(!game.first);

    // reset animation
    endAnimation();

    // shuffle
    shuffle(deck);
    // 發牌
    deal_cards(game.first);
}